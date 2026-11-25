import taskStorage from './taskStorage';
import { storage } from './workspaceAwareStorage';
import { notesStorage } from './notesStorage';
import workspaceStorage from './workspaceStorage';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'can', 'may', 'might', 'i', 'me', 'my', 'mine', 'you', 'your', 'we', 'our',
    'it', 'its', 'this', 'that', 'these', 'those', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'about', 'from', 'by', 'as', 'into', 'what', 'which', 'who',
    'where', 'when', 'how', 'show', 'list', 'find', 'search', 'get', 'tell',
    'give', 'all', 'any', 'some', 'saved', 'data', 'workspace', 'please', 'have'
]);

const gatherWorkspaceData = async (workspaceId) => {
    const activeWsId = workspaceId || workspaceStorage.getCurrentWorkspaceId() || 'ws-personal';
    const [links, projects, blogPosts, prompts, videos, workspaces, currentWorkspace] = await Promise.all([
        storage.links.getAll(),
        storage.projects.getAll(),
        storage.blog.getAll(),
        storage.prompts.getAll(),
        storage.videos.getAll(),
        workspaceStorage.getAll(),
        workspaceStorage.getCurrentWorkspace()
    ]);

    const tasks = taskStorage.getAllTasks(activeWsId);
    const notes = notesStorage.get();

    return {
        workspaceId: activeWsId,
        currentWorkspace,
        workspaces,
        links,
        projects,
        blogPosts,
        prompts,
        videos,
        tasks,
        notes
    };
};

const extractKeywords = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word));
};

const formatDateShort = (iso) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
};

const normalizeUrl = (rawUrl) => {
    const trimmed = rawUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const extractDomainName = (url) => {
    try {
        const u = new URL(normalizeUrl(url));
        return u.hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

const runLocalAssistant = async (message, workspaceId) => {
    const raw = message.trim();
    const lower = raw.toLowerCase();
    const data = await gatherWorkspaceData(workspaceId);
    const wsName = data.currentWorkspace?.name || 'Personal';

    // 0. Bare "add" / "create" / "new" prompt
    if (/^(add|create|new|save)$/i.test(raw)) {
        return {
            text: `What would you like to add to "${wsName}"?\n\nTry:\n• "add task Buy groceries"\n• "add link https://react.dev React Docs"\n• "add project Portfolio Website"\n• "add blog Learning TypeScript"\n• "add prompt Code Review: Review this PR"\n• "add note Call Alex at 5pm"`,
            actions: []
        };
    }

    // 1. Add Link: "add link <url> [name]" or "save link <url> [name]"
    const addLinkMatch = raw.match(/^(?:add|save|create|new)\s+(?:a\s+)?link:?\s+(\S+)(?:\s+(.+))?$/i);
    if (addLinkMatch) {
        const url = normalizeUrl(addLinkMatch[1]);
        const name = (addLinkMatch[2] || extractDomainName(url)).trim();
        const created = await storage.links.add({ name, url, category: 'Website', description: '' });
        return {
            text: `Saved link "${name}" (${url}) to ${wsName}.`,
            actions: [{ type: 'add_link', data: created }]
        };
    }

    // 2. Add Project: "add project <name>"
    const addProjectMatch = raw.match(/^(?:add|create|new|start)\s+(?:a\s+)?project:?\s+(.+)$/i);
    if (addProjectMatch && addProjectMatch[1].trim()) {
        const name = addProjectMatch[1].trim();
        const created = await storage.projects.add({ name, description: '', status: 'In Progress', technologies: '' });
        return {
            text: `Created project "${created.name}" in ${wsName}.`,
            actions: [{ type: 'add_project', data: created }]
        };
    }

    // 3. Add Blog Post: "add blog <title>" / "write post <title>"
    const addBlogMatch = raw.match(/^(?:add|create|new|write)\s+(?:a\s+)?(?:blog(?:\s+post)?|post|article):?\s+(.+)$/i);
    if (addBlogMatch && addBlogMatch[1].trim()) {
        const title = addBlogMatch[1].trim();
        const created = await storage.blog.add({ title, content: '', tags: [] });
        return {
            text: `Created blog post "${created.title}" in ${wsName}.`,
            actions: [{ type: 'add_blog', data: created }]
        };
    }

    // 4. Add Prompt: "add prompt <title>: <content>" or "add prompt <title>"
    const addPromptMatch = raw.match(/^(?:add|save|create|new)\s+(?:a\s+)?prompt:?\s+(.+)$/i);
    if (addPromptMatch && addPromptMatch[1].trim()) {
        const body = addPromptMatch[1].trim();
        const [titlePart, ...rest] = body.split(/[:\-]\s+/);
        const title = titlePart.trim();
        const content = rest.length > 0 ? rest.join(': ').trim() : title;
        const created = await storage.prompts.add({ title, content, category: 'Other' });
        return {
            text: `Saved prompt "${created.title}" to ${wsName}.`,
            actions: [{ type: 'add_prompt', data: created }]
        };
    }

    // 5. Add Sticky Note: "add note <text>"
    const addNoteMatch = raw.match(/^(?:add|save|create|new)\s+(?:a\s+)?(?:sticky\s+)?note:?\s+(.+)$/i);
    if (addNoteMatch && addNoteMatch[1].trim()) {
        const content = addNoteMatch[1].trim();
        const created = notesStorage.add({ content });
        return {
            text: `Added sticky note: "${created.content}".`,
            actions: [{ type: 'add_note', data: created }]
        };
    }

    // 6. Add Task: "add task ...", "remind me to ...", "todo ...", or "add <text>"
    const addTaskMatch = raw.match(/^(?:add\s+(?:a\s+)?task:?|new\s+task:?|create\s+(?:a\s+)?task:?|remind\s+me\s+to|todo:?|add)\s+(.+)$/i);
    if (addTaskMatch && addTaskMatch[1].trim()) {
        const taskText = addTaskMatch[1].trim();
        const created = taskStorage.addTask({ text: taskText, category: 'personal', priority: 'medium' }, data.workspaceId);
        return {
            text: `Added task to ${wsName}: "${created.text}"`,
            actions: [{ type: 'add_task', data: created }]
        };
    }

    // 7. Complete Task: "complete task ...", "mark ... done", "finish ..."
    const completeMatch = raw.match(/^(?:complete|finish|done)\s+(?:task\s+)?(.+)$/i)
        || raw.match(/^mark\s+(.+?)\s+(?:as\s+)?(?:done|complete|completed)$/i);
    if (completeMatch && completeMatch[1].trim()) {
        const query = completeMatch[1].trim().toLowerCase();
        const target = data.tasks.find(t => !t.completed && t.text.toLowerCase().includes(query));
        if (target) {
            taskStorage.updateTask(target.id, { completed: true, completedAt: new Date().toISOString() }, data.workspaceId);
            return {
                text: `Marked "${target.text}" as completed!`,
                actions: [{ type: 'update_task', data: { id: target.id, updates: { completed: true } } }]
            };
        }
        return { text: `I couldn't find an open task matching "${completeMatch[1].trim()}".`, actions: [] };
    }

    // 8. Delete Items (task, link, project, blog, prompt, note)
    const deleteItemMatch = raw.match(/^(?:delete|remove)\s+(?:(task|link|project|blog|post|prompt|note)\s+)?(.+)$/i);
    if (deleteItemMatch && deleteItemMatch[2].trim()) {
        const itemType = (deleteItemMatch[1] || 'task').toLowerCase();
        const query = deleteItemMatch[2].trim().toLowerCase();

        if (itemType === 'task') {
            const target = data.tasks.find(t => t.text.toLowerCase().includes(query));
            if (target) {
                taskStorage.deleteTask(target.id, data.workspaceId);
                return { text: `Deleted task "${target.text}".`, actions: [{ type: 'delete_task', data: { id: target.id } }] };
            }
        } else if (itemType === 'link') {
            const target = data.links.find(l => (l.title || l.name || '').toLowerCase().includes(query));
            if (target) {
                await storage.links.delete(target.id);
                return { text: `Deleted link "${target.title || target.name}".`, actions: [{ type: 'delete_link', data: { id: target.id } }] };
            }
        } else if (itemType === 'project') {
            const target = data.projects.find(p => (p.name || '').toLowerCase().includes(query));
            if (target) {
                await storage.projects.delete(target.id);
                return { text: `Deleted project "${target.name}".`, actions: [{ type: 'delete_project', data: { id: target.id } }] };
            }
        } else if (itemType === 'blog' || itemType === 'post') {
            const target = data.blogPosts.find(b => (b.title || '').toLowerCase().includes(query));
            if (target) {
                await storage.blog.delete(target.id);
                return { text: `Deleted blog post "${target.title}".`, actions: [{ type: 'delete_blog', data: { id: target.id } }] };
            }
        } else if (itemType === 'prompt') {
            const target = data.prompts.find(p => (p.title || '').toLowerCase().includes(query));
            if (target) {
                await storage.prompts.delete(target.id);
                return { text: `Deleted prompt "${target.title}".`, actions: [{ type: 'delete_prompt', data: { id: target.id } }] };
            }
        } else if (itemType === 'note') {
            const target = data.notes.find(n => (n.content || '').toLowerCase().includes(query));
            if (target) {
                notesStorage.delete(target.id);
                return { text: `Deleted sticky note.`, actions: [{ type: 'delete_note', data: { id: target.id } }] };
            }
        }
        return { text: `No ${itemType} found matching "${deleteItemMatch[2].trim()}".`, actions: [] };
    }

    // 9. Greetings & Help
    if (/^(hi|hello|hey|namaste|help|what can you do|start)[\s!?]*$/i.test(raw)) {
        return {
            text: `Hi! I'm your offline ThoughtOS Assistant for "${wsName}". No API key needed!\n\nYou can ask me:\n• "Summary" — see everything saved\n• "Show my links / projects / blog / prompts / videos / tasks"\n• "Find <keyword>" — search across all saved data\n• "Add task <title>" or "Add link <url> <name>"`,
            actions: []
        };
    }

    // 10. Workspace Summary / Overview
    if (/\b(summary|overview|stats|status|everything|all data|saved data|how many|count)\b/i.test(lower)) {
        const pending = data.tasks.filter(t => !t.completed).length;
        const completed = data.tasks.filter(t => t.completed).length;
        const total = data.links.length + data.projects.length + data.blogPosts.length + data.prompts.length + data.videos.length;

        return {
            text: `Workspace "${wsName}" Summary (${total} saved items):\n• Links: ${data.links.length}\n• Projects: ${data.projects.length}\n• Blog Posts: ${data.blogPosts.length}\n• Prompts: ${data.prompts.length}\n• Videos: ${data.videos.length}\n• Tasks: ${pending} pending, ${completed} completed\n• Sticky Notes: ${data.notes.length}`,
            actions: []
        };
    }

    // 11. Category-Specific Queries
    if (/\b(link|links|bookmark|bookmarks|url|urls)\b/i.test(lower) && extractKeywords(raw).every(k => ['link', 'links', 'bookmark', 'bookmarks', 'url', 'urls'].includes(k))) {
        if (data.links.length === 0) return { text: `You don't have any saved links in "${wsName}" yet.`, actions: [] };
        const list = data.links.slice(0, 8).map(l => `• ${l.title || l.name} (${l.category || 'Other'}) — ${l.url}`).join('\n');
        return { text: `Saved Links (${data.links.length}):\n${list}`, actions: [] };
    }

    if (/\b(project|projects)\b/i.test(lower) && extractKeywords(raw).every(k => ['project', 'projects'].includes(k))) {
        if (data.projects.length === 0) return { text: `No projects saved in "${wsName}" yet.`, actions: [] };
        const list = data.projects.slice(0, 8).map(p => `• ${p.name} [${p.status || 'In Progress'}]${p.technologies ? ` — ${p.technologies}` : ''}`).join('\n');
        return { text: `Saved Projects (${data.projects.length}):\n${list}`, actions: [] };
    }

    if (/\b(blog|blogs|post|posts|article|articles|journal)\b/i.test(lower) && extractKeywords(raw).every(k => ['blog', 'blogs', 'post', 'posts', 'article', 'articles', 'journal'].includes(k))) {
        if (data.blogPosts.length === 0) return { text: `No blog posts saved in "${wsName}" yet.`, actions: [] };
        const list = data.blogPosts.slice(0, 8).map(b => `• ${b.title} (${formatDateShort(b.created_at || b.createdAt)})`).join('\n');
        return { text: `Saved Blog Posts (${data.blogPosts.length}):\n${list}`, actions: [] };
    }

    if (/\b(prompt|prompts)\b/i.test(lower) && extractKeywords(raw).every(k => ['prompt', 'prompts'].includes(k))) {
        if (data.prompts.length === 0) return { text: `No prompts saved in "${wsName}" yet.`, actions: [] };
        const list = data.prompts.slice(0, 8).map(p => `• ${p.title} [${p.category || 'General'}]`).join('\n');
        return { text: `Saved Prompts (${data.prompts.length}):\n${list}`, actions: [] };
    }

    if (/\b(video|videos|youtube|watch)\b/i.test(lower) && extractKeywords(raw).every(k => ['video', 'videos', 'youtube', 'watch'].includes(k))) {
        if (data.videos.length === 0) return { text: `No videos saved in "${wsName}" yet.`, actions: [] };
        const list = data.videos.slice(0, 8).map(v => `• ${v.title}`).join('\n');
        return { text: `Saved Videos (${data.videos.length}):\n${list}`, actions: [] };
    }

    if (/\b(task|tasks|todo|todos|to-do|pending|completed)\b/i.test(lower)) {
        if (data.tasks.length === 0) return { text: `No tasks in "${wsName}" yet. Say "add task <title>" to create one!`, actions: [] };
        const showCompletedOnly = /\bcompleted\b/i.test(lower) && !/\bpending\b/i.test(lower);
        const showPendingOnly = /\bpending\b/i.test(lower) && !/\bcompleted\b/i.test(lower);

        const filtered = data.tasks.filter(t => {
            if (showCompletedOnly) return t.completed;
            if (showPendingOnly) return !t.completed;
            return true;
        });

        if (filtered.length === 0) {
            return { text: showPendingOnly ? 'All tasks are completed!' : 'No matching tasks found.', actions: [] };
        }

        const list = filtered.slice(0, 10).map(t => `${t.completed ? '✓' : '○'} ${t.text} [${t.priority || 'medium'}]`).join('\n');
        return { text: `Tasks (${filtered.length}):\n${list}`, actions: [] };
    }

    if (/\b(note|notes|sticky)\b/i.test(lower) && extractKeywords(raw).every(k => ['note', 'notes', 'sticky'].includes(k))) {
        if (data.notes.length === 0) return { text: `You have no sticky notes saved yet.`, actions: [] };
        const list = data.notes.slice(0, 8).map(n => `• ${n.content || '(empty note)'}`).join('\n');
        return { text: `Sticky Notes (${data.notes.length}):\n${list}`, actions: [] };
    }

    if (/\b(workspaces)\b/i.test(lower)) {
        const list = data.workspaces.map(w => `• ${w.name}${w.id === data.workspaceId ? ' (Active)' : ''}`).join('\n');
        return { text: `Your Workspaces (${data.workspaces.length}):\n${list}`, actions: [] };
    }

    // 12. Full-Text Keyword Search Across All Saved Data
    const keywords = extractKeywords(raw);
    if (keywords.length > 0) {
        const matches = [];

        const scoreItem = (fields) => {
            const haystack = fields.filter(Boolean).join(' ').toLowerCase();
            return keywords.reduce((score, kw) => score + (haystack.includes(kw) ? 1 : 0), 0);
        };

        data.links.forEach(l => {
            const s = scoreItem([l.title, l.name, l.url, l.category, l.description]);
            if (s > 0) matches.push({ score: s, label: `Link: ${l.title || l.name} — ${l.url}` });
        });
        data.projects.forEach(p => {
            const s = scoreItem([p.name, p.description, p.technologies, p.status, p.githubUrl, p.liveUrl]);
            if (s > 0) matches.push({ score: s, label: `Project: ${p.name} [${p.status || 'In Progress'}]` });
        });
        data.blogPosts.forEach(b => {
            const s = scoreItem([b.title, b.content, Array.isArray(b.tags) ? b.tags.join(' ') : b.tags, b.category]);
            if (s > 0) matches.push({ score: s, label: `Blog: ${b.title}` });
        });
        data.prompts.forEach(p => {
            const s = scoreItem([p.title, p.content, p.prompt, p.category]);
            if (s > 0) matches.push({ score: s, label: `Prompt: ${p.title} [${p.category || 'General'}]` });
        });
        data.videos.forEach(v => {
            const s = scoreItem([v.title, v.description, v.notes, v.url]);
            if (s > 0) matches.push({ score: s, label: `Video: ${v.title}` });
        });
        data.tasks.forEach(t => {
            const s = scoreItem([t.text, t.category, t.notes, Array.isArray(t.tags) ? t.tags.join(' ') : t.tags]);
            if (s > 0) matches.push({ score: s, label: `Task (${t.completed ? 'Done' : 'Pending'}): ${t.text}` });
        });
        data.notes.forEach(n => {
            const s = scoreItem([n.content]);
            if (s > 0) matches.push({ score: s, label: `Note: ${(n.content || '').slice(0, 60)}` });
        });

        matches.sort((a, b) => b.score - a.score);

        if (matches.length > 0) {
            const top = matches.slice(0, 8).map(m => `• ${m.label}`).join('\n');
            return {
                text: `Found ${matches.length} matching item${matches.length === 1 ? '' : 's'} for "${keywords.join(' ')}":\n${top}`,
                actions: []
            };
        }

        return {
            text: `I searched all your saved data in "${wsName}" for "${keywords.join(' ')}" and found no matches.\n\nTry asking for "summary", "links", "projects", "tasks", or "add task <title>".`,
            actions: []
        };
    }

    return {
        text: `I'm running in Local Mode (no API key required). Ask me for "summary", "my tasks", "my projects", "find <keyword>", or "add task <title>".`,
        actions: []
    };
};

export const aiService = {
    /**
     * Chat with ThoughtOS Assistant.
     * Uses Gemini if a valid API key is configured, and seamlessly falls back to the offline Local Data Assistant.
     */
    chat: async (message, history = [], workspaceId) => {
        try {
            if (!GEMINI_API_KEY || GEMINI_API_KEY.trim().length < 15) {
                return await runLocalAssistant(message, workspaceId);
            }

            const data = await gatherWorkspaceData(workspaceId);
            const context = {
                currentDate: new Date().toISOString(),
                workspace: data.currentWorkspace?.name || 'Personal',
                counts: {
                    links: data.links.length,
                    projects: data.projects.length,
                    blogPosts: data.blogPosts.length,
                    prompts: data.prompts.length,
                    videos: data.videos.length,
                    tasks: data.tasks.length,
                    notes: data.notes.length
                },
                tasks: data.tasks.slice(0, 15),
                links: data.links.slice(0, 10).map(l => ({ title: l.title || l.name, url: l.url, category: l.category })),
                projects: data.projects.slice(0, 10).map(p => ({ name: p.name, status: p.status, technologies: p.technologies })),
                blogPosts: data.blogPosts.slice(0, 10).map(b => ({ title: b.title })),
                prompts: data.prompts.slice(0, 10).map(p => ({ title: p.title, category: p.category })),
                videos: data.videos.slice(0, 10).map(v => ({ title: v.title }))
            };

            const systemPrompt = `
                You are ThoughtOS Assistant, a friendly workspace manager.
                You have access to the user's saved local workspace data below.
                CURRENT WORKSPACE CONTEXT:
                ${JSON.stringify(context)}

                CAPABILITIES:
                1. add_task(text, category, priority, dueDate): Adds a task.
                2. delete_task(id): Deletes a task.
                3. update_task(id, updates): Updates a task (e.g., complete it).

                If the user asks to perform a task action, include ACTION: {"type": "...", "data": {...}} at the end.
            `;

            const body = {
                contents: [
                    ...history,
                    { role: 'user', parts: [{ text: message }] }
                ],
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                console.warn('Gemini API unavailable, falling back to Local Assistant:', response.status);
                return await runLocalAssistant(message, workspaceId);
            }

            const result = await response.json();
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) {
                return await runLocalAssistant(message, workspaceId);
            }

            return parseResponse(textResponse, workspaceId);
        } catch (error) {
            console.warn('AI Service falling back to Local Assistant:', error);
            return await runLocalAssistant(message, workspaceId);
        }
    }
};

function parseResponse(text, workspaceId) {
    const actionMatch = text.match(/ACTION:\s*({.*})/s);
    const actions = [];
    const cleanText = text.replace(/ACTION:\s*{.*}/s, '').trim();

    if (actionMatch) {
        try {
            const action = JSON.parse(actionMatch[1]);
            actions.push(action);
            executeAction(action, workspaceId);
        } catch (e) {
            console.error('Failed to parse AI action:', e);
        }
    }

    return { text: cleanText, actions };
}

function executeAction(action, workspaceId) {
    switch (action.type) {
        case 'add_task':
            taskStorage.addTask(action.data, workspaceId);
            break;
        case 'delete_task':
            taskStorage.deleteTask(action.data.id, workspaceId);
            break;
        case 'update_task':
            taskStorage.updateTask(action.data.id, action.data.updates, workspaceId);
            break;
        default:
            console.warn('Unknown AI action:', action.type);
    }
}

// LocalStorage-backed workspace-aware storage
import workspaceStorage from './workspaceStorage';
import * as baseStorage from './storage';

// Helper to get current workspace ID
const getCurrentWorkspaceId = () => {
    return workspaceStorage.getCurrentWorkspaceId() || 'ws-personal';
};

const matchesWorkspace = (item, workspaceId) => {
    if (!workspaceId) return true;
    // Items created without a workspace_id belong to the default personal workspace
    if (!item.workspace_id) return workspaceId === 'ws-personal';
    return item.workspace_id === workspaceId;
};

// Workspace-aware Links Management
export const linksStorage = {
    getAll: async () => {
        const workspaceId = getCurrentWorkspaceId();
        const all = await baseStorage.linksStorage.getAll();
        return all.filter(item => matchesWorkspace(item, workspaceId));
    },

    add: async (link) => {
        const workspaceId = getCurrentWorkspaceId();
        return await baseStorage.linksStorage.add({
            ...link,
            workspace_id: workspaceId
        });
    },

    update: baseStorage.linksStorage.update,
    delete: baseStorage.linksStorage.delete,

    getByCategory: async (category) => {
        const all = await linksStorage.getAll();
        return all.filter(link => link.category === category);
    }
};

// Workspace-aware Projects Management
export const projectsStorage = {
    getAll: async () => {
        const workspaceId = getCurrentWorkspaceId();
        const all = await baseStorage.projectsStorage.getAll();
        return all.filter(item => matchesWorkspace(item, workspaceId));
    },

    add: async (project) => {
        const workspaceId = getCurrentWorkspaceId();
        return await baseStorage.projectsStorage.add({
            ...project,
            workspace_id: workspaceId
        });
    },

    update: baseStorage.projectsStorage.update,
    delete: baseStorage.projectsStorage.delete
};

// Workspace-aware Blog Management
export const blogStorage = {
    getAll: async () => {
        const workspaceId = getCurrentWorkspaceId();
        const all = await baseStorage.blogStorage.getAll();
        return all.filter(item => matchesWorkspace(item, workspaceId));
    },

    add: async (post) => {
        const workspaceId = getCurrentWorkspaceId();
        return await baseStorage.blogStorage.add({
            ...post,
            workspace_id: workspaceId
        });
    },

    update: baseStorage.blogStorage.update,
    delete: baseStorage.blogStorage.delete,

    getByTag: async (tag) => {
        const all = await blogStorage.getAll();
        const lower = tag.toLowerCase();
        return all.filter(post => {
            if (Array.isArray(post.tags)) {
                return post.tags.some(t => String(t).toLowerCase().includes(lower));
            }
            return String(post.tags || '').toLowerCase().includes(lower);
        });
    }
};

// Workspace-aware Prompts Management
export const promptsStorage = {
    getAll: async () => {
        const workspaceId = getCurrentWorkspaceId();
        const all = await baseStorage.promptsStorage.getAll();
        return all.filter(item => matchesWorkspace(item, workspaceId));
    },

    add: async (prompt) => {
        const workspaceId = getCurrentWorkspaceId();
        return await baseStorage.promptsStorage.add({
            ...prompt,
            workspace_id: workspaceId
        });
    },

    update: baseStorage.promptsStorage.update,
    delete: baseStorage.promptsStorage.delete,

    getByCategory: async (category) => {
        const all = await promptsStorage.getAll();
        return all.filter(prompt => prompt.category === category);
    }
};

// Workspace-aware Videos Management
export const videosStorage = {
    getAll: async () => {
        const workspaceId = getCurrentWorkspaceId();
        const all = await baseStorage.videosStorage.getAll();
        return all.filter(item => matchesWorkspace(item, workspaceId));
    },

    add: async (video) => {
        const workspaceId = getCurrentWorkspaceId();
        return await baseStorage.videosStorage.add({
            ...video,
            workspace_id: workspaceId
        });
    },

    update: baseStorage.videosStorage.update,
    delete: baseStorage.videosStorage.delete
};

// Theme Management (unchanged)
export const themeStorage = baseStorage.themeStorage;

// Export all for convenience
export const storage = {
    links: linksStorage,
    projects: projectsStorage,
    blog: blogStorage,
    prompts: promptsStorage,
    videos: videosStorage,
    theme: themeStorage,
    workspace: workspaceStorage
};

export default storage;

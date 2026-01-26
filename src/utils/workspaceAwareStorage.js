// Enhanced storage with workspace support
// This wraps the existing storage and adds workspace filtering
import { supabase } from './supabaseClient';
import workspaceStorage from './workspaceStorage';
import * as baseStorage from './storage';

// Helper to get current workspace ID
const getCurrentWorkspaceId = () => {
    return workspaceStorage.getCurrentWorkspaceId();
};

// Helper to get current user ID
const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
};

// Workspace-aware Links Management
export const linksStorage = {
    getAll: async () => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.linksStorage.getAll();

            const { data, error } = await supabase
                .from('links')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(link => ({
                ...link,
                name: link.title
            }));
        } catch (error) {
            console.error('Error fetching links:', error);
            return [];
        }
    },

    add: async (link) => {
        try {
            const userId = await getCurrentUserId();
            const workspaceId = getCurrentWorkspaceId();
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('links')
                .insert([{
                    title: link.name,
                    url: link.url,
                    category: link.category,
                    description: link.description,
                    user_id: userId,
                    workspace_id: workspaceId
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding link:', error);
            throw error;
        }
    },

    update: baseStorage.linksStorage.update,
    delete: baseStorage.linksStorage.delete,
    getByCategory: async (category) => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.linksStorage.getByCategory(category);

            const { data, error } = await supabase
                .from('links')
                .select('*')
                .eq('category', category)
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching links by category:', error);
            return [];
        }
    }
};

// Workspace-aware Projects Management
export const projectsStorage = {
    getAll: async () => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.projectsStorage.getAll();

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(project => ({
                ...project,
                githubUrl: project.github_url,
                liveUrl: project.live_url
            }));
        } catch (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
    },

    add: async (project) => {
        try {
            const userId = await getCurrentUserId();
            const workspaceId = getCurrentWorkspaceId();
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    name: project.name,
                    description: project.description,
                    github_url: project.githubUrl,
                    live_url: project.liveUrl,
                    technologies: project.technologies,
                    status: project.status,
                    user_id: userId,
                    workspace_id: workspaceId
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding project:', error);
            throw error;
        }
    },

    update: baseStorage.projectsStorage.update,
    delete: baseStorage.projectsStorage.delete
};

// Workspace-aware Blog Management
export const blogStorage = {
    getAll: async () => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.blogStorage.getAll();

            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(post => ({
                ...post,
                createdAt: post.created_at
            }));
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
    },

    add: async (post) => {
        try {
            const userId = await getCurrentUserId();
            const workspaceId = getCurrentWorkspaceId();
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('blog_posts')
                .insert([{
                    ...post,
                    user_id: userId,
                    workspace_id: workspaceId
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding blog post:', error);
            throw error;
        }
    },

    update: baseStorage.blogStorage.update,
    delete: baseStorage.blogStorage.delete,
    getByTag: async (tag) => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.blogStorage.getByTag(tag);

            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .ilike('tags', `%${tag}%`)
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching blog posts by tag:', error);
            return [];
        }
    }
};

// Workspace-aware Prompts Management
export const promptsStorage = {
    getAll: async () => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.promptsStorage.getAll();

            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching prompts:', error);
            return [];
        }
    },

    add: async (prompt) => {
        try {
            const userId = await getCurrentUserId();
            const workspaceId = getCurrentWorkspaceId();
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('prompts')
                .insert([{
                    ...prompt,
                    user_id: userId,
                    workspace_id: workspaceId
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding prompt:', error);
            throw error;
        }
    },

    update: baseStorage.promptsStorage.update,
    delete: baseStorage.promptsStorage.delete,
    getByCategory: async (category) => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.promptsStorage.getByCategory(category);

            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('category', category)
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching prompts by category:', error);
            return [];
        }
    }
};

// Workspace-aware Videos Management
export const videosStorage = {
    getAll: async () => {
        try {
            const workspaceId = getCurrentWorkspaceId();
            if (!workspaceId) return await baseStorage.videosStorage.getAll();

            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(video => ({
                ...video,
                videoId: video.video_id
            }));
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    },

    add: async (video) => {
        try {
            const userId = await getCurrentUserId();
            const workspaceId = getCurrentWorkspaceId();
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('videos')
                .insert([{
                    title: video.title,
                    url: video.url,
                    video_id: video.videoId,
                    description: video.description,
                    notes: video.notes,
                    user_id: userId,
                    workspace_id: workspaceId
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding video:', error);
            throw error;
        }
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

// Workspace management for multi-workspace support
import { supabase } from './supabaseClient';

// Helper to get current user ID
const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
};

// Workspace storage key for current workspace
const CURRENT_WORKSPACE_KEY = 'current_workspace_id';

export const workspaceStorage = {
    /**
     * Get all workspaces for the current user
     */
    getAll: async () => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .eq('user_id', userId)
                .or('is_archived.is.null,is_archived.eq.false')
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            return [];
        }
    },

    /**
     * Get archived workspaces for the current user
     */
    getArchived: async () => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .eq('user_id', userId)
                .eq('is_archived', true)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching archived workspaces:', error);
            return [];
        }
    },

    /**
     * Get a specific workspace by ID
     */
    getById: async (id) => {
        try {
            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching workspace:', error);
            return null;
        }
    },

    /**
     * Create a new workspace
     */
    create: async (workspace) => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('workspaces')
                .insert([{
                    user_id: userId,
                    name: workspace.name,
                    type: workspace.type || 'custom',
                    icon: workspace.icon || '📁',
                    color: workspace.color || '#6366f1',
                    is_default: workspace.is_default || false
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating workspace:', error);
            throw error;
        }
    },

    /**
     * Update a workspace
     */
    update: async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('workspaces')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating workspace:', error);
            throw error;
        }
    },

    /**
     * Delete a workspace
     */
    delete: async (id) => {
        try {
            const { error } = await supabase
                .from('workspaces')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Clear current workspace if it was deleted
            const currentId = workspaceStorage.getCurrentWorkspaceId();
            if (currentId === id) {
                localStorage.removeItem(CURRENT_WORKSPACE_KEY);
            }

            return true;
        } catch (error) {
            console.error('Error deleting workspace:', error);
            throw error;
        }
    },

    /**
     * Get the default workspace
     */
    getDefault: async () => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) return null;

            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .eq('user_id', userId)
                .eq('is_default', true)
                .single();

            if (error) {
                // If no default workspace exists, return the first one
                const workspaces = await workspaceStorage.getAll();
                return workspaces[0] || null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching default workspace:', error);
            return null;
        }
    },

    /**
     * Set a workspace as default
     */
    setDefault: async (id) => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');

            // First, unset all defaults for this user
            await supabase
                .from('workspaces')
                .update({ is_default: false })
                .eq('user_id', userId);

            // Then set the new default
            const { data, error } = await supabase
                .from('workspaces')
                .update({ is_default: true })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error setting default workspace:', error);
            throw error;
        }
    },

    /**
     * Get current workspace ID from localStorage
     */
    getCurrentWorkspaceId: () => {
        return localStorage.getItem(CURRENT_WORKSPACE_KEY);
    },

    /**
     * Set current workspace ID in localStorage
     */
    setCurrentWorkspaceId: (id) => {
        localStorage.setItem(CURRENT_WORKSPACE_KEY, id);
    },

    /**
     * Get current workspace object
     */
    getCurrentWorkspace: async () => {
        const id = workspaceStorage.getCurrentWorkspaceId();
        if (!id) {
            // If no current workspace, get default
            const defaultWorkspace = await workspaceStorage.getDefault();
            if (defaultWorkspace) {
                workspaceStorage.setCurrentWorkspaceId(defaultWorkspace.id);
                return defaultWorkspace;
            }
            return null;
        }
        return await workspaceStorage.getById(id);
    },

    /**
     * Initialize workspace for a new user
     * Creates a default "Personal" workspace
     */
    initializeForUser: async () => {
        try {
            const workspaces = await workspaceStorage.getAll();

            // If user already has workspaces, do nothing
            if (workspaces.length > 0) {
                return workspaces[0];
            }

            // Create default Personal workspace
            const personalWorkspace = await workspaceStorage.create({
                name: 'Personal',
                type: 'personal',
                icon: '👤',
                color: '#6366f1',
                is_default: true
            });

            workspaceStorage.setCurrentWorkspaceId(personalWorkspace.id);
            return personalWorkspace;
        } catch (error) {
            console.error('Error initializing workspace:', error);
            throw error;
        }
    },

    /**
     * Get preset workspace types
     */
    getPresetTypes: () => {
        return [
            { value: 'personal', label: 'Personal', icon: '👤', color: '#6366f1' },
            { value: 'youtube', label: 'YouTube', icon: '🎥', color: '#ff0000' },
            { value: 'college', label: 'College', icon: '🎓', color: '#10b981' },
            { value: 'custom', label: 'Custom', icon: '📁', color: '#8b5cf6' }
        ];
    }
};

export default workspaceStorage;

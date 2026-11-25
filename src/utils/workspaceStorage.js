// LocalStorage-backed workspace management for multi-workspace support

const WORKSPACES_KEY = 'thoughtos_workspaces';
const CURRENT_WORKSPACE_KEY = 'current_workspace_id';

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `ws_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

const readWorkspaces = () => {
    try {
        const raw = localStorage.getItem(WORKSPACES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error reading workspaces from localStorage:', error);
        return [];
    }
};

const writeWorkspaces = (workspaces) => {
    try {
        localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
        return true;
    } catch (error) {
        console.error('Error saving workspaces to localStorage:', error);
        return false;
    }
};

const ensureDefaultWorkspace = () => {
    let all = readWorkspaces();
    if (all.length === 0) {
        const personal = {
            id: 'ws-personal',
            name: 'Personal',
            type: 'personal',
            icon: '👤',
            color: '#e85d2c',
            is_default: true,
            is_archived: false,
            created_at: new Date().toISOString()
        };
        all = [personal];
        writeWorkspaces(all);
        localStorage.setItem(CURRENT_WORKSPACE_KEY, personal.id);
    }
    return all;
};

export const workspaceStorage = {
    /**
     * Get all active (non-archived) workspaces
     */
    getAll: async () => {
        const all = ensureDefaultWorkspace();
        return all.filter(w => !w.is_archived);
    },

    /**
     * Get archived workspaces
     */
    getArchived: async () => {
        const all = readWorkspaces();
        return all.filter(w => w.is_archived === true);
    },

    /**
     * Get a specific workspace by ID
     */
    getById: async (id) => {
        const all = ensureDefaultWorkspace();
        return all.find(w => w.id === id) || null;
    },

    /**
     * Create a new workspace
     */
    create: async (workspace) => {
        const all = ensureDefaultWorkspace();
        const newWorkspace = {
            id: generateId(),
            name: workspace.name,
            type: workspace.type || 'custom',
            icon: workspace.icon || '📁',
            color: workspace.color || '#6366f1',
            is_default: workspace.is_default || false,
            is_archived: false,
            created_at: new Date().toISOString()
        };

        if (newWorkspace.is_default) {
            all.forEach(w => { w.is_default = false; });
        }

        all.push(newWorkspace);
        writeWorkspaces(all);
        return newWorkspace;
    },

    /**
     * Update a workspace
     */
    update: async (id, updates) => {
        const all = ensureDefaultWorkspace();
        const index = all.findIndex(w => w.id === id);
        if (index === -1) throw new Error('Workspace not found');

        all[index] = {
            ...all[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        writeWorkspaces(all);
        return all[index];
    },

    /**
     * Delete a workspace
     */
    delete: async (id) => {
        const all = ensureDefaultWorkspace();
        const filtered = all.filter(w => w.id !== id);
        writeWorkspaces(filtered);

        const currentId = workspaceStorage.getCurrentWorkspaceId();
        if (currentId === id) {
            localStorage.removeItem(CURRENT_WORKSPACE_KEY);
        }
        return true;
    },

    /**
     * Get the default workspace
     */
    getDefault: async () => {
        const active = await workspaceStorage.getAll();
        return active.find(w => w.is_default) || active[0] || null;
    },

    /**
     * Set a workspace as default
     */
    setDefault: async (id) => {
        const all = ensureDefaultWorkspace();
        let updated = null;
        const next = all.map(w => {
            if (w.id === id) {
                updated = { ...w, is_default: true };
                return updated;
            }
            return { ...w, is_default: false };
        });
        writeWorkspaces(next);
        return updated;
    },

    /**
     * Get current workspace ID from localStorage
     */
    getCurrentWorkspaceId: () => {
        ensureDefaultWorkspace();
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
        if (id) {
            const found = await workspaceStorage.getById(id);
            if (found && !found.is_archived) {
                return found;
            }
        }
        const defaultWorkspace = await workspaceStorage.getDefault();
        if (defaultWorkspace) {
            workspaceStorage.setCurrentWorkspaceId(defaultWorkspace.id);
            return defaultWorkspace;
        }
        return null;
    },

    /**
     * Initialize workspace (ensures default Personal workspace exists)
     */
    initializeForUser: async () => {
        const all = await workspaceStorage.getAll();
        return all[0];
    },

    /**
     * Get preset workspace types
     */
    getPresetTypes: () => {
        return [
            { value: 'personal', label: 'Personal', icon: '👤', color: '#e85d2c' },
            { value: 'youtube', label: 'YouTube', icon: '🎥', color: '#dc2626' },
            { value: 'college', label: 'College', icon: '🎓', color: '#16a34a' },
            { value: 'custom', label: 'Custom', icon: '📁', color: '#111111' }
        ];
    }
};

export default workspaceStorage;

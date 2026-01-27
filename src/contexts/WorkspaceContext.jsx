import { createContext, useContext, useState, useEffect } from 'react';
import workspaceStorage from '../utils/workspaceStorage';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within WorkspaceProvider');
    }
    return context;
};

export const WorkspaceProvider = ({ children }) => {
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load workspaces on mount
    useEffect(() => {
        loadWorkspaces();
    }, []);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [currentWorkspace]);

    const loadWorkspaces = async () => {
        try {
            setLoading(true);
            const allWorkspaces = await workspaceStorage.getAll();
            setWorkspaces(allWorkspaces);

            // Get current workspace from localStorage or default
            const current = await workspaceStorage.getCurrentWorkspace();
            if (current) {
                setCurrentWorkspace(current);
                workspaceStorage.setCurrentWorkspaceId(current.id);
            } else if (allWorkspaces.length > 0) {
                // If no current workspace, use first one
                setCurrentWorkspace(allWorkspaces[0]);
                workspaceStorage.setCurrentWorkspaceId(allWorkspaces[0].id);
            }
        } catch (error) {
            console.error('Error loading workspaces:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchWorkspace = async (workspace) => {
        try {
            setCurrentWorkspace(workspace);
            workspaceStorage.setCurrentWorkspaceId(workspace.id);
            setIsSidebarOpen(false); // Close sidebar on switch

            // Trigger a custom event that components can listen to
            window.dispatchEvent(new CustomEvent('workspaceChanged', {
                detail: { workspace }
            }));
        } catch (error) {
            console.error('Error switching workspace:', error);
            throw error;
        }
    };

    const createWorkspace = async (workspaceData) => {
        try {
            const created = await workspaceStorage.create(workspaceData);
            await loadWorkspaces();
            await switchWorkspace(created);
            return created;
        } catch (error) {
            console.error('Error creating workspace:', error);
            throw error;
        }
    };

    const deleteWorkspace = async (workspaceId) => {
        try {
            await workspaceStorage.delete(workspaceId);
            await loadWorkspaces();

            // If deleted workspace was current, switch to first available
            if (currentWorkspace?.id === workspaceId && workspaces.length > 1) {
                const nextWorkspace = workspaces.find(w => w.id !== workspaceId);
                if (nextWorkspace) {
                    await switchWorkspace(nextWorkspace);
                }
            }
        } catch (error) {
            console.error('Error deleting workspace:', error);
            throw error;
        }
    };

    const value = {
        currentWorkspace,
        workspaces,
        loading,
        isSidebarOpen,
        setIsSidebarOpen,
        switchWorkspace,
        createWorkspace,
        deleteWorkspace,
        refreshWorkspaces: loadWorkspaces
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export default WorkspaceContext;

import { format, isSameDay, parseISO } from 'date-fns';

const CURRENT_WORKSPACE_KEY = 'current_workspace_id';

const getWorkspaceKey = (workspaceId, type = 'tasks') => `${type}_${workspaceId || localStorage.getItem(CURRENT_WORKSPACE_KEY) || 'default'}`;

export const taskStorage = {
    /**
     * Get tasks for a specific workspace and date
     */
    getTasks: (workspaceId, date = new Date()) => {
        const key = getWorkspaceKey(workspaceId, 'tasks');
        const tasks = JSON.parse(localStorage.getItem(key) || '[]');

        // Return tasks for the specific date or all tasks if needed
        if (!date) return tasks;

        return tasks.filter(task => {
            const taskDate = task.dueDate ? parseISO(task.dueDate) : parseISO(task.createdAt);
            return isSameDay(taskDate, date);
        });
    },

    /**
     * Get all tasks for the workspace
     */
    getAllTasks: (workspaceId) => {
        const key = getWorkspaceKey(workspaceId, 'tasks');
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    /**
     * Save tasks for the workspace
     */
    saveTasks: (tasks, workspaceId) => {
        const key = getWorkspaceKey(workspaceId, 'tasks');
        localStorage.setItem(key, JSON.stringify(tasks));
        // Trigger event for analytics update
        window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { workspaceId } }));
    },

    /**
     * Add a new task
     */
    addTask: (task, workspaceId) => {
        const tasks = taskStorage.getAllTasks(workspaceId);
        const newTask = {
            id: Date.now(),
            text: task.text,
            category: task.category || 'personal',
            priority: task.priority || 'medium',
            dueDate: task.dueDate || new Date().toISOString(),
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            tags: task.tags || [],
            notes: task.notes || '',
            subtasks: task.subtasks || [],
            recurring: task.recurring || { enabled: false },
            ...task
        };
        tasks.unshift(newTask);
        taskStorage.saveTasks(tasks, workspaceId);
        return newTask;
    },

    /**
     * Update an existing task
     */
    updateTask: (taskId, updates, workspaceId) => {
        const tasks = taskStorage.getAllTasks(workspaceId);
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        );
        taskStorage.saveTasks(updatedTasks, workspaceId);
        return updatedTasks.find(t => t.id === taskId);
    },

    /**
     * Delete a task
     */
    deleteTask: (taskId, workspaceId) => {
        const tasks = taskStorage.getAllTasks(workspaceId);
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        taskStorage.saveTasks(filteredTasks, workspaceId);
    },

    /**
     * Analytics: Get completion rate for a period
     */
    getStats: (workspaceId, daysLimit = 7) => {
        const tasks = taskStorage.getAllTasks(workspaceId);
        const now = new Date();
        const stats = [];

        for (let i = 0; i < daysLimit; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = format(date, 'yyyy-MM-dd');

            const dayTasks = tasks.filter(t => isSameDay(parseISO(t.createdAt), date));
            const completed = dayTasks.filter(t => t.completed).length;

            stats.push({
                date: dateStr,
                total: dayTasks.length,
                completed: completed,
                rate: dayTasks.length > 0 ? (completed / dayTasks.length) * 100 : 0
            });
        }

        return stats.reverse();
    },

    /**
     * Get current streak
     */
    getStreak: (workspaceId) => {
        const tasks = taskStorage.getAllTasks(workspaceId);
        let streak = 0;
        let date = new Date();

        while (true) {
            const dayTasks = tasks.filter(t => isSameDay(parseISO(t.createdAt), date));
            if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
                streak++;
                date.setDate(date.getDate() - 1);
            } else if (dayTasks.length === 0 && streak === 0) {
                // If today has no tasks, check yesterday
                date.setDate(date.getDate() - 1);
                const yesterdayTasks = tasks.filter(t => isSameDay(parseISO(t.createdAt), date));
                if (yesterdayTasks.length === 0) break; // Gap in history
                // Continue checking yesterday if today was empty but yesterday wasn't
            } else {
                break;
            }
        }
        return streak;
    }
};

export default taskStorage;

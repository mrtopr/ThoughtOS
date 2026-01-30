import { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function DailyToDoList({ isOpen, onClose }) {
    const { currentWorkspace } = useWorkspace();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const listRef = useRef(null);

    // Load tasks and handle rollover from previous days
    useEffect(() => {
        const workspaceId = currentWorkspace?.id || 'default';
        const savedTasks = localStorage.getItem(`tasks_${workspaceId}`);
        const today = new Date().toDateString();

        if (savedTasks) {
            let parsedTasks = JSON.parse(savedTasks);
            let hasChanges = false;

            const updatedTasks = parsedTasks.map(task => {
                const taskDate = new Date(task.createdAt).toDateString();

                // If the task is from a previous day (rollover logic)
                if (taskDate !== today) {
                    if (!task.completed) {
                        // Push forward incomplete tasks with (yesterday) tag
                        hasChanges = true;
                        const tag = '(yesterday)';
                        return {
                            ...task,
                            text: task.text.includes(tag) ? task.text : `${task.text} ${tag}`,
                            createdAt: new Date().toISOString() // Bring it to today
                        };
                    } else {
                        // Remove completed tasks from previous days for a fresh daily list
                        hasChanges = true;
                        return null;
                    }
                }
                return task;
            }).filter(Boolean);

            if (hasChanges) {
                setTasks(updatedTasks);
                localStorage.setItem(`tasks_${workspaceId}`, JSON.stringify(updatedTasks));
            } else {
                setTasks(parsedTasks);
            }
        } else {
            setTasks([]);
        }
    }, [currentWorkspace]);

    // Save tasks to localStorage when they change
    useEffect(() => {
        const workspaceId = currentWorkspace?.id || 'default';
        localStorage.setItem(`tasks_${workspaceId}`, JSON.stringify(tasks));
    }, [tasks, currentWorkspace]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (listRef.current && !listRef.current.contains(event.target) && !event.target.closest('.todo-toggle-btn')) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const task = {
            id: Date.now(),
            text: newTask.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        setTasks([task, ...tasks]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const removeCompleted = () => {
        setTasks(tasks.filter(task => !task.completed));
    };

    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    if (!isOpen) return null;

    return (
        <div
            ref={listRef}
            className="todo-panel animate-scale-in"
            style={{
                position: 'absolute',
                top: 'calc(100% + 0.75rem)',
                right: '0',
                width: '320px',
                maxHeight: '480px',
                background: 'var(--bg-secondary)',
                backdropFilter: 'none',
                border: '1px solid var(--border-color-strong)',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-2xl)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--glass-border-strong)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📋</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Daily Tasks</h3>
                </div>
                {completedTasks.length > 0 && (
                    <button
                        onClick={removeCompleted}
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--accent-primary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        Clear Done
                    </button>
                )}
            </div>

            {/* Input */}
            <form onSubmit={addTask} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task..."
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            paddingRight: '2.5rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '14px',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'var(--accent-gradient)',
                            border: 'none',
                            width: '24px',
                            height: '24px',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        +
                    </button>
                </div>
            </form>

            {/* List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.5rem',
                minHeight: '100px'
            }}>
                {activeTasks.length === 0 && completedTasks.length === 0 ? (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>✨</div>
                        No tasks for today. Add one above!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {activeTasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 0.875rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: 'transparent'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '6px',
                                    border: '2px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {task.completed && <span style={{ fontSize: '10px', color: 'var(--accent-primary)' }}>✓</span>}
                                </div>
                                <span style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-primary)',
                                    flex: 1
                                }}>
                                    {task.text}
                                </span>
                            </div>
                        ))}

                        {completedTasks.length > 0 && (
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Completed
                            </div>
                        )}

                        {completedTasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 0.875rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: 0.5
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '6px',
                                    background: 'var(--accent-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '10px', color: 'white' }}>✓</span>
                                </div>
                                <span style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'line-through',
                                    flex: 1
                                }}>
                                    {task.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid var(--glass-border-strong)',
                background: 'rgba(0, 0, 0, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {activeTasks.length} {activeTasks.length === 1 ? 'task' : 'tasks'} remaining
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    Daily Reset
                </span>
            </div>
        </div>
    );
}

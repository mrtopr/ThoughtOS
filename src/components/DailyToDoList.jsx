import { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import taskStorage from '../utils/taskStorage';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    Calendar as CalendarIcon,
    Tag,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Plus,
    CheckCircle2,
    Circle,
    X,
    Trash2
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';

export default function DailyToDoList({ isOpen, onClose }) {
    const { currentWorkspace } = useWorkspace();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [category, setCategory] = useState('personal');
    const [priority, setPriority] = useState('medium');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const listRef = useRef(null);

    const categories = [
        { id: 'work', label: 'Work', icon: '💼', color: '#6366f1' },
        { id: 'personal', label: 'Personal', icon: '👤', color: '#10b981' },
        { id: 'health', label: 'Health', icon: '🧘', color: '#f59e0b' },
        { id: 'learning', label: 'Learning', icon: '📚', color: '#8b5cf6' }
    ];

    const priorities = [
        { id: 'high', label: 'High', color: '#ef4444', icon: '🔴' },
        { id: 'medium', label: 'Medium', color: '#f59e0b', icon: '🟡' },
        { id: 'low', label: 'Low', color: '#10b981', icon: '🟢' }
    ];

    useEffect(() => {
        const load = () => {
            if (currentWorkspace) {
                const loadedTasks = taskStorage.getTasks(currentWorkspace.id, selectedDate);
                setTasks(loadedTasks);
            }
        };
        load();
        window.addEventListener('tasksUpdated', load);
        return () => window.removeEventListener('tasksUpdated', load);
    }, [currentWorkspace, selectedDate]);

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

        const taskData = {
            text: newTask.trim(),
            category,
            priority,
            dueDate: selectedDate.toISOString()
        };

        taskStorage.addTask(taskData, currentWorkspace?.id);
        const updatedTasks = taskStorage.getTasks(currentWorkspace?.id, selectedDate);
        setTasks(updatedTasks);
        setNewTask('');
    };

    const toggleTask = (id) => {
        const task = tasks.find(t => t.id === id);
        taskStorage.updateTask(id, { completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null }, currentWorkspace?.id);
        setTasks(taskStorage.getTasks(currentWorkspace?.id, selectedDate));
    };

    const deleteTask = (id) => {
        taskStorage.deleteTask(id, currentWorkspace?.id);
        setTasks(taskStorage.getTasks(currentWorkspace?.id, selectedDate));
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const activeTasks = filteredTasks.filter(task => !task.completed);
    const completedTasks = filteredTasks.filter(task => task.completed);

    if (!isOpen) return null;

    return (
        <div
            ref={listRef}
            className="todo-panel animate-scale-in glass-strong"
            style={{
                position: 'absolute',
                top: 'calc(100% + 0.75rem)',
                right: '0',
                width: '380px',
                maxHeight: '600px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color-strong)',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-2xl)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header with Date Navigation */}
            <div style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--glass-border-strong)',
                background: 'rgba(255, 255, 255, 0.03)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>📋</span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Planner</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '12px' }}>
                    <button
                        onClick={() => setSelectedDate(prev => {
                            const d = new Date(prev);
                            d.setDate(d.getDate() - 1);
                            return d;
                        })}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div
                        onClick={() => setShowCalendar(!showCalendar)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', color: 'var(--text-primary)' }}
                    >
                        <CalendarIcon size={16} className="text-accent" />
                        {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM dd, yyyy')}
                    </div>
                    <button
                        onClick={() => setSelectedDate(prev => {
                            const d = new Date(prev);
                            d.setDate(d.getDate() + 1);
                            return d;
                        })}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {showCalendar && (
                    <div style={{ position: 'absolute', top: '100px', left: '10px', right: '10px', zIndex: 1001, background: 'var(--bg-secondary)', borderRadius: '12px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
                        <Calendar
                            onChange={(date) => {
                                setSelectedDate(date);
                                setShowCalendar(false);
                            }}
                            value={selectedDate}
                            className="custom-calendar"
                        />
                    </div>
                )}
            </div>

            {/* Quick Filters */}
            <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setFilterCategory('all')}
                    style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        border: '1px solid var(--border-color)',
                        background: filterCategory === 'all' ? 'var(--accent-primary)' : 'transparent',
                        color: filterCategory === 'all' ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            border: `1px solid ${cat.color}40`,
                            background: filterCategory === cat.id ? cat.color : 'transparent',
                            color: filterCategory === cat.id ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        <span>{cat.icon}</span> {cat.label}
                    </button>
                ))}
            </div>

            {/* Input Form */}
            <form onSubmit={addTask} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="What needs to be done?"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '14px',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                            >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                            </select>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                            >
                                {priorities.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
                            </select>
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--accent-gradient)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>
            </form>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {activeTasks.length === 0 && completedTasks.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>✨</div>
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>All clear for this day!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {activeTasks.map(task => (
                            <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                        ))}

                        {completedTasks.length > 0 && (
                            <>
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Completed</span>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                </div>
                                {completedTasks.map(task => (
                                    <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--glass-border-strong)', background: 'rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                    {activeTasks.length} pending • {completedTasks.length} done
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                    {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% Compl.
                </div>
            </div>

            <style>{`
                .custom-calendar {
                    width: 100% !important;
                    background: var(--bg-secondary) !important;
                    border: none !important;
                    font-family: inherit !important;
                    color: var(--text-primary) !important;
                }
                .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
                    background-color: var(--bg-tertiary) !important;
                    border-radius: 8px;
                }
                .react-calendar__tile--active {
                    background: var(--accent-gradient) !important;
                    border-radius: 8px;
                    color: white !important;
                }
                .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus {
                    background-color: var(--bg-tertiary) !important;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                    color: var(--text-tertiary) !important;
                }
            `}</style>
        </div>
    );
}

function TaskItem({ task, onToggle, onDelete }) {
    return (
        <div className="task-item" style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.875rem',
            borderRadius: '16px',
            background: task.completed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s ease',
            opacity: task.completed ? 0.6 : 1,
            position: 'relative',
            group: 'true'
        }}>
            <button
                onClick={() => onToggle(task.id)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: task.completed ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    marginTop: '0.1rem'
                }}
            >
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    fontWeight: '500'
                }}>
                    {task.text}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '6px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                    }}>
                        <Tag size={10} /> {task.category}
                    </span>
                    <span style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '6px',
                        background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                        color: task.priority === 'high' ? '#ef4444' : 'var(--text-tertiary)',
                        fontWeight: '700'
                    }}>
                        {task.priority.toUpperCase()}
                    </span>
                </div>
            </div>

            <button
                onClick={() => onDelete(task.id)}
                className="delete-btn"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '8px',
                    opacity: 0
                }}
            >
                <Trash2 size={16} />
            </button>

            <style>{`
                .task-item:hover .delete-btn {
                    opacity: 1;
                }
                .delete-btn:hover {
                    color: #ef4444 !important;
                    background: rgba(239, 68, 68, 0.1) !important;
                }
            `}</style>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import taskStorage from '../utils/taskStorage';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, CheckCircle2, Flame, Target, Calendar } from 'lucide-react';

export default function Analytics() {
    const { currentWorkspace } = useWorkspace();
    const [stats, setStats] = useState([]);
    const [streak, setStreak] = useState(0);
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        if (currentWorkspace) {
            updateStats();
        }

        const handleUpdate = () => updateStats();
        window.addEventListener('tasksUpdated', handleUpdate);
        return () => window.removeEventListener('tasksUpdated', handleUpdate);
    }, [currentWorkspace]);

    const updateStats = () => {
        const workspaceId = currentWorkspace.id;
        setStats(taskStorage.getStats(workspaceId));
        setStreak(taskStorage.getStreak(workspaceId));

        const allTasks = taskStorage.getAllTasks(workspaceId);
        const categories = {};
        allTasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });

        const catArray = Object.keys(categories).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: categories[key],
            color: getCategoryColor(key)
        }));
        setCategoryData(catArray);
    };

    const getCategoryColor = (cat) => {
        const colors = {
            work: '#6366f1',
            personal: '#10b981',
            health: '#f59e0b',
            learning: '#8b5cf6'
        };
        return colors[cat] || '#8b5cf6';
    };

    const totalTasks = taskStorage.getAllTasks(currentWorkspace?.id).length;
    const completedTasks = taskStorage.getAllTasks(currentWorkspace?.id).filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="analytics-container fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Productivity Insights</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your progress and stay motivated.</p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard
                    title="Total Tasks"
                    value={totalTasks}
                    icon={<Target size={24} />}
                    color="#6366f1"
                />
                <StatCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    icon={<CheckCircle2 size={24} />}
                    color="#10b981"
                />
                <StatCard
                    title="Current Streak"
                    value={`${streak} Days`}
                    icon={<Flame size={24} />}
                    color="#ef4444"
                    badge="🔥 Keep it up!"
                />
                <StatCard
                    title="Most Productive"
                    value="Tuesday"
                    icon={<TrendingUp size={24} />}
                    color="#8b5cf6"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* 7-Day Completion Chart */}
                <ChartCard title="Task Activity (Last 7 Days)">
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Completed" />
                                <Bar dataKey="total" fill="rgba(99, 102, 241, 0.2)" radius={[4, 4, 0, 0]} name="Total" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Category Breakdown */}
                <ChartCard title="Category Distribution">
                    <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, badge }) {
    return (
        <div className="glass-strong" style={{
            padding: '1.5rem',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '16px',
                    background: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                {badge && (
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: '800' }}>
                        {badge}
                    </span>
                )}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>{value}</h2>
            </div>
            {/* Background decoration */}
            <div style={{ position: 'absolute', right: '-10%', bottom: '-10%', width: '80px', height: '80px', borderRadius: '50%', background: color, opacity: 0.05, filter: 'blur(20px)' }}></div>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="glass-strong" style={{
            padding: '1.5rem',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
        }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h3>
            {children}
        </div>
    );
}

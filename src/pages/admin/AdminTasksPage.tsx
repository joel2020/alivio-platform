import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
type TaskStatus = 'open' | 'completed' | 'dismissed';
type TaskTab = 'today' | 'upcoming' | 'all' | 'completed';

interface Task {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  due_date: string | null;
  category: string | null;
  status: TaskStatus;
  created_at: string;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: '#DC2626',
  high: '#F97316',
  medium: '#EAB308',
  low: '#6B7280',
};

const TABS: { key: TaskTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
];

export default function AdminTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskTab>('today');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, due_date: '', category: '' });

  useEffect(() => {
    if (!user?.org_id) return;
    setLoading(true);
    supabase
      .from('tasks')
      .select('*')
      .eq('org_id', user.org_id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setTasks((data as Task[]) ?? []);
        setLoading(false);
      });
  }, [user?.org_id]);

  const stats = useMemo(() => {
    return {
      urgent: tasks.filter((task) => task.priority === 'urgent' && task.status === 'open').length,
      high: tasks.filter((task) => task.priority === 'high' && task.status === 'open').length,
      medium: tasks.filter((task) => task.priority === 'medium' && task.status === 'open').length,
      low: tasks.filter((task) => task.priority === 'low' && task.status === 'open').length,
    };
  }, [tasks]);

  const filtered = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    return tasks.filter((task) => {
      const dueKey = task.due_date ? task.due_date.slice(0, 10) : null;
      if (activeTab === 'completed') return task.status === 'completed';
      if (task.status !== 'open') return false;
      if (activeTab === 'all') return true;
      if (activeTab === 'today') return dueKey === todayKey;
      return dueKey ? dueKey > todayKey : false;
    });
  }, [activeTab, tasks]);

  async function addTask() {
    if (!user?.org_id || !form.title.trim()) return;
    const payload = {
      org_id: user.org_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      due_date: form.due_date || null,
      category: form.category.trim() || null,
      status: 'open' as TaskStatus,
    };
    const { data } = await supabase.from('tasks').insert(payload).select('*').single();
    if (data) {
      setTasks((prev) => [data as Task, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'medium', due_date: '', category: '' });
    }
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
    if (!error) setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tasks</h1>
      </div>

      <div className="page-content space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(stats) as TaskPriority[]).map((priority) => (
            <div key={priority} className="card p-4">
              <p className="section-label" style={{ color: PRIORITY_COLORS[priority], textTransform: 'capitalize' }}>{priority}</p>
              <p className="metric-value mt-1">{stats[priority]}</p>
            </div>
          ))}
        </div>

        <div className="card p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: activeTab === tab.key ? 'var(--accent)' : 'var(--bg-subtle)',
                  color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="btn-primary inline-flex items-center gap-1.5" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Task
          </button>
        </div>

        <div className="space-y-2">
          {loading && <p style={{ color: 'var(--text-muted)' }}>Loading tasks...</p>}
          {!loading && filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks in this tab.</p>}
          {filtered.map((task) => (
            <div key={task.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</p>
                  {task.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{task.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${PRIORITY_COLORS[task.priority]}22`, color: PRIORITY_COLORS[task.priority], textTransform: 'capitalize' }}>{task.priority}</span>
                    {task.category && <span className="text-xs px-2 py-0.5 rounded badge-neutral">{task.category}</span>}
                    {task.due_date && <span className="text-xs inline-flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><CalendarDays size={12} />{new Date(task.due_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                {task.status === 'open' ? (
                  <div className="flex gap-2">
                    <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => updateStatus(task.id, 'completed')}>Complete</button>
                    <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => updateStatus(task.id, 'dismissed')}>Dismiss</button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{task.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="card p-5 w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Add Task</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="input-base w-full" />
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="input-base w-full" rows={3} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))} className="input-base w-full">
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} type="date" className="input-base w-full" />
              </div>
              <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Category" className="input-base w-full" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={addTask} disabled={!form.title.trim()}>Save Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

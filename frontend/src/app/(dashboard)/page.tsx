'use client';
import React, { useState, useEffect } from 'react';
import { Package, FileText, AlertTriangle, Calendar, Plus, X } from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ upcomingTasks: 0, upcomingQuizzes: 0, urgentTasks: 0 });
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: 'task', difficulty: 'medium', dueDate: '' });
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) setUsername(storedName);

    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasks(data.tasks);
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch(console.error);
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          title: newTask.title,
          task_type: newTask.type,
          difficulty: newTask.difficulty,
          due_date: newTask.dueDate,
          created_by: localStorage.getItem('userId') || 'unknown'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks([...tasks, data.task || newTask]); // fallback
        setIsModalOpen(false);
      } else {
        alert('Gagal tambah tugas');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Selamat datang, {username}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Berikut adalah ikhtisar tugas dan kuis Anda di kelas ini.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <Plus size={18} />
            Tambah Tugas
          </button>
        </header>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tambah Tugas Baru</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Judul Tugas</label>
                  <input required type="text" className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Tenggat Waktu</label>
                  <input required type="date" className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Tingkat Kesulitan</label>
                  <select className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={newTask.difficulty} onChange={e => setNewTask({...newTask, difficulty: e.target.value})}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">Simpan Tugas</button>
              </form>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Tugas Mendatang" value={metrics.upcomingTasks} icon={<Package className="text-blue-500" size={32} />} color="border-blue-500" />
          <MetricCard title="Kuis Mendatang" value={metrics.upcomingQuizzes} icon={<FileText className="text-purple-500" size={32} />} color="border-purple-500" />
          <MetricCard title="Mendesak (H-1)" value={metrics.urgentTasks} icon={<AlertTriangle className="text-red-500" size={32} />} color="border-red-500" alert />
        </div>

        {/* Task Priority Board */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Prioritas Tugas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Hard / Urgent */}
            <TaskColumn title="High Priority" subtitle="Hard / Tenggat < 3 Hari" dotColor="bg-red-500">
              {tasks.filter(t => t.difficulty === 'hard').map(task => (
                <TaskCard key={task.id} task={task} badgeColor="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" />
              ))}
            </TaskColumn>

            {/* Medium */}
            <TaskColumn title="Medium Priority" subtitle="Medium / Tenggat 3-7 Hari" dotColor="bg-yellow-500">
              {tasks.filter(t => t.difficulty === 'medium').map(task => (
                <TaskCard key={task.id} task={task} badgeColor="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" />
              ))}
            </TaskColumn>

            {/* Easy / Low */}
            <TaskColumn title="Low Priority" subtitle="Easy / Tenggat > 7 Hari" dotColor="bg-emerald-500">
              {tasks.filter(t => t.difficulty === 'easy').map(task => (
                <TaskCard key={task.id} task={task} badgeColor="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" />
              ))}
            </TaskColumn>

          </div>
        </div>

      </div>
    </main>
  );
}

// --- Komponen Pendukung UI ---

function MetricCard({ title, value, icon, color, alert = false }: any) {
  return (
    <div className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl border-l-4 shadow-sm border-r border-y border-gray-200 dark:border-zinc-800 flex items-center justify-between ${color}`}>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className={`text-4xl font-bold ${alert ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      </div>
      <div>{icon}</div>
    </div>
  );
}

function TaskColumn({ title, subtitle, dotColor, children }: any) {
  return (
    <div className="bg-gray-100 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col h-full">
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className="space-y-3 flex-1">
        {children}
      </div>
    </div>
  );
}

function TaskCard({ task, badgeColor }: any) {
  const date = new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
          {task.difficulty.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500 group-hover:text-indigo-500 flex items-center gap-1.5 transition-colors">
          <Calendar size={12} /> {date}
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-1">{task.title}</h4>
      <p className="text-xs text-gray-500 capitalize">{task.type}</p>
    </div>
  );
}

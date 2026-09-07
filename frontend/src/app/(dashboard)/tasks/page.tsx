'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, X, Send, UploadCloud, FileText, Trash2 } from 'lucide-react';

export default function TasksKanbanPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasks(data.tasks);
      })
      .catch(console.error);
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => setDraggedTaskId(null);

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(tasks.map(t => t.id === taskId ? { ...t, myStatus: newStatus } : t));
    setDraggedTaskId(null);
    try {
      await fetch(`/api/tasks/${taskId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: newStatus, user_id: localStorage.getItem('userId') })
      });
    } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !selectedTask) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`/api/tasks/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (res.ok) alert('Berhasil unggah file');
      else alert('Gagal unggah file');
    } catch(err) { console.error(err); }
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const columns = [
    { id: 'todo', title: 'To Do (Belum)', color: 'bg-gray-100 dark:bg-zinc-900' },
    { id: 'in_progress', title: 'In Progress (Sedang)', color: 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' },
    { id: 'done', title: 'Done (Selesai)', color: 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' }
  ];

  return (
    <div className="p-6 lg:p-10 h-full font-sans relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Papan Kanban Tugas</h1>
          <p className="text-gray-500 mt-1">Geser tugas ke kanan untuk progress. Klik kartu tugas untuk berdiskusi & mengumpulkan file.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[70vh]">
        {columns.map(col => (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={allowDrop}
            className={`${col.color} rounded-2xl p-4 flex flex-col border border-gray-200 dark:border-zinc-800 transition-colors shadow-inner`}
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">{col.title}</h2>
              <span className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs font-bold border border-gray-200 dark:border-zinc-700">
                {tasks.filter(t => t.myStatus === col.id).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 px-2 pb-4">
              {tasks.filter(t => t.myStatus === col.id).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedTask(task)}
                  className={`bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm border ${
                    draggedTaskId === task.id ? 'opacity-50 scale-95 border-dashed border-indigo-400' : 'border-gray-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                  } cursor-pointer transition-all duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      task.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {task.difficulty.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 font-medium tracking-tight flex items-center gap-1.5">
                      <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-snug mb-4">{task.title}</h3>
                  
                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-zinc-800/80 pt-3 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <MessageSquare size={14} /> {task.comments} Diskusi
                    </div>
                    <div className="flex -space-x-1.5">
                      {task.peers.done.map((p, i) => (
                        <div key={'d'+i} className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-zinc-950 z-20 shadow-sm">{p}</div>
                      ))}
                      {task.peers.inProgress.map((p, i) => (
                        <div key={'p'+i} className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-zinc-950 z-10 shadow-sm">{p}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETAIL TUGAS (Diskusi & Pengumpulan File) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[85vh] border border-gray-200 dark:border-zinc-800 overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <div>
                <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Calendar size={14} /> Tenggat: {new Date(selectedTask.dueDate).toLocaleDateString('id-ID')}
                </p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Layout 2 Kolom Modal */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* KOLOM KIRI: Ruang Diskusi */}
              <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Chat/Diskusi */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0">A</div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm">Andi</span>
                        <span className="text-xs text-gray-400">10:30 AM</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 dark:border-zinc-800 text-sm text-gray-700 dark:text-gray-300">
                        File tugas harus diunggah dalam format PDF kan ya?
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold shrink-0">B</div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm">Budi</span>
                        <span className="text-xs text-gray-400">10:35 AM</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 dark:border-zinc-800 text-sm text-gray-700 dark:text-gray-300">
                        Iya, max 20MB biar servernya ga jebol kata yang bikin LMS.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Komentar */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shrink-0">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Balas diskusi..." 
                      className="flex-1 bg-gray-100 dark:bg-zinc-800 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    />
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: Pengumpulan Tugas */}
              <div className="w-full md:w-96 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
                <div className="p-6 flex-1 overflow-y-auto">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                    Pengumpulan Tugas
                  </h3>
                  
                  {/* Upload Dropzone */}
                  <label className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-400 transition-colors group mb-8">
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <UploadCloud className="text-gray-400 group-hover:text-indigo-500 mb-4 transition-colors" size={40} strokeWidth={1.5} />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1">Klik atau tarik file ke sini</p>
                    <p className="text-xs text-gray-500">Maksimal 20MB (PDF/ZIP)</p>
                  </label>

                  {/* Riwayat Upload Transparan */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      File Terkumpul <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px]">Publik</span>
                    </h4>
                    
                    {/* Item File Terkirim */}
                    {selectedTask.myStatus === 'done' || selectedTask.peers.done.length > 0 ? (
                      <div className="space-y-2">
                        {/* File Anda */}
                        {selectedTask.myStatus === 'done' && (
                          <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg shadow-sm group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText size={20} className="text-indigo-500 shrink-0" />
                              <div className="truncate">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Tugas_{selectedTask.id}_Anda.pdf</p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">Oleh: Anda (1.2 MB)</p>
                              </div>
                            </div>
                            <button title="Hapus File" className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                        
                        {/* File Teman */}
                        {selectedTask.peers.done.map((p: string, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText size={20} className="text-gray-400 shrink-0" />
                              <div className="truncate">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Tugas_Jawaban_{p}.pdf</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Oleh: {p} (900 KB)</p>
                              </div>
                            </div>
                            <button title="Unduh File Teman" className="text-gray-400 hover:text-indigo-500 font-medium text-xs px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                              Unduh
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-100 dark:border-zinc-800">
                        Belum ada teman yang mengunggah file.
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

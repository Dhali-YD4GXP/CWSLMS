'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, X, Send, UploadCloud, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TasksKanbanPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (data.data) {
        const myId = localStorage.getItem('userId');
        const mappedTasks = data.data.map((t: any) => {
          const myProgress = t.progresses?.find((p: any) => p.user_id === myId);
          return {
            ...t,
            dueDate: t.due_date,
            myStatus: myProgress ? myProgress.status : 'todo',
            comments: t.comments || [],
            peers: { done: [], inProgress: [] }
          };
        });
        setTasks(mappedTasks);
      }
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000); // Auto-refresh setiap 3 detik
    return () => clearInterval(interval);
  }, []);

  // Sync selectedTask and trigger notification
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) {
        if (updated.comments.length > selectedTask.comments.length) {
          const latest = updated.comments[updated.comments.length - 1];
          if (latest.user_id !== localStorage.getItem('userId') && !latest.content.startsWith('[FILE]:')) {
            toast.success(`Pesan baru dari ${latest.author?.username || 'Seseorang'}`, { icon: '💬' });
          }
        }
        // Update to keep it fresh
        if (JSON.stringify(updated) !== JSON.stringify(selectedTask)) {
          setSelectedTask(updated);
        }
      }
    }
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const executeDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ user_id: localStorage.getItem('userId') })
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
        setSelectedTask(null);
        toast.success('Tugas dipindahkan ke Recycle Bin');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Yakin memindahkan tugas ini ke Recycle Bin?</p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              executeDeleteTask(id);
            }} 
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleDragEnd = () => setDraggedTaskId(null);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, myStatus: newStatus } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, myStatus: newStatus });
    }
    try {
      await fetch(`/api/tasks/${taskId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: newStatus, user_id: localStorage.getItem('userId') })
      });
      toast.success('Status tugas diperbarui');
    } catch (err) { 
      console.error(err); 
      toast.error('Gagal memperbarui status');
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    updateTaskStatus(taskId, newStatus);
    setDraggedTaskId(null);
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
      if (res.ok) {
        const uploadData = await res.json();
        // Create comment as file representation
        const commentRes = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            content: `[FILE]:${uploadData.file_path}|${file.name}`,
            task_id: selectedTask.id,
            user_id: localStorage.getItem('userId')
          })
        });
        if (commentRes.ok) {
          const data = await commentRes.json();
          const newC = data.data;
          setSelectedTask({ ...selectedTask, comments: [...selectedTask.comments, newC] });
          setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, comments: [...t.comments, newC] } : t));
          toast.success('Berhasil unggah file!');
        }
      } else {
        toast.error('Gagal unggah file!');
      }
    } catch(err) { console.error(err); }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          content: newComment,
          task_id: selectedTask.id,
          user_id: localStorage.getItem('userId')
        })
      });
      if (res.ok) {
        const data = await res.json();
        const newC = data.data;
        // update selectedTask and tasks list
        setSelectedTask({ ...selectedTask, comments: [...selectedTask.comments, newC] });
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, comments: [...t.comments, newC] } : t));
        setNewComment("");
      }
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
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-snug mb-4 break-words line-clamp-3">{task.title}</h3>
                  
                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-zinc-800/80 pt-3 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <MessageSquare size={14} /> {task.comments.length} Diskusi
                    </div>
                    <div className="flex -space-x-1.5">
                      {task.peers.done.map((p: any, i: number) => (
                        <div key={'d'+i} className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-zinc-950 z-20 shadow-sm">{p}</div>
                      ))}
                      {task.peers.inProgress.map((p: any, i: number) => (
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar size={14} /> Tenggat: {new Date(selectedTask.dueDate).toLocaleDateString('id-ID')}
                  </p>
                  <select 
                    value={selectedTask.myStatus} 
                    onChange={(e) => updateTaskStatus(selectedTask.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 outline-none w-fit shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-full transition-colors"
                  title="Hapus Tugas"
                >
                  <Trash2 size={24} />
                </button>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Layout 2 Kolom Modal */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* KOLOM KIRI: Ruang Diskusi */}
              <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Chat/Diskusi */}
                  {selectedTask.comments && selectedTask.comments.filter((c: any) => !c.content.startsWith('[FILE]:')).length > 0 ? selectedTask.comments.filter((c: any) => !c.content.startsWith('[FILE]:')).map((c: any) => {
                    const isMine = c.user_id === localStorage.getItem('userId');
                    return (
                      <div key={c.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {!isMine && (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0 text-xs">
                            {c.author?.username ? c.author.username[0].toUpperCase() : 'U'}
                          </div>
                        )}
                        
                        {/* Chat Bubble Container */}
                        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className={`flex items-baseline gap-2 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">{isMine ? 'Anda' : (c.author?.username || 'User')}</span>
                            <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className={`p-3 text-sm shadow-sm w-fit ${
                            isMine 
                              ? 'bg-indigo-500 text-white rounded-2xl rounded-tr-none' 
                              : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-700 dark:text-gray-200 rounded-2xl rounded-tl-none'
                          }`}>
                            {c.content}
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-sm text-gray-500 italic text-center py-4">Belum ada diskusi. Mulai percakapan sekarang!</div>
                  )}
                </div>

                {/* Input Komentar */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shrink-0">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                      placeholder="Balas diskusi..." 
                      className="flex-1 bg-gray-100 dark:bg-zinc-800 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    />
                    <button onClick={submitComment} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl flex items-center justify-center transition-colors shadow-sm">
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
                    <div className="space-y-2">
                      {selectedTask.comments && selectedTask.comments.filter((c: any) => c.content.startsWith('[FILE]:')).length > 0 ? (
                        selectedTask.comments.filter((c: any) => c.content.startsWith('[FILE]:')).map((c: any) => {
                          const parts = c.content.replace('[FILE]:', '').split('|');
                          const filePath = parts[0];
                          const fileName = parts.length > 1 ? parts[1] : filePath;
                          const isMine = c.user_id === localStorage.getItem('userId');
                          
                          return (
                            <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg shadow-sm border ${isMine ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50' : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'} group`}>
                              <div className="flex items-center gap-3 overflow-hidden">
                                <FileText size={20} className={isMine ? 'text-indigo-500 shrink-0' : 'text-gray-400 shrink-0'} />
                                <div className="truncate">
                                  <a href={`/uploads/${filePath}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate hover:text-indigo-600 transition-colors">
                                    {fileName}
                                  </a>
                                  <p className={`text-xs font-medium mt-0.5 ${isMine ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
                                    Oleh: {c.author?.username || 'User'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-100 dark:border-zinc-800">
                          Belum ada file yang terkumpul.
                        </div>
                      )}
                    </div>
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

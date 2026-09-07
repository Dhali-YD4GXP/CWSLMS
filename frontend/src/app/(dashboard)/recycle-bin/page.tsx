'use client';
import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecycleBinPage() {
  const [items, setItems] = useState<any[]>([]);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/recycle-bin', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        if (data.data) setItems(data.data);
      })
      .catch(console.error);
  }, []);

  const handleRestore = async (id: string, type: string) => {
    try {
      setRestoredId(id);
      const res = await fetch('/api/recycle-bin/restore', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ id, type })
      });
      
      if (res.ok) {
        setRestoredId(id);
        toast.success('Berhasil memulihkan item!');
        setTimeout(() => {
          setItems(items.filter(item => item.id !== id));
          setRestoredId(null);
        }, 1500);
      } else {
        toast.error('Gagal memulihkan item!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Koneksi bermasalah!');
    }
  };

  return (
    <div className="p-6 lg:p-10 font-sans min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Recycle Bin</h1>
        <p className="text-gray-500 mt-1">Data yang dihapus masuk ke sini berkat fitur Soft Delete. Siapa pun dapat memulihkannya.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Item</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium">Dihapus Pada</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                    <Trash2 className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" size={48} strokeWidth={1.5} />
                    <p className="font-medium text-gray-400">Recycle Bin kosong.</p>
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{item.type}</span></td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> {new Date(item.deleted_at).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {restoredId === item.id ? (
                      <span className="inline-flex items-center justify-end gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium px-4 py-2 w-full">
                        <CheckCircle size={16} /> Dipulihkan
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleRestore(item.id, item.type)}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <RotateCcw size={16} /> Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

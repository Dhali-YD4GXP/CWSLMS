'use client';
import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Eye, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch('/api/library', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        if (data.data) setBooks(data.data);
      })
      .catch(console.error);
  }, []);

  const executeDeleteBook = async (id: string) => {
    try {
      const res = await fetch(`/api/library/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ user_id: localStorage.getItem('userId') })
      });
      if (res.ok) {
        setBooks(books.filter(b => b.id !== id));
        toast.success('File dipindahkan ke Recycle Bin');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Yakin memindahkan file ini ke Recycle Bin?</p>
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
              executeDeleteBook(id);
            }} 
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.type !== 'application/pdf') {
        toast.error('Gagal: Hanya mendukung format PDF.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Gagal: Maksimal ukuran file 20MB.');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('created_by', localStorage.getItem('userId') || '');
      
      try {
        const res = await fetch('/api/library/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        if (res.ok) {
          const result = await res.json();
          setBooks([result.data, ...books]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.type !== 'application/pdf') {
        toast.error('Gagal: Hanya mendukung format PDF.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Gagal: Maksimal ukuran file 20MB.');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('created_by', localStorage.getItem('userId') || '');

      try {
        const res = await fetch('/api/library/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setBooks([data.book, ...books]);
          toast.success('Berhasil unggah PDF!');
        } else {
          toast.error('Gagal unggah file!');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 lg:p-10 font-sans min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Perpustakaan Kelas</h1>
        <p className="text-gray-500 mt-1">Pusat repositori file PDF. Silakan *drag and drop* PDF Anda ke area di bawah untuk berbagi.</p>
      </div>

      {/* Area Dropzone Upload */}
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`mb-10 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]' 
            : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/80'
        }`}
      >
        <div className={`mb-4 transition-transform duration-300 ${isDragging ? 'scale-110 text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`}>
          <UploadCloud size={64} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Tarik & Lepas File PDF ke Sini</h3>
        <p className="text-sm text-gray-500 text-center max-w-md mb-6">
          Anda juga bisa menekan tombol di bawah untuk memilih file secara manual. Batas unggahan server diatur ke <strong className="text-gray-700 dark:text-gray-300">20MB per file</strong>.
        </p>
        <label className="bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-lg font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
          Pilih File Manual
          <input type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
        </label>
      </div>

      {/* Daftar Grid Buku/File */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Koleksi Referensi</h2>
        <input 
          type="text" 
          placeholder="Cari buku atau materi..." 
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <div key={book.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col hover:shadow-md transition-shadow group">
            
            <div className="flex-1 flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 break-all">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 truncate">Diunggah oleh: {book.uploader} • {book.size}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {book.tags?.map((tag: any, idx: number) => (
                <span key={idx} className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => window.open(`/uploads/${book.file_path}`, '_blank')}
                className="flex flex-1 items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Eye size={16} /> Preview
              </button>
              <a 
                href={`/uploads/${book.file_path}`}
                download={book.title}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} /> Unduh
              </a>
              <button 
                onClick={() => handleDeleteBook(book.id)}
                className="flex items-center justify-center bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 p-2 rounded-lg transition-colors"
                title="Hapus ke Recycle Bin"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Eye, Download } from 'lucide-react';

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch('/api/library', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        if (data.books) setBooks(data.books);
      })
      .catch(console.error);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.type !== 'application/pdf') {
        alert('Gagal: Sistem LMS ini hanya mengizinkan file berformat PDF.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('Gagal: Ukuran file melebihi batas maksimal server (20MB).');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/library', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setBooks([data.book, ...books]);
          alert('Berhasil upload PDF');
        } else {
          alert('Gagal upload');
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
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500">Diunggah oleh: {book.uploader} • {book.size}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {book.tags.map(tag => (
                <span key={tag} className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              <button className="flex flex-1 items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 py-2 rounded-lg text-sm font-medium transition-colors">
                <Eye size={16} /> Preview
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download size={16} /> Unduh
              </button>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}

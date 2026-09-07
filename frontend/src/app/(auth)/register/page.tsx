'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, User, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passcode: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Di backend, ini akan dicek melawan env variabel rahasia
    if (formData.passcode !== 'CWS-2023') { 
      alert('❌ Akses Ditolak: Kode Kelas Rahasia (Passcode) tidak valid! Anda bukan anggota kelas ini.');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem('token', data.token);
        alert(`✅ Berhasil mendaftar! Selamat datang ${formData.name}`);
        router.push('/');
      } else {
        alert('Gagal mendaftar.');
      }
    } catch (err) {
      alert('Error koneksi server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 mb-2">
            CWS<span className="text-gray-900 dark:text-white">LMS</span>
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Pendaftaran Akun Kelas</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            LMS ini bersifat tertutup. Masukkan kode rahasia (*Passcode*) dari grup Anda untuk memverifikasi pendaftaran.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input type="text" required placeholder="Andi Susanto"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email Kampus / Aktif</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input type="email" required placeholder="andi@student.univ.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input type="password" required placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-zinc-800">
            <label className="block text-sm font-bold mb-1.5 text-indigo-600 dark:text-indigo-400">Kode Kelas (Passcode)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                <KeyRound size={18} />
              </div>
              <input type="text" required placeholder="Masukkan Passcode Rahasia"
                className="w-full pl-10 pr-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-indigo-300"
                onChange={e => setFormData({...formData, passcode: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors mt-6 shadow-md">
            Daftar Sekarang <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah terdaftar? <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}

'use client';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, ClipboardList, BookOpen, Trash2, Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  if (!isAuthenticated) return null; // Mencegah kedipan UI sebelum redirect

  return (
    <div className="flex h-screen overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              CWS<span className="text-gray-800 dark:text-gray-200">LMS</span>
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-gray-300 transition-colors">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link href="/tasks" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-gray-300 transition-colors">
              <ClipboardList size={20} /> Daftar Tugas
            </Link>
            <Link href="/library" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-gray-300 transition-colors">
              <BookOpen size={20} /> Perpustakaan
            </Link>
            <Link href="/recycle-bin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-gray-300 transition-colors">
              <Trash2 size={20} /> Recycle Bin
            </Link>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">A</div>
              <div>
                <p className="text-sm font-semibold">User Egaliter</p>
                <p className="text-xs text-gray-500">Anggota Kelas</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-indigo-600">CWSLMS</h2>
            <button className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-md text-gray-600 dark:text-gray-300">
               <Menu size={20} />
            </button>
          </header>
          
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-zinc-950">
            {children}
          </div>
        </div>
    </div>
  );
}

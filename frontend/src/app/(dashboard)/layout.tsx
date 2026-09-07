import Link from "next/link";
import { LayoutDashboard, ClipboardList, BookOpen, Trash2, Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
          
          <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">A</div>
              <div>
                <p className="text-sm font-semibold">User Egaliter</p>
                <p className="text-xs text-gray-500">Anggota Kelas</p>
              </div>
            </div>
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

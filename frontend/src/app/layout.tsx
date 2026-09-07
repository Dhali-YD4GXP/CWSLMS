import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CWSLMS - Collaborative Class",
  description: "Lightweight, collaborative Learning Management System for a peer group.",
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            className: '!bg-white dark:!bg-zinc-900 !text-gray-800 dark:!text-gray-100 !border !border-gray-200 dark:!border-zinc-800 !shadow-lg',
          }}
        />
        {children}
      </body>
    </html>
  );
}

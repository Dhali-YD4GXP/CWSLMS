import { Request, Response } from 'express';
import prisma, { logActivity } from '../config/prisma';
import { sendWebhookNotification } from '../utils/webhook';

// CREATE TASK
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, due_date, created_by } = req.body;
    
    const task = await prisma.task.create({
      data: { title, description, due_date, created_by },
    });
    
    // 1. Audit Trail: Mencatat aktivitas pembuatan
    await logActivity(created_by, 'CREATE', 'task', task.id, `User membuat tugas baru: ${title}`);
    
    // 2. Webhook Notification: Mengirim pesan ke Telegram/Discord
    const deadlineText = due_date ? new Date(due_date).toLocaleDateString() : 'Tidak ada tenggat';
    await sendWebhookNotification(`📝 Tugas Baru Ditambahkan!\nJudul: ${title}\nDeadline: ${deadlineText}`);
    
    res.status(201).json({ message: 'Tugas berhasil dibuat', data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat tugas.' });
  }
};

// READ TASKS
export const getTasks = async (req: Request, res: Response) => {
  try {
    // 3. Soft Delete Action: Secara otomatis tidak akan mengambil tugas dengan deleted_at != null
    // karena telah dicegat oleh Prisma Extension (di src/config/prisma.ts)
    const tasks = await prisma.task.findMany({
      orderBy: { due_date: 'asc' },
    });
    
    res.json({ data: tasks });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat tugas.' });
  }
};

// SOFT DELETE TASK
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body; // Simulasi dari token JWT auth
    
    // Prisma Extension akan mengubah instruksi ini menjadi UPDATE deleted_at = NOW()
    const task = await prisma.task.delete({
      where: { id },
    });
    
    // 4. Audit Trail: Mencatat aktivitas penghapusan
    await logActivity(user_id, 'DELETE', 'task', id, `User menghapus (soft delete) tugas: ${task.title}`);
    
    res.json({ message: 'Tugas telah dipindah ke Recycle Bin.', data: task });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus tugas.' });
  }
};

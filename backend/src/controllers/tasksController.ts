import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { logActivity } from '../config/prisma';
import { sendWebhookNotification } from '../utils/webhook';

// CREATE TASK
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, due_date, difficulty, task_type, created_by } = req.body;
    
    const task = await prisma.task.create({
      data: { 
        title, 
        description, 
        due_date: due_date ? new Date(due_date) : null,
        difficulty,
        task_type,
        created_by 
      },
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
    const tasks = await prisma.task.findMany({
      orderBy: { due_date: 'asc' },
      include: {
        progresses: true
      }
    });
    
    res.json({ data: tasks });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat tugas.' });
  }
};

// GET SINGLE TASK
export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        progresses: true
      }
    });
    
    if (!task) return res.status(404).json({ error: 'Tugas tidak ditemukan' });
    
    res.json({ data: task });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat tugas.' });
  }
};

// UPDATE TASK
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, difficulty, task_type, user_id } = req.body;
    
    const task = await prisma.task.update({
      where: { id },
      data: { 
        title, 
        description, 
        due_date: due_date ? new Date(due_date) : null,
        difficulty,
        task_type
      }
    });
    
    await logActivity(user_id, 'UPDATE', 'task', id, `User memperbarui tugas: ${title}`);
    
    res.json({ message: 'Tugas diperbarui', data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memperbarui tugas.' });
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

// UPDATE TASK PROGRESS
export const updateTaskProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // task_id
    const { status, user_id } = req.body; 
    
    const progress = await prisma.taskProgress.upsert({
      where: { task_id_user_id: { task_id: id, user_id } },
      update: { status },
      create: { task_id: id, user_id, status }
    });
    
    res.json({ message: 'Progress updated', data: progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

// UPLOAD TASK FILE
export const uploadTaskFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }
    // Return file path
    res.json({ message: 'File berhasil diunggah', file_path: req.file.filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengunggah file.' });
  }
};

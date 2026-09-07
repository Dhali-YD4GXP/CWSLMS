import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getDeletedItems = async (req: Request, res: Response) => {
  try {
    // Find all soft-deleted tasks
    // Note: Since Prisma's default findMany automatically filters out deleted_at != null
    // due to the soft delete middleware we configured, we might need to query the DB raw
    // OR if the middleware allows passing a flag, use it. Let's use raw query for safety.
    const deletedTasks = await prisma.$queryRaw`SELECT id, title, 'Task' as type, deleted_at FROM tasks WHERE deleted_at IS NOT NULL`;
    const deletedBooks = await prisma.$queryRaw`SELECT id, title, 'Book' as type, deleted_at FROM books WHERE deleted_at IS NOT NULL`;
    
    // Combine and sort
    const items = [...(deletedTasks as any[]), ...(deletedBooks as any[])].sort((a, b) => {
      return new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime();
    });

    res.json({ data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memuat recycle bin.' });
  }
};

export const restoreItem = async (req: Request, res: Response) => {
  try {
    const { id, type } = req.body;
    
    if (type === 'Task') {
      await prisma.$executeRaw`UPDATE tasks SET deleted_at = NULL WHERE id = ${id}`;
    } else if (type === 'Book') {
      await prisma.$executeRaw`UPDATE books SET deleted_at = NULL WHERE id = ${id}`;
    } else {
      return res.status(400).json({ error: 'Tipe tidak valid.' });
    }

    res.json({ message: 'Item berhasil dipulihkan.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memulihkan item.' });
  }
};

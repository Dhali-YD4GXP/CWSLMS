import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { logActivity } from '../config/prisma';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { content, user_id, task_id } = req.body;
    
    if (!content || !user_id || !task_id) {
      return res.status(400).json({ error: 'content, user_id, and task_id are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        user_id,
        task_id
      },
      include: {
        author: true
      }
    });

    // Audit Trail
    await logActivity(user_id, 'CREATE', 'comment', comment.id, `User menambahkan komentar pada tugas`);

    res.status(201).json({ message: 'Komentar berhasil ditambahkan', data: comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan komentar.' });
  }
};

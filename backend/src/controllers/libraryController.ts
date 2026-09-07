import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { logActivity } from '../config/prisma';
import fs from 'fs';
import path from 'path';

// CREATE BOOK (UPLOAD PDF)
export const uploadBook = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file PDF yang diunggah.' });
    }

    const { title, course_name, tags, created_by } = req.body;
    
    // Convert tags from string to array if necessary
    let parsedTags: string[] = [];
    if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    const book = await prisma.book.create({
      data: {
        title: title || req.file.originalname,
        file_path: req.file.filename,
        file_size: req.file.size,
        course_name,
        tags: parsedTags,
        created_by
      }
    });

    await logActivity(created_by, 'CREATE', 'book', book.id, `User mengunggah buku referensi: ${book.title}`);

    res.status(201).json({ message: 'Buku berhasil diunggah', data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengunggah buku.' });
  }
};

// GET BOOKS
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json({ data: books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memuat daftar buku.' });
  }
};

// DELETE BOOK
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    const book = await prisma.book.delete({
      where: { id }
    });

    await logActivity(user_id, 'DELETE', 'book', id, `User menghapus (soft delete) buku: ${book.title}`);

    res.json({ message: 'Buku telah dipindah ke Recycle Bin', data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus buku.' });
  }
};

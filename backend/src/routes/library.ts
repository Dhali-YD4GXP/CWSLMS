import { Router } from 'express';
import { uploadBook, getBooks, deleteBook } from '../controllers/libraryController';
import { uploadMiddleware } from '../config/upload';

const router = Router();

router.post('/upload', uploadMiddleware.single('file'), uploadBook);
router.get('/', getBooks);
router.delete('/:id', deleteBook);

export default router;

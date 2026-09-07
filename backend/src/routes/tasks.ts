import { Router } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, updateTaskProgress, uploadTaskFile } from '../controllers/tasksController';
import { uploadMiddleware } from '../config/upload';

const router = Router();

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.post('/:id/progress', updateTaskProgress);
router.post('/upload', uploadMiddleware.single('file'), uploadTaskFile);

export default router;

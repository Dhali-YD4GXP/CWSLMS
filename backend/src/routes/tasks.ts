import { Router } from 'express';
import { createTask, getTasks, deleteTask } from '../controllers/tasksController';

const router = Router();

router.post('/', createTask);
router.get('/', getTasks);
router.delete('/:id', deleteTask);

export default router;

import { Router } from 'express';
import { getDeletedItems, restoreItem } from '../controllers/recycleBinController';

const router = Router();

router.get('/', getDeletedItems);
router.post('/restore', restoreItem);

export default router;

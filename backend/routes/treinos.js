import { Router } from 'express';
import { listTreinos, createTreino } from '../controllers/treinosController.js';

const router = Router();

router.get('/', listTreinos);
router.post('/', createTreino);

export default router;

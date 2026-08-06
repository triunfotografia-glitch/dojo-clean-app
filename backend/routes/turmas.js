import { Router } from 'express';
import { listTurmas, createTurma } from '../controllers/turmasController.js';

const router = Router();

router.get('/', listTurmas);
router.post('/', createTurma);

export default router;

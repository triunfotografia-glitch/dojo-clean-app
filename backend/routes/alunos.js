import { Router } from 'express';
import { listAlunos, createAluno } from '../controllers/alunosController.js';

const router = Router();

router.get('/', listAlunos);
router.post('/', createAluno);

export default router;

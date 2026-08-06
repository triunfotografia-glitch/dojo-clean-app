import { Router } from 'express';
import { listAlunos, createAluno, updateAluno, deleteAluno } from '../controllers/alunosController.js';

const router = Router();

router.get('/', listAlunos);
router.post('/', createAluno);
router.put('/:id', updateAluno);
router.delete('/:id', deleteAluno);

export default router;

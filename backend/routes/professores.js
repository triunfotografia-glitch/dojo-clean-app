import { Router } from 'express';
import { createProfessor, listProfessores, updateProfessor } from '../controllers/professoresController.js';

const router = Router();

router.get('/', listProfessores);
router.post('/', createProfessor);
router.put('/:id', updateProfessor);

export default router;

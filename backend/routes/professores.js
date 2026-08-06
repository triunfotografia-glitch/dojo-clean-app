import { Router } from 'express';
import { listProfessores, createProfessor } from '../controllers/professoresController.js';

const router = Router();

router.get('/', listProfessores);
router.post('/', createProfessor);

export default router;

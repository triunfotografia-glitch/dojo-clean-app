import { Router } from 'express';

import {
    createGraduacao,
    deleteGraduacao,
    listGraduacoes,
    updateGraduacao,
} from '../controllers/graduacoesController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { professorMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(professorMiddleware);

router.get('/', listGraduacoes);
router.post('/', createGraduacao);
router.put('/:id', updateGraduacao);
router.delete('/:id', deleteGraduacao);

export default router;
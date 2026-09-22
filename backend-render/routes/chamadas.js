import { Router } from 'express';

import {
  createChamada,
  getChamada,
  encerrarChamada,
} from '../controllers/chamadasController.js';

import { professorMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(professorMiddleware);

router.post('/', createChamada);
router.get('/treino/:treinoId', getChamada);
router.post('/:id/encerrar', encerrarChamada);

export default router;

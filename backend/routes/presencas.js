import { Router } from 'express';

import {
    createPresenca,
    deletePresenca,
    listPresencas,
    listPresencasPorTreino,
    updatePresenca,
} from '../controllers/presencasController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { professorMiddleware, presencaScopeMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(professorMiddleware);

router.get(
  '/',
  listPresencas
);

router.get(
  '/treino/:treinoId',
  listPresencasPorTreino
);

router.post(
  '/',
  createPresenca
);

router.put(
  '/:id',
  presencaScopeMiddleware,
  updatePresenca
);

router.delete(
  '/:id',
  presencaScopeMiddleware,
  deletePresenca
);

export default router;

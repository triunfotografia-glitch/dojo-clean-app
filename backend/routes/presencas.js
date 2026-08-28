import { Router } from 'express';

import {
    createPresenca,
    deletePresenca,
    listPresencas,
    listPresencasPorTreino,
    updatePresenca,
} from '../controllers/presencasController.js';

import { professorMiddleware, presencaScopeMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

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
  professorMiddleware,
  createPresenca
);

router.put(
  '/:id',
  professorMiddleware,
  presencaScopeMiddleware,
  updatePresenca
);

router.delete(
  '/:id',
  professorMiddleware,
  presencaScopeMiddleware,
  deletePresenca
);

export default router;

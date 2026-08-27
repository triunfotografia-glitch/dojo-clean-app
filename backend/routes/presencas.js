import { Router } from 'express';

import {
    createPresenca,
    deletePresenca,
    listPresencas,
    listPresencasPorTreino,
    updatePresenca,
} from '../controllers/presencasController.js';

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
  createPresenca
);

router.put(
  '/:id',
  updatePresenca
);

router.delete(
  '/:id',
  deletePresenca
);

export default router;

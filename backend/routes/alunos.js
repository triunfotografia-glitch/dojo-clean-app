import { Router } from 'express';

import {
    createAluno,
    deleteAluno,
    listAlunos,
    updateAluno,
} from '../controllers/alunosController.js';

import {
    authMiddleware,
} from '../middleware/authMiddleware.js';

const router = Router();

// ==============================
// ROTAS PROTEGIDAS POR JWT
// ==============================

router.get(
  '/',
  authMiddleware,
  listAlunos
);

router.post(
  '/',
  authMiddleware,
  createAluno
);

router.put(
  '/:id',
  authMiddleware,
  updateAluno
);

router.delete(
  '/:id',
  authMiddleware,
  deleteAluno
);

export default router;
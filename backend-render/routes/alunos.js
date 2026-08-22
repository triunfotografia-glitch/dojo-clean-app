import { Router } from 'express';

import {
  createAluno,
  deleteAluno,
  getAluno,
  listAlunos,
  updateAluno,
} from '../controllers/alunosController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/* =========================================================
   ROTAS DE ALUNOS
   Todas protegidas por JWT
========================================================= */

// GET /alunos
router.get(
  '/',
  authMiddleware,
  listAlunos
);

// GET /alunos/:id
router.get(
  '/:id',
  authMiddleware,
  getAluno
);

// POST /alunos
router.post(
  '/',
  authMiddleware,
  createAluno
);

// PUT /alunos/:id
router.put(
  '/:id',
  authMiddleware,
  updateAluno
);

// DELETE /alunos/:id
router.delete(
  '/:id',
  authMiddleware,
  deleteAluno
);

export default router;
import { Router } from 'express';

import {
  createAluno,
  deleteAluno,
  getAluno,
  listAlunos,
  updateAluno,
} from '../controllers/alunosController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

import {
  professorMiddleware,
  alunoScopeMiddleware,
} from '../middleware/adminMiddleware.js';

const router = Router();

/* =========================================================
   ROTAS DE ALUNOS
   Todas protegidas por JWT
========================================================= */

// GET /alunos
router.get(
  '/',
  authMiddleware,
  professorMiddleware,
  listAlunos
);

// GET /alunos/:id
router.get(
  '/:id',
  authMiddleware,
  professorMiddleware,
  alunoScopeMiddleware,
  getAluno
);

// POST /alunos
router.post(
  '/',
  authMiddleware,
  professorMiddleware,
  createAluno
);

// PUT /alunos/:id
router.put(
  '/:id',
  authMiddleware,
  professorMiddleware,
  alunoScopeMiddleware,
  updateAluno
);

// DELETE /alunos/:id
router.delete(
  '/:id',
  authMiddleware,
  professorMiddleware,
  alunoScopeMiddleware,
  deleteAluno
);

export default router;
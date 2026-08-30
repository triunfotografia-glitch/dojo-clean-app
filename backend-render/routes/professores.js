import { Router } from 'express';

import {
  createProfessor,
  deleteProfessor,
  listProfessores,
  updateProfessor,
} from '../controllers/professoresController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

import {
  professorMiddleware,
  adminMiddleware,
  professorScopeMiddleware,
} from '../middleware/adminMiddleware.js';

const router = Router();

// ==============================
// LISTAR PROFESSORES
// ==============================
// Qualquer professor autenticado
// pode consultar a lista (filtrada por escopo).

router.get(
  '/',
  authMiddleware,
  professorMiddleware,
  listProfessores
);

// ==============================
// CRIAR PROFESSOR
// ==============================
// Somente administrador.

router.post(
  '/',
  authMiddleware,
  professorMiddleware,
  adminMiddleware,
  createProfessor
);

// ==============================
// ATUALIZAR PROFESSOR
// ==============================
// Somente administrador, com escopo por ID.

router.put(
  '/:id',
  authMiddleware,
  professorMiddleware,
  professorScopeMiddleware,
  updateProfessor
);

// ==============================
// DELETAR PROFESSOR
// ==============================
// Somente administrador, com escopo por ID
// e proteção contra auto-exclusão.

router.delete(
  '/:id',
  authMiddleware,
  professorMiddleware,
  adminMiddleware,
  professorScopeMiddleware,
  deleteProfessor
);

export default router;
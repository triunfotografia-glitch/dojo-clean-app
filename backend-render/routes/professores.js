import { Router } from 'express';

import {
  createProfessor,
  deleteProfessor,
  listProfessores,
  updateProfessor,
} from '../controllers/professoresController.js';

import {
  authMiddleware,
} from '../middleware/authMiddleware.js';

import {
  adminMiddleware,
} from '../middleware/adminMiddleware.js';

const router = Router();

// ==============================
// LISTAR PROFESSORES
// ==============================
// Qualquer professor autenticado
// pode consultar a lista.

router.get(
  '/',
  authMiddleware,
  listProfessores
);

// ==============================
// CRIAR PROFESSOR
// ==============================
// Somente administrador.

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  createProfessor
);

// ==============================
// ATUALIZAR PROFESSOR
// ==============================
// Somente administrador.

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  updateProfessor
);

// ==============================
// DELETAR PROFESSOR
// ==============================
// Somente administrador.

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deleteProfessor
);

export default router;
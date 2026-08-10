import { Router } from 'express';

import {
    createProfessor,
    listProfessores,
    updateProfessor,
} from '../controllers/professoresController.js';

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
  listProfessores
);

router.post(
  '/',
  authMiddleware,
  createProfessor
);

router.put(
  '/:id',
  authMiddleware,
  updateProfessor
);

export default router;
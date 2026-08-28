import { Router } from 'express';

import {
    createPresenca,
    deletePresenca,
    listPresencas,
    listPresencasPorTreino,
    updatePresenca,
} from '../controllers/presencasController.js';

import { professorMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

/* =========================================================
   PRESENÇAS
   O authMiddleware é aplicado no index.js
========================================================= */

/*
 * GET /presencas
 * Lista todas as presenças
 */
router.get(
  '/',
  listPresencas
);


/*
 * GET /presencas/treino/:treinoId
 * Lista presenças de um treino específico
 */
router.get(
  '/treino/:treinoId',
  listPresencasPorTreino
);


/*
 * POST /presencas
 * Registra uma presença
 */
router.post(
  '/',
  professorMiddleware,
  createPresenca
);


/*
 * PUT /presencas/:id
 * Atualiza uma presença
 */
router.put(
  '/:id',
  professorMiddleware,
  updatePresenca
);


/*
 * DELETE /presencas/:id
 * Exclui uma presença
 */
router.delete(
  '/:id',
  professorMiddleware,
  deletePresenca
);

export default router;
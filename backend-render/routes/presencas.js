import { Router } from 'express';

import {
    createPresenca,
    deletePresenca,
    listPresencas,
    listPresencasPorTreino,
    updatePresenca,
} from '../controllers/presencasController.js';

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
  createPresenca
);


/*
 * PUT /presencas/:id
 * Atualiza uma presença
 */
router.put(
  '/:id',
  updatePresenca
);


/*
 * DELETE /presencas/:id
 * Exclui uma presença
 */
router.delete(
  '/:id',
  deletePresenca
);

export default router;
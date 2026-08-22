import { Router } from 'express';

import {
    createGraduacao,
    deleteGraduacao,
    listGraduacoes,
    updateGraduacao,
} from '../controllers/graduacoesController.js';

const router = Router();

/* =========================================================
   ROTAS DE GRADUAÇÕES
   O authMiddleware é aplicado no index.js
========================================================= */

/*
 * GET /graduacoes
 * Lista todas as graduações
 */
router.get(
  '/',
  listGraduacoes
);


/*
 * POST /graduacoes
 * Cria uma nova graduação
 */
router.post(
  '/',
  createGraduacao
);


/*
 * PUT /graduacoes/:id
 * Atualiza uma graduação
 */
router.put(
  '/:id',
  updateGraduacao
);


/*
 * DELETE /graduacoes/:id
 * Exclui uma graduação
 */
router.delete(
  '/:id',
  deleteGraduacao
);

export default router;
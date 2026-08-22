import { Router } from 'express';

import {
    createPresenca,
    listPresencas,
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
 * POST /presencas
 * Registra uma presença
 */
router.post(
  '/',
  createPresenca
);

export default router;
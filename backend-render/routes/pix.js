import { Router } from 'express';

import {
  getPix,
  updatePix,
} from '../controllers/pixController.js';

import {
  authMiddleware,
} from '../middleware/authMiddleware.js';

import {
  adminMiddleware,
} from '../middleware/adminMiddleware.js';

const router = Router();

/* =========================================================
   PIX
   GET disponível para professores autenticados.
   PUT exclusivo para administrador.
========================================================= */

router.get(
  '/',
  authMiddleware,
  getPix
);

router.put(
  '/',
  authMiddleware,
  adminMiddleware,
  updatePix
);

export default router;

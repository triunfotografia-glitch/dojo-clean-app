import { Router } from 'express';

import {
  getPix,
  updatePix,
  listarChavesPix,
  listarChavesPixAtivas,
  criarChavePix,
  editarChavePix,
  excluirChavePix,
} from '../controllers/pixController.js';

import {
  authMiddleware,
} from '../middleware/authMiddleware.js';

import {
  adminMiddleware,
} from '../middleware/adminMiddleware.js';

const router = Router();

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

router.get(
  '/chaves/ativas',
  authMiddleware,
  listarChavesPixAtivas
);

router.get(
  '/chaves',
  authMiddleware,
  adminMiddleware,
  listarChavesPix
);

router.post(
  '/chaves',
  authMiddleware,
  adminMiddleware,
  criarChavePix
);

router.put(
  '/chaves/:id',
  authMiddleware,
  adminMiddleware,
  editarChavePix
);

router.delete(
  '/chaves/:id',
  authMiddleware,
  adminMiddleware,
  excluirChavePix
);

export default router;

import { Router } from 'express';

import {
  createCobranca,
  deleteCobranca,
  listCobrancas,
  updateCobranca,
} from '../controllers/cobrancasController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { professorMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(professorMiddleware);

router.get('/', listCobrancas);
router.post('/', createCobranca);
router.put('/:id', updateCobranca);
router.delete('/:id', deleteCobranca);

export default router;

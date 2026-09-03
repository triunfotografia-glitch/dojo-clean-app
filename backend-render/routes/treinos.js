import { Router } from 'express';

import {
  listTreinos,
  getTreino,
  createTreino,
  updateTreino,
  deleteTreino,
} from '../controllers/treinosController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { professorMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(professorMiddleware);

router.get('/', listTreinos);
router.get('/:id', getTreino);

router.post('/', createTreino);

router.put('/:id', updateTreino);
router.delete('/:id', deleteTreino);

export default router;
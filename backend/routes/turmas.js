import { Router } from 'express';

import {
  listTurmas,
  getTurma,
  createTurma,
  updateTurma,
  deleteTurma,
} from '../controllers/turmasController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { professorMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(professorMiddleware);

router.get('/', listTurmas);
router.get('/:id', getTurma);

router.post('/', createTurma);

router.put('/:id', updateTurma);
router.delete('/:id', deleteTurma);

export default router;

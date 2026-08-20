import { Router } from 'express';

import {
  listTreinos,
  getTreino,
  createTreino,
  updateTreino,
  deleteTreino,
} from '../controllers/treinosController.js';

const router = Router();

router.get('/', listTreinos);
router.get('/:id', getTreino);

router.post('/', createTreino);

router.put('/:id', updateTreino);
router.delete('/:id', deleteTreino);

export default router;
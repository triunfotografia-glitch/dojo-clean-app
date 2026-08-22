import { Router } from 'express';

import {
  listCobrancas,
  createCobranca,
  updateCobranca,
  deleteCobranca,
} from '../controllers/cobrancasController.js';

const router = Router();

router.get('/', listCobrancas);
router.post('/', createCobranca);
router.put('/:id', updateCobranca);
router.delete('/:id', deleteCobranca);

export default router;

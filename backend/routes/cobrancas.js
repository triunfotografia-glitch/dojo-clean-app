import { Router } from 'express';
import { listCobrancas, createCobranca } from '../controllers/cobrancasController.js';

const router = Router();

router.get('/', listCobrancas);
router.post('/', createCobranca);

export default router;

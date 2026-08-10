import { Router } from 'express';

import {
    createCobranca,
    listCobrancas,
} from '../controllers/cobrancasController.js';

const router = Router();

router.get('/', listCobrancas);
router.post('/', createCobranca);

export default router;
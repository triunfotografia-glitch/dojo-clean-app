import { Router } from 'express';
import { listPresencas, createPresenca } from '../controllers/presencasController.js';

const router = Router();

router.get('/', listPresencas);
router.post('/', createPresenca);

export default router;

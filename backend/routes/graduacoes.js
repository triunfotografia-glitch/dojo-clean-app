import { Router } from 'express';
import { listGraduacoes, createGraduacao } from '../controllers/graduacoesController.js';

const router = Router();

router.get('/', listGraduacoes);
router.post('/', createGraduacao);

export default router;

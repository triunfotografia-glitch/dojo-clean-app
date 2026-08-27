import { Router } from 'express';

import {
  listCampeonatos,
} from '../controllers/campeonatosController.js';

const router = Router();

router.get('/', listCampeonatos);

export default router;

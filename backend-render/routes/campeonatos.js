import { Router } from 'express';

import {
  listCampeonatos,
} from '../controllers/campeonatosController.js';

const router = Router();

/* =========================================================
   CAMPEONATOS
========================================================= */

router.get('/', listCampeonatos);

export default router;

import { Router } from 'express';

import {
  getPix,
  updatePix,
} from '../controllers/pixController.js';

const router = Router();

/* =========================================================
   PIX
========================================================= */

router.get('/', getPix);
router.put('/', updatePix);

export default router;

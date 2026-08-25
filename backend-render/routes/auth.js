import { Router } from 'express';

import rateLimit from 'express-rate-limit';

import { login } from '../controllers/authController.js';
import { esqueciSenha, redefinirSenha } from '../controllers/authController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/esqueci-senha', authLimiter, esqueciSenha);
router.post('/redefinir-senha', redefinirSenha);

export default router;

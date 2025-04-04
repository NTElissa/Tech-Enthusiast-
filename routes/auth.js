import express from 'express';
import { signup } from '../controllers/auth/signup.js';
import { login } from '../controllers/auth/login.js';
import { verifyEmail } from '../controllers/auth/verify.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);

export default router;

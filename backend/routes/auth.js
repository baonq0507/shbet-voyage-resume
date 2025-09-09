import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  refreshToken, 
  logout,
  checkUsername
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  validateUserRegistration, 
  validateUserLogin 
} from '../middleware/validation.js';
import { 
  authLimiter, 
  registerLimiter 
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', registerLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, validateUserLogin, login);
router.post('/check-username', checkUsername);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticateToken, logout);

export default router;

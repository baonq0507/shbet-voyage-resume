import express from 'express';
import { 
  createDepositOrder,
  getUserTransactions,
  getTransactionById
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTransaction, validatePagination } from '../middleware/validation.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Transaction routes
router.post('/deposit', transactionLimiter, validateTransaction, createDepositOrder);
router.get('/', validatePagination, getUserTransactions);
router.get('/:id', getTransactionById);

export default router;

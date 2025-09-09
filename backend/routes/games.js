import express from 'express';
import { 
  getGamesByCategory,
  getAllGames,
  getGameById,
  getGameCategories,
  getGameProviders,
  gameLogin,
  depositToGame,
  withdrawFromGame
} from '../controllers/gameController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/categories', getGameCategories);
router.get('/providers', getGameProviders);
router.get('/all', validatePagination, getAllGames);
router.get('/category/:category', validatePagination, getGamesByCategory);
router.get('/:id', getGameById);

// Protected routes
router.use(authenticateToken);
router.post('/:gameId/login', gameLogin);
router.post('/deposit', depositToGame);
router.post('/withdraw', withdrawFromGame);

export default router;

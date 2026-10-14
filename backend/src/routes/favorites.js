import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} from '../controllers/favoriteController.js';

const router = Router();

router.get('/my-favorites', authenticate, authorize('client'), getMyFavorites);
router.post('/', authenticate, authorize('client'), addFavorite);
router.delete('/:houseId', authenticate, authorize('client'), removeFavorite);
router.get('/check/:houseId', authenticate, authorize('client'), checkFavorite);

export default router;

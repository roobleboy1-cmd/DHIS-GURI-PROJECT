import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getEngineerReviews
} from '../controllers/reviewController.js';

const router = Router();

router.get('/', getReviews);
router.get('/engineer/:engineerId', getEngineerReviews);
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;

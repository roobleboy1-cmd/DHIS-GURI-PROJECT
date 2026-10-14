import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  getProjectProgress,
  addProgress,
  updateProgress,
  deleteProgress
} from '../controllers/progressController.js';

const router = Router();

router.get('/project/:projectId', authenticate, getProjectProgress);
router.post('/project/:projectId', authenticate, authorize('engineer', 'admin'), addProgress);
router.put('/:id', authenticate, authorize('engineer', 'admin'), updateProgress);
router.delete('/:id', authenticate, authorize('engineer', 'admin'), deleteProgress);

export default router;

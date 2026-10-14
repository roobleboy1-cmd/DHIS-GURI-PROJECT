import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getAllEngineers, getEngineerById, updateEngineerProfile, verifyEngineer } from '../controllers/engineerController.js';

const router = Router();

router.get('/', getAllEngineers);
router.get('/:id', getEngineerById);
router.put('/profile', authenticate, authorize('engineer'), updateEngineerProfile);
router.patch('/:id/verify', authenticate, authorize('admin'), verifyEngineer);

export default router;

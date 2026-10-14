import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getAllUsers, getUserById, updateUserStatus, deleteUser, getUserStats } from '../controllers/userController.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;

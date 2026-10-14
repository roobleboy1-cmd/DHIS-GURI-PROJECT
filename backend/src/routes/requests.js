import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { createRequest, getMyRequests, getAllRequests, getRequestById, updateRequestStatus, assignEngineer } from '../controllers/requestController.js';

const router = Router();

router.post('/', authenticate, authorize('client'), createRequest);
router.get('/my-requests', authenticate, authorize('client'), getMyRequests);
router.get('/', authenticate, authorize('admin', 'engineer'), getAllRequests);
router.get('/:id', authenticate, getRequestById);
router.patch('/:id/status', authenticate, authorize('admin'), updateRequestStatus);
router.patch('/:id/assign-engineer', authenticate, authorize('admin'), assignEngineer);

export default router;

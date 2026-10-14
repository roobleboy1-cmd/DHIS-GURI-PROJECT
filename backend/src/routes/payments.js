import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  getProjectPayments,
  getAllPayments,
  getMyPayments,
  createPayment,
  updatePaymentStatus
} from '../controllers/paymentController.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAllPayments);
router.get('/my-payments', authenticate, authorize('client'), getMyPayments);
router.get('/project/:projectId', authenticate, getProjectPayments);
router.post('/', authenticate, authorize('admin'), createPayment);
router.patch('/:id/status', authenticate, authorize('admin'), updatePaymentStatus);

export default router;

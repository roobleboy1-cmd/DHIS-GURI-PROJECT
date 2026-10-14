import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  getAdminDashboard,
  getEngineerDashboard,
  getClientDashboard,
  getWorkerDashboard
} from '../controllers/dashboardController.js';

const router = Router();

router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);
router.get('/engineer', authenticate, authorize('engineer'), getEngineerDashboard);
router.get('/client', authenticate, authorize('client'), getClientDashboard);
router.get('/worker', authenticate, authorize('worker'), getWorkerDashboard);

export default router;

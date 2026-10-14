import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getWorkers, getWorkerById, registerWorker, updateWorker, updateAvailability, getMyWorkers } from '../controllers/workerController.js';

const router = Router();

router.get('/', authenticate, getWorkers);
router.get('/my-workers', authenticate, authorize('engineer'), getMyWorkers);
router.get('/:id', authenticate, getWorkerById);
router.post('/', authenticate, authorize('engineer'), registerWorker);
router.put('/:id', authenticate, authorize('engineer', 'admin'), updateWorker);
router.patch('/availability', authenticate, authorize('worker'), updateAvailability);

export default router;

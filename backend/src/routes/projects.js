import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getAllProjects, getProjectById, createProject, updateProject, updateProjectStatus, assignWorker, removeWorker } from '../controllers/projectController.js';

const router = Router();

router.get('/', authenticate, getAllProjects);
router.get('/:id', authenticate, getProjectById);
router.post('/', authenticate, authorize('admin'), createProject);
router.put('/:id', authenticate, authorize('admin', 'engineer'), updateProject);
router.patch('/:id/status', authenticate, authorize('admin', 'engineer'), updateProjectStatus);
router.post('/:id/workers', authenticate, authorize('admin', 'engineer'), assignWorker);
router.delete('/:id/workers/:workerId', authenticate, authorize('admin', 'engineer'), removeWorker);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  getProjectDocuments,
  addDocument,
  updateDocument,
  deleteDocument
} from '../controllers/documentController.js';

const router = Router();

router.get('/project/:projectId', authenticate, getProjectDocuments);
router.post('/project/:projectId', authenticate, authorize('engineer', 'admin'), addDocument);
router.put('/:id', authenticate, authorize('engineer', 'admin'), updateDocument);
router.delete('/:id', authenticate, authorize('engineer', 'admin'), deleteDocument);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getDesigns, getDesignById, createDesign, updateDesign, deleteDesign } from '../controllers/designController.js';

const router = Router();

router.get('/', getDesigns);
router.get('/:id', getDesignById);
router.post('/', authenticate, authorize('admin'), createDesign);
router.put('/:id', authenticate, authorize('admin'), updateDesign);
router.delete('/:id', authenticate, authorize('admin'), deleteDesign);

export default router;

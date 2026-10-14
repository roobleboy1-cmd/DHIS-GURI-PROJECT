import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getAllHouses, getHouseById, createHouse, updateHouse, deleteHouse, getFeaturedHouses } from '../controllers/houseController.js';

const router = Router();

router.get('/', getAllHouses);
router.get('/featured', getFeaturedHouses);
router.get('/:id', getHouseById);
router.post('/', authenticate, authorize('admin'), createHouse);
router.put('/:id', authenticate, authorize('admin'), updateHouse);
router.delete('/:id', authenticate, authorize('admin'), deleteHouse);

export default router;

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js';

const router = Router();

router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(['client', 'engineer']).withMessage('Role must be client or engineer.')
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
], validate, login);

router.get('/profile', authenticate, getProfile);
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, [
  body('current_password').notEmpty().withMessage('Current password is required.'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
], validate, changePassword);

export default router;

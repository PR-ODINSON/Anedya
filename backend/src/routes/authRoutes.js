import express from 'express';
import { loginUser, registerUser, logoutUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { check } from 'express-validator';

const router = express.Router();

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], loginUser);

router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile);

// Only Admins can register new users
router.post('/register', protect, requirePermission('user:manage'), [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], registerUser);

export default router;

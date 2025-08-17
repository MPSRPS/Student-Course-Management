import express from 'express';
import { login, register, getProfile } from '../controllers/authController.js';
import { authenticateToken, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/login', login);

// Protected Routes
router.post('/register', authenticateToken, adminOnly, register); // Only admin can create accounts
router.get('/profile', authenticateToken, getProfile);

export default router;

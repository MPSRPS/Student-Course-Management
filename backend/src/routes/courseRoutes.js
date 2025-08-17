import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getStudentsInCourse,
  getCourseStats
} from '../controllers/courseController.js';
import { authenticateToken, adminOnly, studentOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only routes (put specific routes before parameterized ones)
router.get('/admin/stats', authenticateToken, adminOnly, getCourseStats);

// Routes accessible by both Student and Admin
router.get('/', authenticateToken, studentOrAdmin, getAllCourses);
router.get('/:id', authenticateToken, studentOrAdmin, getCourseById);

// Routes accessible by Admin only
router.post('/', authenticateToken, adminOnly, createCourse);
router.put('/:id', authenticateToken, adminOnly, updateCourse);
router.delete('/:id', authenticateToken, adminOnly, deleteCourse);
router.get('/:id/students', authenticateToken, adminOnly, getStudentsInCourse);

export default router;

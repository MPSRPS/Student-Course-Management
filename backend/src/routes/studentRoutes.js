import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByCourse,
  resetStudentPassword
} from '../controllers/studentController.js';
import { authenticateToken, adminOnly, studentOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes first (before parameterized routes)
router.get('/course/:courseId', authenticateToken, adminOnly, getStudentsByCourse);

// Routes accessible by Admin only
router.get('/', authenticateToken, adminOnly, getAllStudents);
router.post('/', authenticateToken, adminOnly, createStudent);
router.put('/:id', authenticateToken, adminOnly, updateStudent);
router.put('/:id/reset-password', authenticateToken, adminOnly, resetStudentPassword);
router.delete('/:id', authenticateToken, adminOnly, deleteStudent);

// Routes accessible by Student (own data) or Admin (any data)
router.get('/:id', authenticateToken, studentOrAdmin, getStudentById);

export default router;

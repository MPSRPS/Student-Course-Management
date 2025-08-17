import { executeQuery } from '../db.js';
import bcrypt from 'bcryptjs';

// Get All Students (Admin only)
export const getAllStudents = async (req, res) => {
  try {
    const students = await executeQuery(`
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.date_of_birth,
        s.enrollment_date,
        s.status,
        s.created_at,
        s.updated_at,
        c.id as course_id,
        c.name as course_name,
        c.instructor as course_instructor
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      ORDER BY s.created_at DESC
    `);

    res.json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
};

// Get Single Student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const students = await executeQuery(`
      SELECT 
        s.*,
        c.id as course_id,
        c.name as course_name,
        c.description as course_description,
        c.instructor as course_instructor,
        c.duration as course_duration
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student: students[0]
    });

  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student'
    });
  }
};

// Create New Student (Admin only) - With Transaction Management
export const createStudent = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      course_id,
      password = 'student123' // Default password
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if email already exists
    const existingStudents = await executeQuery(
      'SELECT id FROM students WHERE email = ?',
      [email]
    );

    if (existingStudents.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Hash password and create user account first
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user account
    const userResult = await executeQuery(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'student']
    );
    
    const userId = userResult.insertId;

    // Create student record
    const studentResult = await executeQuery(`
      INSERT INTO students (user_id, first_name, last_name, email, phone, date_of_birth, course_id, status, enrollment_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [userId, first_name, last_name, email, phone || null, date_of_birth || null, course_id || null]);

    // Get the created student with course info
    const newStudent = await executeQuery(`
      SELECT 
        s.*,
        c.name as course_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = ?
    `, [studentResult.insertId]);

    res.status(201).json({
      success: true,
      message: 'Student created successfully using stored procedure',
      student: newStudent[0],
      defaultPassword: password // Return for admin to inform student
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating student: ' + error.message
    });
  }
};

// Update Student (Admin only)
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      course_id,
      status
    } = req.body;

    // Check if student exists
    const existingStudents = await executeQuery(
      'SELECT user_id FROM students WHERE id = ?',
      [id]
    );

    if (existingStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = existingStudents[0];

    // Update student record
    await executeQuery(`
      UPDATE students 
      SET first_name = ?, last_name = ?, email = ?, phone = ?, 
          date_of_birth = ?, course_id = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [first_name, last_name, email, phone, date_of_birth, course_id, status, id]);

    // Update user email if it changed
    if (email) {
      await executeQuery(
        'UPDATE users SET email = ? WHERE id = ?',
        [email, student.user_id]
      );
    }

    // Get updated student with course info
    const updatedStudent = await executeQuery(`
      SELECT 
        s.*,
        c.name as course_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent[0]
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student'
    });
  }
};

// Delete Student (Admin only)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists and get user_id
    const students = await executeQuery(
      'SELECT user_id FROM students WHERE id = ?',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const userId = students[0].user_id;

    // Delete student record (this will cascade to user due to foreign key)
    await executeQuery('DELETE FROM students WHERE id = ?', [id]);
    
    // Delete user account
    if (userId) {
      await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student'
    });
  }
};

// Get Students by Course (Admin only)
export const getStudentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await executeQuery(`
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.enrollment_date,
        s.status,
        c.name as course_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.course_id = ?
      ORDER BY s.first_name, s.last_name
    `, [courseId]);

    res.json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    console.error('Get students by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students by course'
    });
  }
};

// Reset Student Password (Admin only)
export const resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword = 'student123' } = req.body;

    // Check if student exists
    const students = await executeQuery(
      'SELECT user_id, email FROM students WHERE id = ?',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in users table
    await executeQuery(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, student.user_id]
    );

    res.json({
      success: true,
      message: 'Student password reset successfully',
      email: student.email,
      newPassword: newPassword // Return for admin to inform student
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting student password'
    });
  }
};

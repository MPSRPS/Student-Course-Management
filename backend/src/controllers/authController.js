import bcrypt from 'bcryptjs';
import { executeQuery } from '../db.js';
import { generateToken } from '../middleware/authMiddleware.js';

//Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    const users = await executeQuery(
      'SELECT id, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Get additional user info based on role
    let userData = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // If student, get student details
    if (user.role === 'student') {
      const studentInfo = await executeQuery(`
        SELECT s.*, c.name as course_name 
        FROM students s 
        LEFT JOIN courses c ON s.course_id = c.id 
        WHERE s.user_id = ?
      `, [user.id]);
      
      if (studentInfo.length > 0) {
        userData.studentInfo = studentInfo[0];
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};
// Register Controller (Admin can create accounts)
export const register = async (req, res) => {
  try {
    const { email, password, role = 'student' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await executeQuery(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

//Get Current User Profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const users = await executeQuery(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    let responseData = { ...user };

    // If student, get student details
    if (user.role === 'student') {
      const studentInfo = await executeQuery(`
        SELECT s.*, c.name as course_name, c.description as course_description
        FROM students s 
        LEFT JOIN courses c ON s.course_id = c.id 
        WHERE s.user_id = ?
      `, [userId]);
      
      if (studentInfo.length > 0) {
        responseData.studentInfo = studentInfo[0];
      }
    }

    res.json({
      success: true,
      user: responseData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

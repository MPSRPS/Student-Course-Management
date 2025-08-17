import { executeQuery } from '../db.js';

// Get All Courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await executeQuery(`
      SELECT 
        c.*,
        COUNT(s.id) as student_count
      FROM courses c
      LEFT JOIN students s ON c.id = s.course_id AND s.status = 'active'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      count: courses.length,
      courses
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};

// Get Single Course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const courses = await executeQuery(`
      SELECT 
        c.*,
        COUNT(s.id) as student_count
      FROM courses c
      LEFT JOIN students s ON c.id = s.course_id AND s.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      course: courses[0]
    });

  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
};

// Create New Course (Admin only)
export const createCourse = async (req, res) => {
  try {
    const { name, description, duration, instructor } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Course name is required'
      });
    }

    // Check if course with same name already exists
    const existingCourses = await executeQuery(
      'SELECT id FROM courses WHERE name = ?',
      [name]
    );

    if (existingCourses.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Course with this name already exists'
      });
    }

    // Create course
    const result = await executeQuery(
      'INSERT INTO courses (name, description, duration, instructor) VALUES (?, ?, ?, ?)',
      [name, description, duration, instructor]
    );

    // Get the created course
    const newCourse = await executeQuery(
      'SELECT * FROM courses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: newCourse[0]
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
};

// Update Course (Admin only)
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, instructor } = req.body;

    // Check if course exists
    const existingCourses = await executeQuery(
      'SELECT id FROM courses WHERE id = ?',
      [id]
    );

    if (existingCourses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if another course with same name exists (excluding current course)
    if (name) {
      const duplicateCheck = await executeQuery(
        'SELECT id FROM courses WHERE name = ? AND id != ?',
        [name, id]
      );

      if (duplicateCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another course with this name already exists'
        });
      }
    }

    // Update course
    await executeQuery(`
      UPDATE courses 
      SET name = ?, description = ?, duration = ?, instructor = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, description, duration, instructor, id]);

    // Get updated course with student count
    const updatedCourse = await executeQuery(`
      SELECT 
        c.*,
        COUNT(s.id) as student_count
      FROM courses c
      LEFT JOIN students s ON c.id = s.course_id AND s.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    res.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse[0]
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course'
    });
  }
};

// Delete Course (Admin only)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const courses = await executeQuery(
      'SELECT id FROM courses WHERE id = ?',
      [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if there are students enrolled in this course
    const enrolledStudents = await executeQuery(
      'SELECT COUNT(*) as count FROM students WHERE course_id = ?',
      [id]
    );

    if (enrolledStudents[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course. ${enrolledStudents[0].count} student(s) are enrolled. Please reassign or remove students first.`
      });
    }

    // Delete course
    await executeQuery('DELETE FROM courses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
}
// Get Students in a Course
export const getStudentsInCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if course exists
    const courses = await executeQuery(
      'SELECT * FROM courses WHERE id = ?',
      [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get students in the course
    const students = await executeQuery(`
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.enrollment_date,
        s.status
      FROM students s
      WHERE s.course_id = ?
      ORDER BY s.first_name, s.last_name
    `, [id]);

    res.json({
      success: true,
      course: courses[0],
      studentCount: students.length,
      students
    });

  } catch (error) {
    console.error('Get students in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students in course'
    });
  }
};

// Get Course Statistics (Admin only)
export const getCourseStats = async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_students,
        COUNT(DISTINCT CASE WHEN s.status = 'graduated' THEN s.id END) as graduated_students,
        COUNT(DISTINCT CASE WHEN s.status = 'inactive' THEN s.id END) as inactive_students
      FROM courses c
      LEFT JOIN students s ON c.id = s.course_id
    `);

    // Get course-wise student distribution
    const courseDistribution = await executeQuery(`
      SELECT 
        c.id,
        c.name,
        COUNT(s.id) as student_count,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_count
      FROM courses c
      LEFT JOIN students s ON c.id = s.course_id
      GROUP BY c.id, c.name
      ORDER BY student_count DESC
    `);

    res.json({
      success: true,
      statistics: stats[0],
      courseDistribution
    });

  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics'
    });
  }
};

-- Student & Course Management System Database Schema
-- Created: December 2024

CREATE DATABASE IF NOT EXISTS student_course_db;
USE student_course_db;

-- ✅ Courses Table (Updated to match assignment requirements)
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    course_duration INT NOT NULL COMMENT 'Duration in months',
    instructor VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ✅ Users Table (for Authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ✅ Students Table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    course_id INT,
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ✅ Add Indexes for Performance
CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_name ON courses(name);

-- ✅ Insert Sample Data

-- Insert sample courses (Updated for new schema)
INSERT INTO courses (course_name, course_code, course_duration, instructor, description) VALUES
('Computer Science', 'CS101', 48, 'Dr. John Smith', 'Comprehensive computer science program covering programming, algorithms, and software development'),
('Business Administration', 'BA201', 36, 'Prof. Sarah Johnson', 'Business fundamentals including management, marketing, and finance'),
('Engineering', 'ENG301', 48, 'Dr. Michael Brown', 'Mechanical and electrical engineering principles and applications'),
('Mathematics', 'MATH401', 36, 'Prof. Emily Davis', 'Pure and applied mathematics with statistical analysis'),
('Art & Design', 'ART501', 24, 'Prof. Lisa Wilson', 'Creative arts, graphic design, and digital media');

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, role) VALUES
('admin@school.com', '$2b$10$8K1p/a1s5TQ9QJhRKZ9Wh.xJj5K6ZlK6xM2j9H8t6R3vN4cQ1wP9K', 'admin');

-- Insert sample student users (password: student123)
INSERT INTO users (email, password, role) VALUES
('john.doe@student.com', '$2b$10$8K1p/a1s5TQ9QJhRKZ9Wh.xJj5K6ZlK6xM2j9H8t6R3vN4cQ1wP9K', 'student'),
('jane.smith@student.com', '$2b$10$8K1p/a1s5TQ9QJhRKZ9Wh.xJj5K6ZlK6xM2j9H8t6R3vN4cQ1wP9K', 'student'),
('bob.johnson@student.com', '$2b$10$8K1p/a1s5TQ9QJhRKZ9Wh.xJj5K6ZlK6xM2j9H8t6R3vN4cQ1wP9K', 'student');

-- Insert sample students
INSERT INTO students (user_id, first_name, last_name, email, phone, date_of_birth, course_id) VALUES
(2, 'John', 'Doe', 'john.doe@student.com', '+1-555-0101', '2000-05-15', 1),
(3, 'Jane', 'Smith', 'jane.smith@student.com', '+1-555-0102', '1999-08-22', 2),
(4, 'Bob', 'Johnson', 'bob.johnson@student.com', '+1-555-0103', '2001-03-10', 1);

-- ✅ STORED PROCEDURES (Assignment Requirement)

DELIMITER //

-- Stored Procedure: Insert new student with course association
CREATE PROCEDURE InsertStudentWithCourse(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_date_of_birth DATE,
    IN p_course_id INT
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Insert user account
    INSERT INTO users (email, password, role) 
    VALUES (p_email, p_password, 'student');
    
    SET v_user_id = LAST_INSERT_ID();
    
    -- Insert student record
    INSERT INTO students (user_id, first_name, last_name, email, phone, date_of_birth, course_id, enrollment_date)
    VALUES (v_user_id, p_first_name, p_last_name, p_email, p_phone, p_date_of_birth, p_course_id, CURDATE());
    
    COMMIT;
END //

-- Stored Procedure: Update student details with course reassignment
CREATE PROCEDURE UpdateStudentWithCourse(
    IN p_student_id INT,
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_date_of_birth DATE,
    IN p_course_id INT,
    IN p_status ENUM('active', 'inactive', 'graduated')
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Get user_id for the student
    SELECT user_id INTO v_user_id FROM students WHERE id = p_student_id;
    
    -- Update student record
    UPDATE students 
    SET first_name = p_first_name, 
        last_name = p_last_name, 
        email = p_email, 
        phone = p_phone,
        date_of_birth = p_date_of_birth, 
        course_id = p_course_id, 
        status = p_status,
        updated_at = NOW()
    WHERE id = p_student_id;
    
    -- Update user email
    UPDATE users 
    SET email = p_email 
    WHERE id = v_user_id;
    
    COMMIT;
END //

-- Stored Procedure: Delete student and handle course relationships
CREATE PROCEDURE DeleteStudentSafely(
    IN p_student_id INT,
    IN p_delete_user BOOLEAN DEFAULT TRUE
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Get user_id before deletion
    SELECT user_id INTO v_user_id FROM students WHERE id = p_student_id;
    
    -- Delete student record (course relationship handled by ON DELETE SET NULL)
    DELETE FROM students WHERE id = p_student_id;
    
    -- Optionally delete user account
    IF p_delete_user AND v_user_id IS NOT NULL THEN
        DELETE FROM users WHERE id = v_user_id;
    END IF;
    
    COMMIT;
END //

DELIMITER ;

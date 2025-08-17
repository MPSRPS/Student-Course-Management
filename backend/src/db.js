import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database Connection Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'student_course_db',
  connectionLimit: 10,
  multipleStatements: false
};

// Create Connection Pool for better performance
const pool = mysql.createPool(dbConfig);

// Test Database Connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL Database!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// Execute Query Helper Function
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error(' Query execution failed:', error.message);
    throw error;
  }
};

export default pool;

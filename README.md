# 🎓 Student & Course Management System

A full-stack web application for managing students and courses with role-based authentication, built with modern technologies and best practices.

## 📋 Project Overview

This system provides a comprehensive solution for educational institutions to manage student enrollment, course catalog, and administrative tasks. It features a robust backend API with MySQL database and a responsive React frontend with role-based access control.

### 🎯 Key Features

- **Role-Based Authentication** (Admin/Student)
- **Student Management** (CRUD operations)
- **Course Management** (CRUD operations)
- **Enrollment System** (Course assignments)
- **Dashboard Analytics** (Statistics and insights)
- **Responsive Design** (Mobile-first approach)
- **RESTful API** (Clean, documented endpoints)

## � Live Demonstration

### 🎥 Video Walkthrough
> **Watch the complete system demonstration:** A comprehensive walkthrough showing all features, API testing, and user interactions.

[![Student & Course Management System Demo](EduManage%20-%20Student%20&%20Course%20Management%20-%20Google%20Chrome%202025-08-17%2021-05-39.mp4)

### 📱 What's Covered in the Demo:
- **🔐 Authentication System** - Admin & Student login flows
- **👥 Student Management** - Create, read, update, delete operations
- **📚 Course Management** - Full CRUD functionality
- **🔧 API Testing** - Complete Postman API demonstrations
- **📊 Dashboard Features** - Analytics and statistics
- **📱 Responsive Design** - Mobile and desktop views
- **🛡️ Security Features** - Role-based access control

### 🎯 Demo Highlights:
- Complete backend API testing with Postman
- Frontend user interface walkthrough
- Database operations and data flow
- Error handling and validation
- Authentication and authorization

---

*📝 **Note:** Replace the video link above with your actual demonstration video URL (YouTube, Vimeo, or direct video file)*

## �🏗️ System Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   React Frontend │ ◄────────────► │   Express API   │
│   (Port 5173)   │                 │   (Port 5000)   │
└─────────────────┘                 └─────────────────┘
                                              │
                                              │ MySQL
                                              ▼
                                    ┌─────────────────┐
                                    │   MySQL DB      │
                                    │ (Port 3306)     │
                                    └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Database Driver:** mysql2

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router
- **HTTP Client:** Axios
- **State Management:** Context API

## 📁 Project Structure

```
Student & Course Management/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth & validation
│   │   └── models/          # Database queries
│   ├── server.js           # Server entry point
│   ├── schema.sql          # Database schema
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # State management
│   │   └── services/       # API services
│   ├── package.json
│   └── README.md
└── README.md               # This file
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MySQL (v8.0+)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd "Student & Course Management"
```

### 2. Database Setup
```bash
# Start MySQL server (XAMPP or standalone)
# Create database
mysql -u root -p < backend/schema.sql
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 5. Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000 (endpoints list)

## 🔐 Default Login Credentials

### Administrator
- **Email:** admin@school.com
- **Password:** admin123
- **Permissions:** Full system access

### Students
- **Email:** john.doe@student.com | **Password:** student123
- **Email:** jane.smith@student.com | **Password:** student123
- **Permissions:** View-only access to courses and personal profile

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # Create user (Admin only)
GET  /api/auth/profile        # Get user profile
```

### Student Management
```
GET    /api/students          # Get all students (Admin)
GET    /api/students/:id      # Get student by ID
POST   /api/students          # Create student (Admin)
PUT    /api/students/:id      # Update student (Admin)
DELETE /api/students/:id      # Delete student (Admin)
GET    /api/students/course/:courseId  # Get students by course
```

### Course Management
```
GET    /api/courses           # Get all courses
GET    /api/courses/:id       # Get course by ID
POST   /api/courses           # Create course (Admin)
PUT    /api/courses/:id       # Update course (Admin)
DELETE /api/courses/:id       # Delete course (Admin)
GET    /api/courses/:id/students      # Get course students
GET    /api/courses/admin/stats       # Get statistics (Admin)
```

## 🗄️ Database Schema

### Users Table
```sql
- id (Primary Key)
- email (Unique)
- password (Hashed)
- role (admin/student)
- created_at, updated_at
```

### Students Table
```sql
- id (Primary Key)
- user_id (Foreign Key → users.id)
- first_name, last_name
- email (Unique)
- phone, date_of_birth
- course_id (Foreign Key → courses.id)
- enrollment_date, status
- created_at, updated_at
```

### Courses Table
```sql
- id (Primary Key)
- name (Unique)
- description, duration
- instructor
- created_at, updated_at
```

## 🎨 User Interface Screenshots

### Login Page
- Clean, modern design
- Demo credentials display
- Responsive layout

### Admin Dashboard
- Statistics overview
- Quick action buttons
- Recent students table

### Student Management
- Data table with search
- Modal forms for CRUD
- Course assignment

### Course Catalog
- Card-based layout
- Enrollment counters
- Admin controls

## 🔧 Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start           # Production start
npm test            # Run tests (if implemented)
```

### Frontend Development
```bash
cd frontend
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview build
npm run lint        # Code linting
```

## 🔮 Future Enhancements

### Features
- [ ] Email notifications
- [ ] File upload (student photos)
- [ ] Grade management
- [ ] Attendance tracking
- [ ] Reports generation
- [ ] Real-time notifications

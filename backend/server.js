import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { testConnection } from "./src/db.js";

// Import Routes
import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
// Updated for port 5001

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Allow all localhost origins in development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if(!origin) return callback(null, true);
    
    // Allow all localhost origins
    if(origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Test Database Connection on Startup
await testConnection();

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Student & Course Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      students: "/api/students", 
      courses: "/api/courses"
    }
  });
});

// ✅ Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || "/dashboard";
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData);
      if (!result.success) {
        setError(result.message || "Invalid credentials");
      }
      // Redirect handled by AuthContext
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    {
      role: "Admin",
      email: "admin@school.com",
      password: "admin123",
      icon: "👨‍💼",
      color: "blue",
    },
    {
      role: "Student",
      email: "john.doe@student.com",
      password: "student123",
      icon: "👨‍🎓",
      color: "green",
    },
  ];

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl">
        {/* Container: Horizontal (desktop) | Vertical (mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Section - Welcome + Demo Accounts */}
          <div className="space-y-8 text-center lg:text-left text-white">
            <div>
              <div className="mx-auto lg:mx-0 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg mb-6">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                Welcome Back
              </h2>
              <p className="text-lg opacity-90">
                Student & Course Management System
              </p>
            </div>

            <div className="space-y-4">
              {demoCredentials.map((cred, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-full ${
                          cred.color === "blue" ? "bg-blue-100" : "bg-green-100"
                        }`}
                      >
                        <span className="text-xl">{cred.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {cred.role} Demo
                        </h4>
                        <p className="text-sm text-gray-600 break-all">
                          {cred.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillDemo(cred.email, cred.password)}
                      className={`mt-3 sm:mt-0 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
                        cred.color === "blue"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      Try {cred.role}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="text-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">Sign In</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter your credentials to continue
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white opacity-75 text-sm mt-8">
          <p className="flex items-center justify-center mb-2">
            ⚡ Built with React, Node.js & MySQL
          </p>
          <p>&copy; 2025 Student & Course Management System</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

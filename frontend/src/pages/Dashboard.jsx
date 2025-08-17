import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, coursesAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0,
    recentStudents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (isAdmin()) {
          // Admin dashboard data
          const [studentsResponse, coursesResponse, courseStatsResponse] = await Promise.all([
            studentsAPI.getAll(),
            coursesAPI.getAll(),
            coursesAPI.getStats().catch(() => ({ statistics: {} }))
          ]);

          setStats({
            totalStudents: studentsResponse.count || 0,
            totalCourses: coursesResponse.count || 0,
            activeStudents: courseStatsResponse.statistics?.active_students || 0,
            recentStudents: studentsResponse.students?.slice(0, 5) || []
          });
        } else {
          // Student dashboard - just get courses
          const coursesResponse = await coursesAPI.getAll();
          setStats({
            totalCourses: coursesResponse.count || 0,
            recentStudents: []
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            {isAdmin() ? 'Admin Dashboard - Manage students and courses' : 'Student Dashboard - View your courses and profile'}
          </p>
        </div>

        {/* Stats Cards */}
        {isAdmin() ? (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
              {/* Total Students */}
              <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm sm:text-base font-medium">👥</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Students</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Students */}
              <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm sm:text-base font-medium">✅</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Active Students</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Courses */}
              <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm sm:text-base font-medium">📚</span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Courses</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-md rounded-lg mb-6 sm:mb-8">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Link
                    to="/students"
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4 text-center transition-colors duration-200"
                  >
                    <div className="text-blue-600 text-xl sm:text-2xl mb-1 sm:mb-2">👥</div>
                    <div className="text-xs sm:text-sm font-medium text-blue-800">Manage Students</div>
                  </Link>
                  
                  <Link
                    to="/courses"
                    className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 sm:p-4 text-center transition-colors duration-200"
                  >
                    <div className="text-purple-600 text-xl sm:text-2xl mb-1 sm:mb-2">📚</div>
                    <div className="text-xs sm:text-sm font-medium text-purple-800">Manage Courses</div>
                  </Link>
                  
                  <button
                    onClick={() => window.location.href = '/students?action=add'}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 sm:p-4 text-center transition-colors duration-200"
                  >
                    <div className="text-green-600 text-xl sm:text-2xl mb-1 sm:mb-2">➕</div>
                    <div className="text-xs sm:text-sm font-medium text-green-800">Add Student</div>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/courses?action=add'}
                    className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-3 sm:p-4 text-center transition-colors duration-200"
                  >
                    <div className="text-orange-600 text-xl sm:text-2xl mb-1 sm:mb-2">🎓</div>
                    <div className="text-xs sm:text-sm font-medium text-orange-800">Add Course</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Students */}
            {stats.recentStudents.length > 0 && (
              <div className="bg-white shadow-md rounded-lg">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Students</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900 font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {student.email}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.email}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                            {student.course_name || 'Not assigned'}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : student.status === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Student Dashboard
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Student Info */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Your Information</h2>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  {user?.studentInfo && (
                    <>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">Name:</span> {user.studentInfo.first_name} {user.studentInfo.last_name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">Course:</span> {user.studentInfo.course_name || 'Not assigned'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.studentInfo.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.studentInfo.status}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Quick Links</h2>
                <div className="space-y-2 sm:space-y-3">
                  <Link
                    to="/courses"
                    className="block w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                  >
                    📚 View Courses
                  </Link>
                  <Link
                    to="/profile"
                    className="block w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                  >
                    👤 My Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

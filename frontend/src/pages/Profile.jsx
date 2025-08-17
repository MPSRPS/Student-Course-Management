 import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfileData(response.user);
      if (response.studentInfo) {
        setStudentInfo(response.studentInfo);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center">
            Profile
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base text-center">
            Manage your account information and settings
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Basic Profile Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                Account Information
              </h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                    {profileData?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                      user?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role === 'admin' ? 'Administrator' : 'Student'}
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                  <div className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                    {new Date(profileData?.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Information */}
          {isStudent && studentInfo && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                  Student Information
                </h2>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                      {studentInfo.first_name} {studentInfo.last_name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <div className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                      STU-{String(studentInfo.id).padStart(4, '0')}
                    </div>
                  </div>
                  {studentInfo.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                        {studentInfo.phone}
                      </div>
                    </div>
                  )}
                  {studentInfo.date_of_birth && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <div className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                        {new Date(studentInfo.date_of_birth).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
                    <div className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                      {new Date(studentInfo.enrollment_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                        studentInfo.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : studentInfo.status === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {studentInfo.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Information */}
          {isStudent && studentInfo && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                  Course Information
                </h2>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                {studentInfo.course_name ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enrolled Course</label>
                      <div className="text-base sm:text-lg font-semibold text-blue-600">
                        {studentInfo.course_name}
                      </div>
                    </div>
                    {studentInfo.course_description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                        <div className="text-sm sm:text-base text-gray-700 bg-gray-50 px-3 py-2 sm:py-3 rounded-md">
                          {studentInfo.course_description}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-gray-400 text-3xl sm:text-4xl mb-4">📚</div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Course Assigned</h3>
                    <p className="text-sm sm:text-base text-gray-600">You haven't been assigned to any course yet. Please contact your administrator.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Information */}
          {user?.role === 'admin' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                  Administrator Access
                </h2>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-medium text-blue-800 mb-3">Permissions</h3>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-2">
                      <li>• Manage all students</li>
                      <li>• Create and edit courses</li>
                      <li>• View system statistics</li>
                      <li>• Create user accounts</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-medium text-purple-800 mb-3">Quick Actions</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        onClick={() => window.location.href = '/students'}
                        className="block w-full text-left text-xs sm:text-sm text-purple-700 hover:text-purple-900 font-medium py-1"
                      >
                        → Manage Students
                      </button>
                      <button
                        onClick={() => window.location.href = '/courses'}
                        className="block w-full text-left text-xs sm:text-sm text-purple-700 hover:text-purple-900 font-medium py-1"
                      >
                        → Manage Courses
                      </button>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="block w-full text-left text-xs sm:text-sm text-purple-700 hover:text-purple-900 font-medium py-1"
                      >
                        → View Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Security</h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-medium text-yellow-800 mb-2 sm:mb-3">Password Security</h3>
                <p className="text-xs sm:text-sm text-yellow-700 mb-2 sm:mb-3">
                  For security reasons, password changes are currently handled by administrators.
                </p>
                <p className="text-xs sm:text-sm text-yellow-700">
                  If you need to change your password, please contact your system administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

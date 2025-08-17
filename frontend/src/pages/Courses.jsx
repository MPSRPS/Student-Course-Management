import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    instructor: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, formData);
        setSuccessMessage('Course updated successfully');
      } else {
        await coursesAPI.create(formData);
        setSuccessMessage('Course created successfully');
      }
      
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description || '',
      duration: course.duration || '',
      instructor: course.instructor || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await coursesAPI.delete(courseId);
        setSuccessMessage('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      instructor: ''
    });
  };

  const openAddModal = () => {
    setEditingCourse(null);
    resetForm();
    setShowModal(true);
  };

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Courses</h1>
              <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                {isAdmin() ? 'Manage course catalog and assignments' : 'Browse available courses'}
              </p>
            </div>
            {isAdmin() && (
              <button
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
              >
                <span className="mr-2">➕</span>
                Add Course
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm sm:text-base">
            {successMessage}
          </div>
        )}

        {/* Courses Grid */}
        <div>
          {courses.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 sm:p-12 text-center">
              <div className="text-gray-400 text-4xl sm:text-5xl lg:text-6xl mb-4">📚</div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No courses available</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {isAdmin() ? 'Add your first course to get started.' : 'No courses are currently available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{course.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full self-start">
                        {course.student_count || 0} students
                      </span>
                    </div>
                    
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {course.duration && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-2">⏰</span>
                          Duration: {course.duration}
                        </div>
                      )}
                      {course.instructor && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-2">👨‍🏫</span>
                          Instructor: {course.instructor}
                        </div>
                      )}
                    </div>

                    {isAdmin() && (
                      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && isAdmin() && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of the course"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 4 years, 6 months"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructor</label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Dr. John Smith"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      {editingCourse ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

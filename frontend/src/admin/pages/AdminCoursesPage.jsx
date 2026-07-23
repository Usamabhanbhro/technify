import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, XCircle, Save, Image as ImageIcon } from 'lucide-react';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', image: null, courseFee: '' });
  const [showEnrolledModal, setShowEnrolledModal] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate course fee
    if (!formData.courseFee || isNaN(formData.courseFee) || formData.courseFee <= 0) {
      alert('Please enter a valid course fee');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('courseFee', formData.courseFee);
    if (formData.image) {
      data.append('image', formData.image);
    }

    const url = isEditing 
      ? `http://localhost:5000/api/admin/courses/${formData._id}` 
      : 'http://localhost:5000/api/admin/courses';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setShowModal(false);
        setFormData({ title: '', description: '', image: null, courseFee: '' });
        fetchCourses();
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Course deleted');
        fetchCourses();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const viewEnrolled = async (courseTitle) => {
    setSelectedCourseTitle(courseTitle);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseTitle}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEnrolledStudents(data.students);
        setShowEnrolledModal(true);
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
          <p className="text-gray-500 text-sm">Add and manage institute courses</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setFormData({ title: '', description: '', image: null, courseFee: '' }); setShowModal(true); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
        >
          <Plus size={20} /> Add New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.map((course) => (
          <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-100 relative">
              {course.image ? (
                <img src={`http://localhost:5000/${course.image}`} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">{course.description}</p>
              <div className="bg-green-50 rounded px-2 py-1 mb-4 inline-block">
                <p className="text-green-700 font-semibold text-sm">Fee: PKR {course.courseFee?.toLocaleString() || 0}</p>
              </div>
              
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                <button 
                  onClick={() => viewEnrolled(course.title)}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition flex items-center gap-1 text-sm font-medium"
                >
                  <Users size={18} /> Enrolled
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setFormData(course); setIsEditing(true); setShowModal(true); }}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(course._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Course' : 'Add New Course'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. MERN Stack Development"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  rows="4"
                  placeholder="Course details..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Course Fee (PKR)</label>
                <input 
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={formData.courseFee}
                  onChange={(e) => setFormData({ ...formData, courseFee: e.target.value })}
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Course Image</label>
                <input 
                  type="file"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition mt-4"
              >
                {isEditing ? 'Save Changes' : 'Add Course'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enrolled Students Modal */}
      {showEnrolledModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Enrolled Students</h2>
                <p className="text-green-600 font-medium">{selectedCourseTitle}</p>
              </div>
              <button onClick={() => setShowEnrolledModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {enrolledStudents.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No students enrolled in this course yet.</p>
              ) : enrolledStudents.map((student) => (
                <div key={student._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                  <div className="h-12 w-12 rounded-full overflow-hidden border">
                    {student.photo ? (
                      <img src={`http://localhost:5000/${student.photo}`} alt={student.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">👤</div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.whatsapp} | {student.cnic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesPage;

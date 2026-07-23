import { useState, useEffect } from 'react';
import { Edit2, XCircle, Search, Eye, Save } from 'lucide-react';

const AdmissionPage = () => {
  const [admissions, setAdmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchAdmissions();
    fetchCourses();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/branches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

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
    }
  };

  const fetchAdmissions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/admissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAdmissions(data.admissions);
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Student status updated to ${newStatus}`);
        fetchAdmissions(); // Refresh list
        if (showModal) setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditForm({ ...student });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/students/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.success) {
        alert('Student details updated successfully');
        setIsEditing(false);
        setShowModal(false);
        fetchAdmissions();
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const filteredAdmissions = admissions.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cnic.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Admissions</h1>
          <p className="text-gray-500 text-sm">List of students who applied for courses</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Student Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Course</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Branch</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date Applied</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading admissions...</td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No new admissions found.</td>
                </tr>
              ) : (
                filteredAdmissions.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border">
                          {student.photo ? (
                            <img src={`http://localhost:5000/${student.photo}`} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">CNIC: {student.cnic}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{student.course}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{student.branchId?.branchName || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.whatsapp}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(student.appliedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedStudent(student); setIsEditing(false); setShowModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(student)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title="Edit Student"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(student._id, 'Enrolled')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          Enroll
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details/Edit Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Student Details' : 'Student Application Details'}
              </h2>
              <button onClick={() => { setShowModal(false); setIsEditing(false); }} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square w-full rounded-xl bg-gray-100 overflow-hidden border-2 border-gray-200">
                    {selectedStudent.photo ? (
                      <img src={`http://localhost:5000/${selectedStudent.photo}`} alt={selectedStudent.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 text-5xl">👤</div>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full">
                        {selectedStudent.status}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Fields */}
                    {[
                      { label: 'Full Name', name: 'name', type: 'text' },
                      { label: 'Father Name', name: 'fatherName', type: 'text' },
                      { label: 'CNIC', name: 'cnic', type: 'number' },
                      { label: 'WhatsApp', name: 'whatsapp', type: 'number' },
                      { label: 'Qualification', name: 'qualification', type: 'text' },
                    ].map((field) => (
                      <div key={field.name}>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{field.label}</p>
                        {isEditing ? (
                          <input
                            type={field.type}
                            value={editForm[field.name] || ''}
                            onChange={(e) => setEditForm({ ...editForm, [field.name]: e.target.value })}
                            className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800">{selectedStudent[field.name]}</p>
                        )}
                      </div>
                    ))}
                    
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Course</p>
                      {isEditing ? (
                        <select 
                          value={editForm.course || ''}
                          onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                          className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        >
                          <option value="">Select Course</option>
                          {courses.map(c => (
                            <option key={c._id} value={c.title}>{c.title}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="font-semibold text-gray-800">{selectedStudent.course}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Branch *</p>
                      {isEditing ? (
                        <select 
                          value={editForm.branchId || ''}
                          onChange={(e) => setEditForm({ ...editForm, branchId: e.target.value })}
                          className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                          required
                        >
                          <option value="">Select Branch</option>
                          {branches.map(b => (
                            <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                          ))}
                        </select>
                      ) : (
                        <p className="font-semibold text-gray-800">{selectedStudent.branchId?.branchName || 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Address</p>
                    {isEditing ? (
                      <textarea
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        rows="2"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{selectedStudent.address}</p>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    {/* Payment info shown when viewing (not editing) */}
                    {!isEditing && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Payment Method</p>
                        <p className="font-semibold text-gray-800 mb-3">{selectedStudent.paymentMethod || 'N/A'}</p>

                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Payment Proof</p>
                        {selectedStudent.paymentProof ? (
                          <div className="mt-2">
                            {/* Try to display image if possible, otherwise show link for download/view */}
                            {/(\.jpe?g|\.png|\.gif|\.webp|\.bmp)$/i.test(selectedStudent.paymentProof) ? (
                              <a href={`http://localhost:5000/${selectedStudent.paymentProof.replace(/^\//, '')}`} target="_blank" rel="noreferrer">
                                <img
                                  src={`http://localhost:5000/${selectedStudent.paymentProof.replace(/^\//, '')}`}
                                  alt="Payment Proof"
                                  className="max-h-56 rounded-lg border object-contain"
                                />
                              </a>
                            ) : (
                              <p className="text-sm">
                                <a href={`http://localhost:5000/${selectedStudent.paymentProof.replace(/^\//, '')}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                  View uploaded payment proof
                                </a>
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No payment proof uploaded</p>
                        )}
                      </div>
                    )}

                    {isEditing ? (
                      <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                      >
                        <Save size={20} /> Save Changes
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => handleStatusChange(selectedStudent._id, 'Enrolled')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-green-500/30"
                        >
                          Enroll
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleStatusChange(selectedStudent._id, 'Rejected')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-red-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionPage;

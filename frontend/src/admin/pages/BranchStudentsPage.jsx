import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Loader2,
  Save,
  Search,
  GraduationCap,
  XCircle,
} from 'lucide-react';
import { getBranchStudents } from '../api/branchesApi';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const PAGE_SIZE = 10;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Enrolled':
      return 'bg-green-100 text-green-800';
    case 'Passout':
      return 'bg-blue-100 text-blue-800';
    case 'Dropout':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function BranchStudentsPage() {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBranchStudents(branchId, {
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
      if (data.success) {
        setBranch(data.branch);
        setStudents(data.students || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error('Error loading branch students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, page, debouncedSearch]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const openView = (student) => {
    setSelectedStudent(student);
    setEditForm({ ...student });
    setIsEditing(false);
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setEditForm({ ...student });
    setIsEditing(true);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setIsEditing(false);
    setEditForm({});
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/admin/students/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          fatherName: editForm.fatherName,
          email: editForm.email,
          cnic: editForm.cnic,
          whatsapp: editForm.whatsapp,
          course: editForm.course,
          qualification: editForm.qualification,
          status: editForm.status,
          rollNo: editForm.rollNo,
        }),
      });
      const data = await response.json();
      if (data.success) {
        closeModal();
        loadStudents();
      } else {
        alert(data.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/admin/branches')}
          className="mb-6 inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Branch Management
        </button>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 text-white rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Branch Students
              </h1>
              <p className="text-gray-600 text-sm">
                {branch
                  ? `${branch.branchName} (${branch.branchCode})`
                  : 'Loading branch…'}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll no, class…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={32} />
              <p>Loading students…</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center px-4">
              <p className="text-lg font-medium text-gray-700">
                No students found for this branch.
              </p>
              {debouncedSearch && (
                <p className="text-sm text-gray-500 mt-2">
                  No results for &quot;{debouncedSearch}&quot;
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Father Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll Number</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admission Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                        <td className="px-4 py-3 text-gray-600">{student.studentId}</td>
                        <td className="px-4 py-3 text-gray-600">{student.fatherName}</td>
                        <td className="px-4 py-3 text-gray-600">{student.class}</td>
                        <td className="px-4 py-3 text-gray-600">{student.section}</td>
                        <td className="px-4 py-3 text-gray-600">{student.rollNo}</td>
                        <td className="px-4 py-3 text-gray-600">{student.phone}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(student.admissionDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openView(student)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(student)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Edit student"
                            >
                              <Edit2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {students.length} of {pagination.total} student(s)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-100"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-700 px-2">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-100"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Edit Student' : 'Student Details'}
              </h2>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Student Name', name: 'name', type: 'text' },
                  { label: 'Father Name', name: 'fatherName', type: 'text' },
                  { label: 'Class', name: 'course', type: 'text' },
                  { label: 'Roll Number', name: 'rollNo', type: 'text' },
                  { label: 'Phone', name: 'whatsapp', type: 'number' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'CNIC', name: 'cnic', type: 'number' },
                  { label: 'Qualification', name: 'qualification', type: 'text' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <input
                        type={field.type}
                        value={editForm[field.name] ?? ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [field.name]: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{selectedStudent[field.name] ?? '—'}</p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Not Enrolled">Not Enrolled</option>
                      <option value="Enrolled">Enrolled</option>
                      <option value="Passout">Passout</option>
                      <option value="Dropout">Dropout</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedStudent.status)}`}>
                      {selectedStudent.status}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Admission Date
                  </label>
                  <p className="text-sm text-gray-800">{formatDate(selectedStudent.admissionDate)}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { getBranchTeachers } from '../api/branchesApi';

const PAGE_SIZE = 10;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function BranchTeachersPage() {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBranchTeachers(branchId, {
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
      if (data.success) {
        setBranch(data.branch);
        setTeachers(data.teachers || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error('Error loading branch teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, page, debouncedSearch]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const statusClass = (status) =>
    status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/admin/branches')}
          className="mb-6 inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Branch Management
        </button>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Branch Teachers
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
              placeholder="Search by name, email, ID, phone…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={32} />
              <p>Loading teachers…</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="py-16 text-center px-4">
              <p className="text-lg font-medium text-gray-700">
                No teachers found for this branch.
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
                <table className="w-full min-w-[960px]">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qualification</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joining Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{teacher.name}</td>
                        <td className="px-4 py-3 text-gray-600">{teacher.employeeId}</td>
                        <td className="px-4 py-3 text-gray-600">{teacher.email}</td>
                        <td className="px-4 py-3 text-gray-600">{teacher.phone}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={teacher.subject}>
                          {teacher.subject}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{teacher.qualification}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(teacher.joiningDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(teacher.status)}`}>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedTeacher(teacher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {teachers.length} of {pagination.total} teacher(s)
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

      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">Teacher Details</h2>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={22} />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ['Name', selectedTeacher.name],
                ['Employee ID', selectedTeacher.employeeId],
                ['Email', selectedTeacher.email],
                ['Phone', selectedTeacher.phone],
                ['Subject', selectedTeacher.subject],
                ['Qualification', selectedTeacher.qualification],
                ['Joining Date', formatDate(selectedTeacher.joiningDate)],
                ['Status', selectedTeacher.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500 font-medium">{label}</dt>
                  <dd className="text-gray-800 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

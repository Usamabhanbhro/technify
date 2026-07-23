import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, XCircle, Save, Users, GraduationCap } from 'lucide-react';
import {
  getBranches,
  getAllBranchesStatistics,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../api/branchesApi';

const BranchManagement = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    status: 'Active',
  });
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchBranches();
    fetchStatistics();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await getBranches();
      if (data.success) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      alert('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await getAllBranchesStatistics();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setFormData(branch);
      setIsEditing(true);
    } else {
      setFormData({
        branchName: '',
        branchCode: '',
        address: '',
        status: 'Active',
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      branchName: '',
      branchCode: '',
      address: '',
      status: 'Active',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.branchName || !formData.branchCode) {
      alert('Branch Name and Code are required');
      return;
    }

    try {
      const result = isEditing
        ? await updateBranch(formData._id, formData)
        : await createBranch(formData);

      if (result.success) {
        alert(result.message);
        handleCloseModal();
        fetchBranches();
        fetchStatistics();
      } else {
        alert(result.message || 'Error saving branch');
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      alert(error.response?.data?.message || 'Error saving branch');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      const data = await deleteBranch(id);
      if (data.success) {
        alert('Branch deleted');
        fetchBranches();
        fetchStatistics();
      } else {
        alert(data.message || 'Error deleting branch');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert(error.response?.data?.message || 'Error deleting branch');
    }
  };

  const filteredBranches = filter === 'All'
    ? branches
    : branches.filter((b) => b.status === filter);

  const getBranchStat = (branchId) =>
    statistics.find((s) => String(s.branchId) === String(branchId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Branch Management</h1>
          <p className="text-gray-600">Manage all branches across the institute</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Branches</h3>
            <p className="text-3xl font-bold text-blue-600">{branches.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Teachers</h3>
            <p className="text-3xl font-bold text-green-600">
              {statistics.reduce((sum, s) => sum + s.totalTeachers, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-purple-600">
              {statistics.reduce((sum, s) => sum + s.totalStudents, 0)}
            </p>
          </div>
        </div>

        <div className="flex-col  sm:flex-row justify-between items-center mb-6">
          <div className="flex gap-3">
            {['All', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6  mt-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Add Branch
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading branches...</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No branches found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Branch Name</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Code</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Address</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Teachers</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Students</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch) => {
                    const stat = getBranchStat(branch._id);
                    return (
                      <tr key={branch._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-3 text-gray-800 font-medium">{branch.branchName}</td>
                        <td className="px-6 py-3 text-gray-600">{branch.branchCode}</td>
                        <td className="px-6 py-3 text-gray-600">{branch.address || '-'}</td>
                        <td className="px-6 py-3 text-gray-600">{stat?.totalTeachers || 0}</td>
                        <td className="px-6 py-3 text-gray-600">{stat?.totalStudents || 0}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              branch.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {branch.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/branches/${branch._id}/teachers`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                            >
                              <Users size={16} />
                              View Teachers
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/branches/${branch._id}/students`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                            >
                              <GraduationCap size={16} />
                              View Students
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenModal(branch)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(branch._id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Edit Branch' : 'Add New Branch'}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Branch Name *</label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Branch A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Branch Code *</label>
                  <input
                    type="text"
                    name="branchCode"
                    value={formData.branchCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BR-A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Address (Optional)</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Branch address"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Save size={18} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchManagement;

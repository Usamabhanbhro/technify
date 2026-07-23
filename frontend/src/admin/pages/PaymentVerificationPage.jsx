import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Search, AlertCircle } from 'lucide-react';

const PaymentVerificationPage = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const API_BASE = 'http://localhost:5000/api/admin';

  useEffect(() => {
    fetchPaymentData();
  }, [activeTab]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const endpoint = activeTab === 'pending' 
        ? '/payments/pending' 
        : '/payments/history';

      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        if (activeTab === 'pending') {
          setPendingPayments(data.students);
        } else {
          setVerificationHistory(data.students);
        }
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      alert('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (student) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/payments/student/${student._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedStudent(data.student);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Failed to load student details');
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE}/payments/verify/${selectedStudent._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Payment verified successfully! Student has been enrolled.');
        setShowModal(false);
        setSelectedStudent(null);
        fetchPaymentData();
      } else {
        alert('Failed to verify payment: ' + data.message);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('An error occurred while verifying payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE}/payments/reject/${selectedStudent._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Payment rejected. Student can upload new proof.');
        setShowModal(false);
        setSelectedStudent(null);
        setRejectionReason('');
        fetchPaymentData();
      } else {
        alert('Failed to reject payment: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('An error occurred while rejecting payment');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredData = activeTab === 'pending' 
    ? pendingPayments.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cnic.toString().includes(searchTerm)
      )
    : verificationHistory.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cnic.toString().includes(searchTerm)
      );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Verified': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'Pending Fee Verification': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentMethodBadge = (method) => {
    const colors = {
      'EasyPaisa': 'bg-blue-100 text-blue-800',
      'JazzCash': 'bg-purple-100 text-purple-800',
      'Bank Account': 'bg-green-100 text-green-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Verification</h1>
          <p className="text-gray-500 text-sm">Manage and verify student payment proofs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('pending');
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'pending'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <AlertCircle className="inline mr-2" size={18} />
          Pending Verification ({pendingPayments.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'history'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <CheckCircle className="inline mr-2" size={18} />
          Verification History ({verificationHistory.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or CNIC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full transition"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      )}

      {/* Students Table */}
      {!loading && filteredData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-500">CNIC: {student.cnic}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.course}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      PKR {student.courseFee?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodBadge(student.paymentMethod)}`}>
                        {student.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(student.paymentStatus)}`}>
                        {student.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-semibold"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 font-semibold mb-1">
            {activeTab === 'pending' 
              ? 'No pending payments' 
              : 'No verification history'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Students will appear here once applications are submitted'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">CNIC</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedStudent.cnic}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Course</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedStudent.course}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Course Fee</p>
                    <p className="text-sm font-semibold text-green-600">PKR {selectedStudent.courseFee?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Branch</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedStudent.branchId?.branchName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-700 uppercase">Payment Method</p>
                    <p className={`text-sm font-semibold px-2 py-1 rounded inline-block ${getPaymentMethodBadge(selectedStudent.paymentMethod)}`}>
                      {selectedStudent.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 uppercase">Payment Status</p>
                    <p className={`text-sm font-semibold px-2 py-1 rounded inline-block border ${getStatusColor(selectedStudent.paymentStatus)}`}>
                      {selectedStudent.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 uppercase">Enrollment Status</p>
                    <p className={`text-sm font-semibold px-2 py-1 rounded inline-block border ${getStatusColor(selectedStudent.enrollmentStatus)}`}>
                      {selectedStudent.enrollmentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 uppercase">Applied Date</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(selectedStudent.appliedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedStudent.paymentProof && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800">Payment Proof</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img
                      src={`http://localhost:5000/${selectedStudent.paymentProof.replace(/^\//, '')}`}
                      alt="Payment Proof"
                      className="max-h-80 mx-auto rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = '';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <p style={{ display: 'none' }} className="text-gray-500 text-sm mt-2">
                      Unable to load image. <a href={`http://localhost:5000/${selectedStudent.paymentProof.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View file</a>
                    </p>
                  </div>
                </div>
              )}

              {/* Actions - Only show for pending payments */}
              {selectedStudent.paymentStatus === 'Pending Fee Verification' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection (optional)"
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleVerifyPayment}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      {actionLoading ? 'Processing...' : 'Verify & Enroll'}
                    </button>
                    <button
                      onClick={handleRejectPayment}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      {actionLoading ? 'Processing...' : 'Reject Payment'}
                    </button>
                  </div>
                </div>
              )}

              {selectedStudent.paymentStatus !== 'Pending Fee Verification' && (
                <div className={`p-4 rounded-lg text-center ${selectedStudent.paymentStatus === 'Verified' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={selectedStudent.paymentStatus === 'Verified' ? 'text-green-800' : 'text-red-800'}>
                    {selectedStudent.paymentStatus === 'Verified' 
                      ? '✓ Payment verified and student enrolled' 
                      : '✗ Payment rejected - awaiting resubmission'}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerificationPage;

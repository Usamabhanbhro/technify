import { useEffect, useState } from 'react';
import {
  ReceiptText,
  Loader2,
  Download,
  AlertCircle,
  Upload,
  X,
  Building2,
} from 'lucide-react';
import { fetchMyChallans, uploadPaymentProof } from '../api/feesApi';
import { downloadFeeChallanPdf } from '../../utils/feeChallanPdf';
import { fetchStudentMe } from '../api';

function StatusBadge({ status, isOverdue }) {
  const map = {
    Paid: 'bg-emerald-100 text-emerald-800',
    Unpaid: isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800',
    'Pending Verification': 'bg-blue-100 text-blue-800',
    Rejected: 'bg-slate-200 text-slate-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100'}`}>
      {status}
      {isOverdue && status === 'Unpaid' ? ' · Overdue' : ''}
    </span>
  );
}

function UploadProofModal({ challan, onClose, onSuccess }) {
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a payment screenshot');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('paymentScreenshot', file);
      fd.append('transactionId', transactionId.trim());
      fd.append('paymentDate', paymentDate);
      await uploadPaymentProof(challan._id, fd);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Upload Payment Proof</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4 font-mono">{challan.challanNo}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Transaction ID *</label>
            <input
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment date *</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment screenshot *</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Submit for verification
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StudentChallans() {
  const [challans, setChallans] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadChallan, setUploadChallan] = useState(null);

  const reload = async () => {
    const [chRes, me] = await Promise.all([
      fetchMyChallans(),
      fetchStudentMe().catch(() => null),
    ]);
    setChallans(chRes.challans || []);
    setStudent(me);
  };

  useEffect(() => {
    reload()
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';

  const canUpload = (ch) => ['Unpaid', 'Rejected'].includes(ch.status);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-slate-500">
        <Loader2 className="animate-spin" /> Loading your challans…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 flex items-center gap-2">
        <AlertCircle size={20} /> {error}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ReceiptText className="text-emerald-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Fee Challans</h1>
            <p className="text-slate-500 text-sm">
              Pay using bank details below, then upload proof for admin verification.
            </p>
          </div>
        </div>

        {challans.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center text-slate-500">
            No challans issued yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {challans.map((ch) => (
              <div
                key={ch._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Challan No</p>
                    <p className="font-mono font-bold text-lg">{ch.challanNo}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {ch.feeType} · {ch.semester}
                    </p>
                  </div>
                  <StatusBadge status={ch.status} isOverdue={ch.isOverdue} />
                </div>

                {ch.bankDetails && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm">
                    <p className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                      <Building2 size={16} /> Pay to this account
                    </p>
                    <p>Bank: {ch.bankDetails.bankName}</p>
                    <p>Title: {ch.bankDetails.accountTitle}</p>
                    <p>Account: {ch.bankDetails.accountNumber}</p>
                    {ch.bankDetails.iban && <p>IBAN: {ch.bankDetails.iban}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-slate-500 text-xs">Amount</p>
                    <p className="font-semibold">Rs. {ch.amount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Total payable</p>
                    <p className="font-bold text-emerald-700">
                      Rs. {ch.totalPayable ?? ch.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Due date</p>
                    <p className="font-semibold">{formatDate(ch.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Txn ID</p>
                    <p className="font-semibold text-xs">{ch.transactionId || '—'}</p>
                  </div>
                </div>

                {ch.status === 'Rejected' && ch.rejectionReason && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                    Rejected: {ch.rejectionReason}. Please upload proof again.
                  </p>
                )}

                {ch.status === 'Pending Verification' && (
                  <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
                    Your payment proof is under admin review.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      downloadFeeChallanPdf(ch, {
                        name: student?.name,
                        course: student?.course,
                      })
                    }
                    className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                  {canUpload(ch) && (
                    <button
                      type="button"
                      onClick={() => setUploadChallan(ch)}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <Upload size={16} /> Upload Payment Proof
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadChallan && (
        <UploadProofModal
          challan={uploadChallan}
          onClose={() => setUploadChallan(null)}
          onSuccess={() => reload()}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  fetchPendingChallans,
  verifyChallan,
  rejectChallan,
} from '../api/feesApi';
import { proofImageUrl } from '../../utils/feeChallanPdf';

export default function AdminVerifyChallans() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchPendingChallans();
      setChallans(res.challans || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending challans');
      setChallans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (id) => {
    setActingId(id);
    try {
      await verifyChallan(id);
      await load();
      setPreview(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Verify failed');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActingId(rejectId);
    try {
      await rejectChallan(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
      await load();
      setPreview(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Reject failed');
    } finally {
      setActingId(null);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Verify Challans</h1>
      <p className="text-slate-500 text-sm mb-6">
        Review student payment proofs and approve or reject.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 p-8">
          <Loader2 className="animate-spin" /> Loading pending…
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : challans.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
          No challans pending verification.
        </div>
      ) : (
        <div className="space-y-4">
          {challans.map((ch) => {
            const s = ch.studentId;
            const img = proofImageUrl(ch.paymentScreenshot);
            return (
              <div
                key={ch._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-2 text-sm">
                    <p className="font-mono font-bold text-slate-900">{ch.challanNo}</p>
                    <p>
                      <span className="text-slate-500">Student:</span>{' '}
                      <strong>{s?.name}</strong> · {s?.course}
                    </p>
                    <p>
                      <span className="text-slate-500">Amount:</span> Rs.{' '}
                      {ch.totalPayable ?? ch.amount}
                    </p>
                    <p>
                      <span className="text-slate-500">Transaction ID:</span>{' '}
                      {ch.transactionId || '—'}
                    </p>
                    <p>
                      <span className="text-slate-500">Payment date:</span>{' '}
                      {formatDate(ch.paymentDate)}
                    </p>
                    {ch.bankDetails && (
                      <p className="text-slate-600 text-xs bg-slate-50 p-2 rounded-lg">
                        Bank: {ch.bankDetails.bankName} · {ch.bankDetails.accountNumber}
                      </p>
                    )}
                  </div>

                  {img && (
                    <div className="shrink-0">
                      <img
                        src={img}
                        alt="Payment proof"
                        className="max-h-40 rounded-lg border cursor-pointer hover:opacity-90"
                        onClick={() => setPreview(img)}
                      />
                      <button
                        type="button"
                        onClick={() => setPreview(img)}
                        className="mt-2 text-xs text-blue-600 flex items-center gap-1"
                      >
                        <Eye size={14} /> View full
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                  <button
                    type="button"
                    disabled={actingId === ch._id}
                    onClick={() => handleVerify(ch._id)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    <CheckCircle size={16} />
                    Verify (Mark Paid)
                  </button>
                  <button
                    type="button"
                    disabled={actingId === ch._id}
                    onClick={() => {
                      setRejectId(ch._id);
                      setRejectReason('');
                    }}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            alt="Payment proof"
            className="max-h-[90vh] max-w-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-slate-800 mb-3">Reject payment proof</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="w-full border rounded-lg p-3 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actingId === rejectId}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg disabled:opacity-60"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

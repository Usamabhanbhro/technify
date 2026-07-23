import { useEffect, useState } from 'react';
import { Search, Loader2, Download } from 'lucide-react';
import { fetchAllChallans } from '../api/feesApi';
import { downloadFeeChallanPdf } from '../../utils/feeChallanPdf';

const STATUSES = ['Unpaid', 'Pending Verification', 'Paid', 'Rejected'];

function StatusBadge({ status, isOverdue }) {
  const styles = {
    Paid: 'bg-green-100 text-green-800',
    Unpaid: isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800',
    'Pending Verification': 'bg-blue-100 text-blue-800',
    Rejected: 'bg-slate-200 text-slate-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-100'}`}>
      {status}
      {isOverdue && status === 'Unpaid' ? ' (Overdue)' : ''}
    </span>
  );
}

export default function VerifyFeePage() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAllChallans({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setChallans(res.challans || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load challans');
      setChallans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Fee Management</h1>
      <p className="text-slate-500 text-sm mb-6">
        View all challans. Use Verify Challans to approve pending payments.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white border rounded-xl px-4 py-2">
          <Search className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search challan, student, transaction…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm bg-white"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex justify-center gap-2">
            <Loader2 className="animate-spin" /> Loading…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : challans.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No challans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3">Challan</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Txn ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">PDF</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((ch) => {
                  const s = ch.studentId;
                  return (
                    <tr key={ch._id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{ch.challanNo}</td>
                      <td className="px-4 py-3">{s?.name || '—'}</td>
                      <td className="px-4 py-3">Rs. {ch.totalPayable ?? ch.amount}</td>
                      <td className="px-4 py-3">{formatDate(ch.dueDate)}</td>
                      <td className="px-4 py-3 text-xs">{ch.transactionId || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ch.status} isOverdue={ch.isOverdue} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => downloadFeeChallanPdf(ch, s)}
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

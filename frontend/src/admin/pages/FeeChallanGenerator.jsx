import { useEffect, useState } from 'react';
import { ReceiptText, Loader2, Users } from 'lucide-react';
import {
  generateChallans,
  fetchEnrolledStudents,
  fetchAdminCourses,
} from '../api/feesApi';

const FEE_TYPES = ['Tuition', 'Exam', 'Lab', 'Registration', 'Other'];

export default function FeeChallanGenerator() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    course: '',
    month: '',
    feeType: 'Tuition',
    amount: '',
    fine: '0',
    dueDate: '',
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
  });

  useEffect(() => {
    fetchAdminCourses()
      .then((res) => setCourses(res.courses || []))
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!form.course) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    fetchEnrolledStudents(form.course)
      .then((res) => {
        setStudents(res.students || []);
        if (selectAll) {
          setSelectedIds((res.students || []).map((s) => s._id));
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [form.course, selectAll]);

  const toggleStudent = (id) => {
    setSelectAll(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedIds(checked ? students.map((s) => s._id) : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        course: form.course,
        month: form.month.trim(),
        feeType: form.feeType,
        amount: Number(form.amount),
        fine: Number(form.fine) || 0,
        dueDate: form.dueDate,
        bankName: form.bankName.trim(),
        accountTitle: form.accountTitle.trim(),
        accountNumber: form.accountNumber.trim(),
        iban: form.iban.trim(),
      };

      if (!selectAll && selectedIds.length > 0) {
        payload.studentIds = selectedIds;
      }

      const res = await generateChallans(payload);
      setSuccess(res.message || `Generated ${res.count} challan(s).`);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to generate challans'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ReceiptText className="text-green-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Generate Fee Challan</h1>
          <p className="text-slate-500 text-sm">
            Create challans for a whole class or selected enrolled students.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Class / Course *
            </label>
            <select
              required
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Month *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spring 2026"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fee type *
            </label>
            <select
              value={form.feeType}
              onChange={(e) => setForm({ ...form, feeType: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              {FEE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amount (Rs.) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Late fine (Rs.) if overdue
            </label>
            <input
              type="number"
              min="0"
              value={form.fine}
              onChange={(e) => setForm({ ...form, fine: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Due date *
            </label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-slate-800">Bank account (shown on every challan)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank name *</label>
              <input
                type="text"
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="e.g. HBL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account title *</label>
              <input
                type="text"
                required
                value={form.accountTitle}
                onChange={(e) => setForm({ ...form, accountTitle: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account number *</label>
              <input
                type="text"
                required
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IBAN (optional)</label>
              <input
                type="text"
                value={form.iban}
                onChange={(e) => setForm({ ...form, iban: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              />
            </div>
          </div>
        </div>

        {form.course && (
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Users size={18} />
                Students ({students.length})
              </h3>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                Whole class
              </label>
            </div>

            {loadingStudents ? (
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} /> Loading…
              </p>
            ) : students.length === 0 ? (
              <p className="text-slate-500 text-sm">No enrolled students in this course.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {students.map((s) => (
                  <label
                    key={s._id}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s._id)}
                      disabled={selectAll}
                      onChange={() => toggleStudent(s._id)}
                    />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-slate-400">
                      {s.rollNo ? `(${s.rollNo})` : ''}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !form.course}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : null}
          {loading ? 'Generating…' : 'Generate Challans'}
        </button>
      </form>
    </div>
  );
}

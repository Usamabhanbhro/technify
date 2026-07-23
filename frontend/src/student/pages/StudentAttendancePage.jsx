import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { fetchStudentMe } from '../api';

function pct(present, total) {
  if (!total || total <= 0) return null;
  return Math.round((present / total) * 1000) / 10;
}

export default function StudentAttendancePage() {
  const [student, setStudent] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchStudentMe();
        if (!cancelled) setStudent(s);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div className="p-8">
        <p className="text-red-600">{err}</p>
      </div>
    );
  }

  if (!student) {
    return <div className="p-8 text-slate-500">Loading…</div>;
  }

  const p = student.attendancePresent ?? 0;
  const t = student.attendanceTotal ?? 0;
  const percentage = pct(p, t);

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardCheck className="text-emerald-600" />
          Attendance
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Summary only — you cannot mark or edit attendance.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-8 shadow-sm">
        {t <= 0 ? (
          <p className="text-slate-500">Attendance has not been entered for your record yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-slate-900 tabular-nums">
                {percentage != null ? `${percentage}` : '—'}
              </span>
              {percentage != null ? <span className="text-2xl font-semibold text-slate-400 mb-1">%</span> : null}
            </div>
            <p className="text-slate-600">
              Present: <strong>{p}</strong> of <strong>{t}</strong> counted sessions / classes.
            </p>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, percentage ?? 0)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

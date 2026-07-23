import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { fetchStudentMe } from '../api';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function StudentTestScoresPage() {
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

  const rows = Array.isArray(student.testScores) ? student.testScores : [];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="text-emerald-600" />
          Test scores
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Published results only — you cannot submit or change scores here.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-4 sm:p-8 text-slate-500">No test scores have been posted to your record yet.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[400px] w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-slate-600">Assessment</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-slate-600">Score</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-900">{r.testName}</td>
                    <td className="px-4 sm:px-6 py-4 tabular-nums text-slate-800">
                      {r.score}
                      <span className="text-slate-400"> / {r.maxScore ?? 100}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-500">{formatDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

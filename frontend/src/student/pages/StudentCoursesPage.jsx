import { useEffect, useState } from 'react';
import { BookOpen, ListChecks } from 'lucide-react';
import { fetchStudentMe } from '../api';

export default function StudentCoursesPage() {
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

  const subjects = Array.isArray(student.currentSubjects) ? student.currentSubjects : [];

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-emerald-600" />
          My course
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Read-only — you cannot change your enrollment here.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Program / batch course</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">{student.course || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Enrollment status</p>
          <p className="mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
            {student.status || '—'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <ListChecks size={20} className="text-emerald-600" />
          Current subjects / modules
        </h2>
        {subjects.length === 0 ? (
          <p className="text-slate-500 text-sm">No subject list has been published for your record yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {subjects.map((s, i) => (
              <li key={i} className="px-4 py-3 text-slate-800 bg-white">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

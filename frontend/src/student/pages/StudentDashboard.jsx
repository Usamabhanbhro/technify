import { useEffect, useState } from 'react';
import { BookOpen, ClipboardCheck, Trophy, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchStudentMe } from '../api';

function pct(present, total) {
  if (!total || total <= 0) return null;
  return Math.round((present / total) * 1000) / 10;
}

export default function StudentDashboard() {
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
    return (
      <div className="p-8 text-slate-500">Loading your dashboard…</div>
    );
  }

  const attendancePct = pct(student.attendancePresent, student.attendanceTotal);
  const avgScore =
    student.testScores?.length > 0
      ? student.testScores.reduce((a, t) => a + (t.score / (t.maxScore || 100)) * 100, 0) /
        student.testScores.length
      : null;

  const cards = [
    {
      title: 'Admission application',
      value: 'Submitted details',
      sub: student.email ? `Email on file: ${student.email}` : 'View your application data',
      icon: FileText,
      to: '/student/admission',
      linkLabel: 'View admission form',
    },
    {
      title: 'Current course',
      value: student.course || '—',
      sub: student.status ? `Status: ${student.status}` : '',
      icon: BookOpen,
      to: '/student/courses',
      linkLabel: 'View course details',
    },
    {
      title: 'Attendance',
      value:
        attendancePct != null ? `${attendancePct}%` : '—',
      sub:
        student.attendanceTotal > 0
          ? `${student.attendancePresent ?? 0} / ${student.attendanceTotal} sessions`
          : 'No attendance recorded yet',
      icon: ClipboardCheck,
      to: '/student/attendance',
      linkLabel: 'View attendance',
    },
    {
      title: 'Tests & grades',
      value: student.testScores?.length ? `${student.testScores.length} record(s)` : '—',
      sub: avgScore != null ? `Approx. average: ${Math.round(avgScore)}%` : 'No scores yet',
      icon: Trophy,
      to: '/student/tests',
      linkLabel: 'View scores',
    },
    {
      title: 'Profile',
      value: student.name,
      sub: student.rollNo ? `Roll no. ${student.rollNo}` : 'Roll number not assigned',
      icon: User,
      to: '/student/profile',
      linkLabel: 'View profile',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {student.name}</h1>
        <p className="text-slate-500 mt-1">
          This is your read-only student portal. Contact the institute if any information is incorrect.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.title}</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1 truncate">{c.value}</p>
                  {c.sub ? <p className="text-sm text-slate-500 mt-1">{c.sub}</p> : null}
                </div>
              </div>
              <Link
                to={c.to}
                className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                {c.linkLabel} →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

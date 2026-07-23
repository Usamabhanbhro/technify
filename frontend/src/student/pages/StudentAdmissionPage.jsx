import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { fetchStudentMe, API_BASE } from '../api';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatDob(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function StudentAdmissionPage() {
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

  const photoSrc = student.photo
    ? `${API_BASE}/${student.photo.replace(/^\//, '')}`
    : null;

  const rows = [
    { label: 'Full name', value: student.name },
    { label: "Father's name", value: student.fatherName },
    { label: 'Email', value: student.email || '—' },
    { label: 'Date of birth', value: formatDob(student.dob) },
    { label: 'Qualification', value: student.qualification || '—' },
    { label: 'CNIC', value: student.cnic ?? '—' },
    { label: 'WhatsApp', value: student.whatsapp ?? '—' },
    { label: 'Course applied', value: student.course || '—' },
    { label: 'Address', value: student.address || '—' },
    { label: 'Message', value: student.message || '—' },
    { label: 'Submitted at', value: formatDate(student.appliedAt) },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-emerald-600" />
          My admission application
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          This is a read-only copy of the information on file. Contact the office if anything needs updating.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {photoSrc ? (
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-center bg-slate-50">
            <img
              src={photoSrc}
              alt=""
              className="h-32 w-32 sm:h-40 sm:w-40 object-cover rounded-xl border border-slate-200"
            />
          </div>
        ) : null}
        <dl className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.label} className="px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:pt-0.5">
                {r.label}
              </dt>
              <dd className="sm:col-span-2 text-slate-900 whitespace-pre-wrap break-words">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

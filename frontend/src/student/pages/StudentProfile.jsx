import { useEffect, useState } from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  IdCard,
} from 'lucide-react';
import { fetchStudentMe, API_BASE } from '../api';

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

export default function StudentProfile() {
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
    return <div className="p-8 text-slate-500">Loading your profile…</div>;
  }

  const photoSrc = student.photo
    ? `${API_BASE}/${student.photo.replace(/^\//, '')}`
    : null;

  return (
    <div className="min-h-full bg-slate-50 p-2 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 h-36 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-16">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={student.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center text-4xl text-slate-400 shadow-lg">
                {student.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>

        <div className="pt-20 pb-10 px-2 sm:px-6 md:px-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
            <p className="text-slate-500 mt-1">{student.course}</p>
            {student.rollNo ? (
              <p className="text-sm text-slate-400 mt-1">Roll no. {student.rollNo}</p>
            ) : null}
          </div>

          <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg py-2 px-3 mt-6 max-w-xl mx-auto">
            This page is read-only. To update your details, contact the institute office.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-10">
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 text-emerald-800 flex items-center gap-2">
                <User size={20} />
                Student information
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Father&apos;s name</dt>
                  <dd className="font-medium text-slate-900">{student.fatherName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Date of birth</dt>
                  <dd className="font-medium text-slate-900">{formatDob(student.dob)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Qualification</dt>
                  <dd className="font-medium text-slate-900">{student.qualification || '—'}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <IdCard className="text-slate-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <dt className="text-slate-500">CNIC</dt>
                    <dd className="font-medium text-slate-900">{student.cnic ?? '—'}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 text-teal-800 flex items-center gap-2">
                <GraduationCap size={20} />
                Enrollment
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Course</dt>
                  <dd className="font-medium text-slate-900">{student.course || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {student.status || '—'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 flex items-center gap-1">
                    <BookOpen size={14} className="text-slate-400" />
                    Current subjects
                  </dt>
                  <dd className="font-medium text-slate-900 mt-1">
                    {(student.currentSubjects || []).length ? (
                      <ul className="list-disc list-inside text-slate-700">
                        {student.currentSubjects.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                  <Mail className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{student.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                  <Phone className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp</p>
                    <p className="font-medium text-slate-900">{student.whatsapp ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 sm:col-span-2">
                  <MapPin className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">{student.address || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

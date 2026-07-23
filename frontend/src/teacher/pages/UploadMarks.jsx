import { useEffect, useState } from 'react';
import { API_BASE, getTeacherToken, fetchTeacherCourses } from '../api';

export default function UploadMarks() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [testName, setTestName] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeacherCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const q =
          selectedCourse && selectedCourse !== 'all'
            ? `?course=${encodeURIComponent(selectedCourse)}`
            : '';
        const res = await fetch(`${API_BASE}/api/teacher/marks/students${q}`, {
          headers: { Authorization: `Bearer ${getTeacherToken()}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setStudents(data.students || []);
        setSelectedStudentId('');
      } catch (e) {
        setError(e.message || 'Failed to load students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCourse]);

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!selectedStudentId || !testName || score === '') {
      setError('Select a student and enter test name and score.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/teacher/marks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getTeacherToken()}`,
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          testName,
          score: Number(score),
          maxScore: Number(maxScore) || 100,
          course: selectedCourse !== 'all' ? selectedCourse : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMessage('Test score saved successfully.');
      setTestName('');
      setScore('');
      const q =
        selectedCourse && selectedCourse !== 'all'
          ? `?course=${encodeURIComponent(selectedCourse)}`
          : '';
      const refresh = await fetch(`${API_BASE}/api/teacher/marks/students${q}`, {
        headers: { Authorization: `Bearer ${getTeacherToken()}` },
      });
      const refreshed = await refresh.json();
      if (refreshed.success) setStudents(refreshed.students || []);
    } catch (e) {
      setError(e.message || 'Failed to save score');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2 text-slate-800">Upload Test Marks</h1>
      <p className="text-slate-600 mb-4 text-sm">
        Add test scores only for students in your assigned courses.
      </p>

      {courses.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="all">All my courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
        {loading ? (
          <p className="text-slate-400">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-slate-500">No students in this course.</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — {s.course} {s.rollNo ? `(${s.rollNo})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Test name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="e.g. Midterm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max score</label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            {selectedStudent?.testScores?.length > 0 && (
              <div className="text-sm text-slate-600 border-t pt-3">
                <p className="font-medium mb-1">Existing scores:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedStudent.testScores.map((t, i) => (
                    <li key={i}>
                      {t.testName}: {t.score}/{t.maxScore || 100}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
            >
              Save score
            </button>
          </>
        )}
        {message && <p className="text-emerald-700 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}

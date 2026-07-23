import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Users,
  Download,
  BookOpen,
  ClipboardList,
  User,
} from "lucide-react";

import {
  fetchTeacherCourses,
  fetchAttendanceSummary,
} from "../api";

import { downloadAttendancePdf } from "../utils/attendancePdf";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    fetchTeacherCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingSummary(true);

      try {
        const data = await fetchAttendanceSummary(date);
        if (!cancelled) setSummaryData(data);
      } catch {
        if (!cancelled) setSummaryData(null);
      } finally {
        if (!cancelled) setLoadingSummary(false);
      }
    })();

    return () => (cancelled = true);
  }, [date]);

  const summary = summaryData?.summary || {
    present: 0,
    absent: 0,
    total: 0,
    students: [],
  };

  const hasRecord =
    summaryData?.hasRecord && summary.total > 0;

  const handleDownload = () => {
    if (!hasRecord) return;

    downloadAttendancePdf({
      date,
      teacherName: summaryData?.teacherName,
      courseLabel: "All assigned courses",
      rows: summary.students,
      summary,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            Teacher Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Manage attendance, students and courses
          </p>
        </div>

        {/* ATTENDANCE CARD */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">

          {/* TOP BAR */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

            <h2 className="font-bold text-black">
              Attendance Overview
            </h2>

            {/* DATE */}
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-gray-50">
              <CalendarDays className="text-green-600" size={18} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent outline-none text-sm"
              />
            </div>

          </div>

          {/* LOADING */}
          {loadingSummary ? (
            <p className="text-gray-500">
              Loading attendance...
            </p>
          ) : !hasRecord ? (
            <div className="text-center py-6 text-gray-500">
              No attendance found for this date
              <br />
              <Link
                to="/teacher/attendance"
                className="text-green-600 hover:underline mt-2 inline-block"
              >
                Mark Attendance →
              </Link>
            </div>
          ) : (
            <>
              {/* STATS */}
              <div className="grid sm:grid-cols-3 gap-4 mb-4">

                {/* PRESENT */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="text-green-600" />
                  <div>
                    <p className="text-xs text-green-700">
                      Present
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {summary.present}
                    </p>
                  </div>
                </div>

                {/* ABSENT */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                  <XCircle className="text-red-600" />
                  <div>
                    <p className="text-xs text-red-700">
                      Absent
                    </p>
                    <p className="text-2xl font-bold text-red-700">
                      {summary.absent}
                    </p>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                  <Users className="text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-700">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {summary.total}
                    </p>
                  </div>
                </div>

              </div>

              {/* DOWNLOAD */}
              <button
                onClick={handleDownload}
                className="
                  bg-black text-white
                  hover:bg-green-600
                  transition
                  px-4 py-2
                  rounded-xl
                  flex items-center gap-2
                "
              >
                <Download size={16} />
                Download PDF
              </button>
            </>
          )}

        </div>

        {/* COURSES */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">

          <h2 className="font-bold text-black mb-3">
            Your Courses
          </h2>

          {courses.length === 0 ? (
            <p className="text-gray-500">
              No courses assigned yet
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">

              {courses.map((c) => (
                <div
                  key={c._id}
                  className="
                    border rounded-xl p-4
                    hover:bg-green-50
                    hover:border-green-300
                    transition
                  "
                >
                  <BookOpen className="text-green-600 mb-2" />
                  <p className="font-medium text-black">
                    {c.title}
                  </p>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* QUICK LINKS */}
        <div className="grid sm:grid-cols-3 gap-4">

          <Link
            to="/teacher/students"
            className="
              bg-white border rounded-2xl p-4
              hover:bg-green-50 transition
              font-medium text-black
            "
          >
            <User className="mb-2 text-green-600" />
            Students
          </Link>

          <Link
            to="/teacher/attendance"
            className="
              bg-white border rounded-2xl p-4
              hover:bg-green-50 transition
              font-medium text-black
            "
          >
            <ClipboardList className="mb-2 text-green-600" />
            Attendance
          </Link>

          <Link
            to="/teacher/marks"
            className="
              bg-white border rounded-2xl p-4
              hover:bg-green-50 transition
              font-medium text-black
            "
          >
            <BookOpen className="mb-2 text-green-600" />
            Test Marks
          </Link>

        </div>

      </div>
    </div>
  );
}
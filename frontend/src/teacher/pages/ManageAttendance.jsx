import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  CalendarDays,
  Search,
  Download,
} from "lucide-react";
import {
  fetchTeacherCourses,
  fetchTeacherStudents,
  fetchAttendanceSummary,
  API_BASE,
  getTeacherToken,
} from "../api";
import { downloadAttendancePdf } from "../utils/attendancePdf";

export default function AttendancePage() {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedSummary, setSavedSummary] = useState(null);
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    fetchTeacherCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setMessage("");
      setSavedSummary(null);

      try {
        const data = await fetchTeacherStudents(selectedCourse);

        let roster = (data.students || []).map((s) => ({
          ...s,
          attendance: "Present",
        }));

        try {
          const saved = await fetchAttendanceSummary(date);

          setTeacherName(saved.teacherName || "");

          if (saved.hasRecord && saved.summary?.students?.length) {
            const map = Object.fromEntries(
              saved.summary.students.map((r) => [
                String(r.studentId),
                r.status === "absent" ? "Absent" : "Present",
              ])
            );

            roster = roster.map((s) => ({
              ...s,
              attendance: map[String(s._id)] || s.attendance,
            }));

            setSavedSummary(saved.summary);
          }
        } catch {}

        setStudents(roster);
      } catch (err) {
        setMessage(err.message || "Failed to fetch students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourse, date]);

  const handleAttendance = (id, status) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, attendance: status } : s
      )
    );
  };

  const filteredStudents = students.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const attendanceData = students.map((s) => ({
        student: s._id,
        status: s.attendance.toLowerCase(),
      }));

      const res = await fetch(
        `${API_BASE}/api/attendance/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getTeacherToken()}`,
          },
          body: JSON.stringify({
            date,
            students: attendanceData,
            course:
              selectedCourse !== "all"
                ? selectedCourse
                : undefined,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSavedSummary(data.summary);
        setTeacherName(data.teacherName || "");
        setMessage(
          `Saved! Present: ${data.summary.present}, Absent: ${data.summary.absent}`
        );
      } else {
        setMessage(data.message || "Save failed");
      }
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(
    (s) => s.attendance === "Present"
  ).length;

  const absentCount = students.filter(
    (s) => s.attendance === "Absent"
  ).length;

  const handleDownloadPdf = () => {
    const rows =
      savedSummary?.students ||
      students.map((s) => ({
        rollNo: s.rollNo,
        name: s.name,
        course: s.course,
        status: s.attendance.toLowerCase(),
      }));

    const summary = savedSummary || {
      present: presentCount,
      absent: absentCount,
      total: students.length,
    };

    downloadAttendancePdf({
      date,
      teacherName,
      courseLabel:
        selectedCourse !== "all"
          ? selectedCourse
          : "All Courses",
      rows,
      summary,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            Student Attendance
          </h1>
          <p className="text-gray-600">
            Mark and manage student attendance
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white border rounded-2xl p-4 shadow-sm mb-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">

          {/* DATE */}
          <div className="flex items-center gap-2">
            <CalendarDays className="text-green-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="outline-none"
            />
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-2 border px-3 py-2 rounded-xl w-full md:w-96">
            <Search className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full outline-none"
            />
          </div>

          {/* COURSE */}
          {courses.length > 0 && (
            <select
              value={selectedCourse}
              onChange={(e) =>
                setSelectedCourse(e.target.value)
              }
              className="border px-3 py-2 rounded-xl"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {/* DESKTOP */}
          <div className="hidden md:block">
            <table className="w-full">

              <thead className="bg-black text-white">
                <tr>
                  <th className="p-4 text-left">Roll</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-center">
                    Status
                  </th>
                  <th className="p-4 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr
                    key={s._id}
                    className="border-b hover:bg-green-50 transition"
                  >
                    <td className="p-4">{s.rollNo}</td>
                    <td className="p-4 font-medium">
                      {s.name}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          s.attendance === "Present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.attendance}
                      </span>
                    </td>

                    <td className="p-4 flex justify-center gap-2">
                      <button
                        onClick={() =>
                          handleAttendance(
                            s._id,
                            "Present"
                          )
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                      >
                        <CheckCircle size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleAttendance(s._id, "Absent")
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                      >
                        <XCircle size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* MOBILE */}
          <div className="md:hidden p-4 space-y-4">
            {filteredStudents.map((s) => (
              <div
                key={s._id}
                className="border rounded-2xl p-4 hover:bg-green-50"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      {s.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {s.rollNo}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      s.attendance === "Present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.attendance}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      handleAttendance(s._id, "Present")
                    }
                    className="flex-1 bg-green-600 text-white py-2 rounded-xl"
                  >
                    Present
                  </button>

                  <button
                    onClick={() =>
                      handleAttendance(s._id, "Absent")
                    }
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl"
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>

          <button
            onClick={handleDownloadPdf}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Download size={18} />
            Download PDF
          </button>

        </div>

        {message && (
          <p className="mt-4 text-green-600 font-semibold">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}
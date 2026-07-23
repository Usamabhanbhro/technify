import { useEffect, useState } from "react";
import { fetchTeacherCourses, fetchTeacherStudents } from "../api";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeacherCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchTeacherStudents(selectedCourse);
        setStudents(data.students || []);
      } catch (err) {
        setError(err.message || "Failed to fetch students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedCourse]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            Student List
          </h1>
          <p className="text-gray-600 mt-2">
            View enrolled students in your assigned courses
          </p>
        </div>

        {/* FILTER */}
        {courses.length > 0 && (
          <div className="mb-5 bg-white border rounded-2xl p-4 shadow-sm">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Course
            </label>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="
                w-full md:w-96
                px-4 py-3
                border rounded-xl
                focus:outline-none
                focus:ring-2 focus:ring-green-500
                transition
              "
            >
              <option value="all">All My Courses</option>

              {courses.map((c) => (
                <option key={c._id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>

          </div>
        )}

        {/* TABLE CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* LOADING */}
          {loading && (
            <div className="text-center py-10 text-gray-500">
              Loading students...
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="text-center py-10 text-red-600">
              {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && students.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No students found.
            </div>
          )}

          {/* DESKTOP TABLE */}
          {!loading && !error && students.length > 0 && (
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Roll No</th>
                    <th className="p-4 text-left">Course</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s._id}
                      className="
                        border-b
                        hover:bg-green-50
                        transition
                      "
                    >
                      <td className="p-4 font-semibold text-black">
                        {s.name}
                      </td>

                      <td className="p-4 text-gray-700">
                        {s.rollNo || "—"}
                      </td>

                      <td className="p-4 text-gray-700">
                        {s.course}
                      </td>

                      <td className="p-4">
                        <span
                          className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${
                              s.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }
                          `}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

          {/* MOBILE CARDS */}
          {!loading && !error && students.length > 0 && (
            <div className="md:hidden p-4 space-y-4">

              {students.map((s) => (
                <div
                  key={s._id}
                  className="
                    border
                    rounded-2xl
                    p-4
                    hover:bg-green-50
                    transition
                  "
                >

                  <div className="flex justify-between">

                    <div>
                      <p className="font-semibold text-black">
                        {s.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {s.rollNo || "—"}
                      </p>
                    </div>

                    <span
                      className="
                        px-3 py-1
                        text-xs
                        rounded-full
                        bg-green-100
                        text-green-700
                      "
                    >
                      {s.status}
                    </span>

                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Course: {s.course}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
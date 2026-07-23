import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { fetchTeacherCourses } from "../api";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeacherCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            My Courses
          </h1>

          <p className="text-gray-600 mt-2">
            View and manage your assigned courses
          </p>
        </div>

        {/* STATES */}
        {loading && (
          <p className="text-gray-500">Loading courses...</p>
        )}

        {error && (
          <p className="text-red-600 font-medium">{error}</p>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="bg-white border rounded-2xl p-6 text-gray-600 shadow-sm">
            No courses assigned yet. Contact admin.
          </div>
        )}

        {/* COURSES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {courses.map((c) => (
            <div
              key={c._id}
              className="
                bg-white
                border border-gray-200
                rounded-2xl
                p-5
                shadow-sm
                hover:shadow-md
                hover:border-green-300
                hover:bg-green-50
                transition-all
                duration-300
                cursor-pointer
                group
              "
            >
              <div className="flex items-center gap-3">

                {/* ICON */}
                <div className="
                  p-3
                  bg-green-100
                  rounded-xl
                  group-hover:bg-green-200
                  transition
                ">
                  <BookOpen
                    className="text-green-700"
                    size={24}
                  />
                </div>

                {/* TITLE */}
                <div>
                  <h2 className="font-semibold text-black group-hover:text-green-700 transition">
                    {c.title}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Assigned Course
                  </p>
                </div>

              </div>

              {/* FOOTER BADGE */}
              <div className="mt-4 flex justify-end">
                <span className="
                  text-xs
                  px-3 py-1
                  rounded-full
                  bg-gray-100
                  text-gray-600
                  group-hover:bg-green-100
                  group-hover:text-green-700
                  transition
                ">
                  Active
                </span>
              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
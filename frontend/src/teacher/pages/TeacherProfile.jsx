import { useEffect, useState } from "react";
import {
  User,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { fetchTeacherMe } from "../api";

export default function TeacherProfile() {
  const [teacher, setTeacher] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const t = await fetchTeacherMe();
        if (!cancelled) setTeacher(t);
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
      <div className="p-6 text-red-600 font-medium">
        {err}
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-6 text-gray-500">
        Loading profile...
      </div>
    );
  }

  const courses = teacher.courses || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-6xl mx-auto">

        {/* HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {/* TOP BANNER */}
          <div className="h-40 bg-gradient-to-r from-green-600 to-green-800 relative">

            {/* AVATAR */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40px]">
              <div className="
                w-28 h-28
                bg-white
                border-4 border-green-600
                rounded-full
                flex items-center justify-center
                text-3xl font-bold text-green-700
                shadow-lg
              ">
                {teacher.name?.charAt(0) || "T"}
              </div>
            </div>

          </div>

          {/* INFO */}
          <div className="pt-16 pb-8 text-center px-4">

            <h1 className="text-2xl md:text-3xl font-bold text-black">
              {teacher.name}
            </h1>

            <p className="text-gray-600 mt-1">
              {teacher.qualification || "Teacher"}
            </p>

            {teacher.experience && (
              <p className="text-sm text-gray-500 mt-1">
                {teacher.experience} experience
              </p>
            )}

            <p className="mt-4 text-xs bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-xl inline-block">
              Profile managed by institute
            </p>

          </div>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* PERSONAL INFO */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">

            <h2 className="text-lg font-bold flex items-center gap-2 text-black mb-4">
              <User className="text-green-600" />
              Personal Info
            </h2>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium text-black">
                  {teacher.gender || "—"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Age</span>
                <span className="font-medium text-black">
                  {teacher.age ?? "—"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Qualification</span>
                <span className="font-medium text-black">
                  {teacher.qualification || "—"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">CNIC</span>
                <span className="font-medium text-black">
                  {teacher.cnic || "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Experience</span>
                <span className="font-medium text-black">
                  {teacher.experience || "—"}
                </span>
              </div>

            </div>

          </div>

          {/* COURSES */}
          <div className="bg-white rounded-2xl shadow-sm border p-5 lg:col-span-2">

            <h2 className="text-lg font-bold flex items-center gap-2 text-black mb-4">
              <GraduationCap className="text-green-600" />
              Assigned Courses
            </h2>

            {courses.length === 0 ? (
              <p className="text-gray-500">
                No courses assigned yet.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">

                {courses.map((c) => (
                  <div
                    key={c._id}
                    className="
                      border
                      rounded-2xl
                      p-4
                      hover:bg-green-50
                      hover:border-green-300
                      transition
                    "
                  >

                    <div className="flex items-center gap-2">

                      <BookOpen className="text-green-600" />

                      <h3 className="font-semibold text-black">
                        {c.title}
                      </h3>

                    </div>

                    {c.description && (
                      <p className="text-sm text-gray-500 mt-2">
                        {c.description}
                      </p>
                    )}

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* CONTACT */}
          <div className="bg-white rounded-2xl shadow-sm border p-5 lg:col-span-3">

            <h2 className="text-lg font-bold text-black mb-4">
              Contact Information
            </h2>

            <div className="grid md:grid-cols-3 gap-4 text-sm">

              <div className="border rounded-xl p-4 hover:bg-green-50 transition">
                <Mail className="text-green-600 mb-2" />
                <p className="text-gray-500 text-xs">Email</p>
                <p className="font-medium text-black">
                  {teacher.email || "—"}
                </p>
              </div>

              <div className="border rounded-xl p-4 hover:bg-green-50 transition">
                <Phone className="text-green-600 mb-2" />
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="font-medium text-black">
                  {teacher.phone || "—"}
                </p>
              </div>

              <div className="border rounded-xl p-4 hover:bg-green-50 transition md:col-span-1">
                <MapPin className="text-green-600 mb-2" />
                <p className="text-gray-500 text-xs">Address</p>
                <p className="font-medium text-black">
                  {teacher.address || "—"}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
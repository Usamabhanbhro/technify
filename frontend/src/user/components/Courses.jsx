"use client";
import "../../index.css"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/courses");
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsClick = (course) => {
    setSelectedCourse(course);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Popular <span className="text-green-600">Courses</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-3">
            Choose from our wide range of industry-leading courses designed to boost your IT career.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20 text-gray-500">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">No courses available at the moment.</div>
          ) : (
            courses.map((course) => (
              <div
                key={course._id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 hover:-translate-y-3 flex flex-col"
              >
                {/* TOP BADGE */}
                <span className="absolute top-3 left-3 z-10 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow-md pointer-events-none">
                  Popular
                </span>

                {/* IMAGE */}
                <div className="relative h-48 overflow-hidden pointer-events-none bg-gray-100">
                  {course.image ? (
                    <img
                      src={`http://localhost:5000/${course.image}`}
                      alt={course.title}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>

                {/* CONTENT */}
                <div className="p-6 relative z-10 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => navigate('/admission')}
                      className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold transition duration-300 hover:bg-green-700 hover:shadow-lg"
                    >
                      Enroll
                    </button>
                    <button 
                      onClick={() => handleDetailsClick(course)}
                      className="flex-1 py-2 rounded-lg border border-green-600 text-green-600 text-sm font-semibold transition duration-300 hover:bg-green-600 hover:text-white"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* POPUP MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCourse(null)}></div>
          <div className="relative bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl slide-in">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="relative h-56 overflow-hidden">
              {selectedCourse.image ? (
                <img
                  src={`http://localhost:5000/${selectedCourse.image}`}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">No Image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-2xl font-bold text-white">{selectedCourse.title}</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {selectedCourse.description}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setSelectedCourse(null); navigate('/admission'); }}
                  className="flex-1 py-3 rounded-lg bg-green-600 text-white font-semibold transition duration-300 hover:bg-green-700"
                >
                  Enroll Now
                </button>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold transition duration-300 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
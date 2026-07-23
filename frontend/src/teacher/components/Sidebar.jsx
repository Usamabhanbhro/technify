import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileText,
  Users,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const TeacherSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      path: "/teacher/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/teacher/courses",
      icon: BookOpen,
      label: "My Courses",
    },
    {
      path: "/teacher/assign-quiz",
      icon: ClipboardCheck,
      label: "Assign Quiz",
    },
    {
      path: "/teacher/quiz-generator",
      icon: ClipboardCheck,
      label: "Quiz Generator",
    },
    {
      path: "/teacher/quizzes",
      icon: FileText,
      label: "Quizzes",
    },
    {
      path: "/teacher/students",
      icon: Users,
      label: "Students",
    },
    {
      path: "/teacher/attendance",
      icon: ClipboardCheck,
      label: "Attendance",
    },
    {
      path: "/teacher/marks",
      icon: FileText,
      label: "Test Marks",
    },
    {
      path: "/teacher/profile",
      icon: User,
      label: "Profile",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    navigate("/teacher/login");
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-lg font-bold text-black">
          IIT Teacher Portal
        </h1>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-green-100 transition-all duration-300"
        >
          <Menu size={24} className="text-black" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          w-72 h-screen
          bg-white
          border-r border-gray-200
          shadow-xl
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-black">
              IIT Teacher Portal
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Teacher Panel
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={22} className="text-black" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  group flex items-center gap-3
                  px-4 py-3 rounded-xl
                  font-medium
                  transition-all duration-300
                  ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-black hover:bg-green-100 hover:text-green-700 hover:translate-x-1"
                  }
                `}
              >
                <Icon
                  size={20}
                  className="transition-transform duration-300 group-hover:scale-110"
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3
              w-full px-4 py-3
              rounded-xl
              font-medium
              text-black
              transition-all duration-300
              hover:bg-red-50
              hover:text-red-600
              hover:shadow-md
            "
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;
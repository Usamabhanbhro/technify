import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, GraduationCap, UserRound } from "lucide-react";

const loginButtons = [
  {
    id: 1,
    title: "Admin Login",
    description: "Manage system & users",
    path: "/admin/login",
    icon: <ShieldCheck size={24} />,
    bg: "bg-green-100",
    text: "text-green-700",
    hover: "hover:bg-green-500 hover:text-white",
    iconHoverText: "group-hover:text-green-600", // ✅ Hover par icon ka color
  },
  {
    id: 2,
    title: "Teacher Login",
    description: "Access classes & students",
    path: "/teacher/login",
    icon: <GraduationCap size={24} />,
    bg: "bg-gray-100",
    text: "text-gray-700",
    hover: "hover:bg-black hover:text-white",
    iconHoverText: "group-hover:text-black", // ✅ Hover par icon ka color
  },
  {
    id: 3,
    title: "Student Login",
    description: "View courses & results",
    path: "/student/login",
    icon: <UserRound size={24} />,
    bg: "bg-green-50",
    text: "text-green-600",
    hover: "hover:bg-green-400 hover:text-white",
    iconHoverText: "group-hover:text-green-500", // ✅ Hover par icon ka color
  },
];

const LoginPortal = () => {
  const navigate = useNavigate();

  return (
    // Navbar ke neeche se portal ko shuru karne ke liye pt-20 add kiya hai
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-20">
      
      <div className="w-full max-w-5xl">
        
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-3">
            Welcome Portal
          </h1>

          <p className="text-gray-500 text-base">
            Select your login panel
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {loginButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => navigate(btn.path)}
              className={`
                ${btn.bg}
                ${btn.text}
                ${btn.hover}
                group
                rounded-2xl
                p-6
                border border-gray-200
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
                text-center
              `}
            >
              
              {/* Icon Container - isme `${btn.iconHoverText}` apply kiya hai */}
              <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm transition-colors duration-300 ${btn.iconHoverText}`}>
                {btn.icon}
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold mb-2">
                {btn.title}
              </h2>

              {/* Description */}
              <p className="text-sm opacity-80">
                {btn.description}
              </p>

            </button>
          ))}

        </div>
      </div>
    </div>
  );
};

export default LoginPortal;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserSquare2, Lock, Eye, EyeOff } from "lucide-react";

export default function TeacherLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    cnic: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("teacherToken", data.token);
        navigate("/teacher/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Teacher Login
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Sign in with CNIC & Password
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* CNIC */}
          <div>
            <label className="text-sm font-medium text-black">
              CNIC
            </label>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 mt-2 focus-within:border-green-500 transition">
              <UserSquare2 className="text-gray-500" size={20} />

              <input
                type="text"
                name="cnic"
                placeholder="42101-1234567-1"
                value={formData.cnic}
                onChange={handleChange}
                className="w-full px-3 py-3 outline-none text-black bg-transparent"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-black">
                Password
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password?type=teacher")}
                className="text-xs text-green-600 hover:text-green-700"
              >
                Forgot?
              </button>
            </div>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 mt-2 focus-within:border-green-500 transition">

              <Lock className="text-gray-500" size={20} />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-3 outline-none text-black bg-transparent"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-green-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold
            hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Teacher Management System
        </p>

      </div>
    </div>
  );
}
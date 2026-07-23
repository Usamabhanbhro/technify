import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Lock,
  GraduationCap,
  CreditCard,
  Calendar,
  MapPin,
  X,
  Plus,
  BookOpen,
} from "lucide-react";

export default function AddTeacher() {
  const [showForm, setShowForm] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    qualification: "",
    cnic: "",
    phone: "",
    email: "",
    address: "",
    experience: "",
    password: "",
    courses: [],
    branchId: "",
    photo: null,
  });

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
    fetchBranches();
  }, []);

  /* Fetch Branches */
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        "http://localhost:5000/api/branches",
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        setBranches(data.branches);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* Fetch Courses */
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        "http://localhost:5000/api/admin/courses",
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* Fetch Teachers */
  const fetchTeachers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        "http://localhost:5000/api/admin/teachers",
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        setTeachers(data.teachers);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  /* Handle Input */
  const handleChange = (e) => {
    const { name, value, multiple, selectedOptions, files } = e.target;

    if (name === "courses" && multiple) {
      const selected = Array.from(selectedOptions).map(
        (opt) => opt.value
      );

      setForm((prev) => ({
        ...prev,
        courses: selected,
      }));
    } else if (name === "photo" && files) {
      setForm((prev) => ({
        ...prev,
        photo: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* Submit Form */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      // Add all form fields
      formData.append('name', form.name);
      formData.append('gender', form.gender);
      formData.append('age', form.age);
      formData.append('qualification', form.qualification);
      formData.append('cnic', form.cnic);
      formData.append('phone', form.phone);
      formData.append('email', form.email);
      formData.append('address', form.address);
      formData.append('experience', form.experience);
      formData.append('password', form.password);
      formData.append('branchId', form.branchId);
      
      // Add courses array
      if (form.courses && form.courses.length > 0) {
        form.courses.forEach((course) => {
          formData.append('courses[]', course);
        });
      }
      
      // Add photo file if selected
      if (form.photo) {
        formData.append('photo', form.photo);
      }
      
      const res = await fetch(
        "http://localhost:5000/api/admin/add-teacher",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Teacher Added Successfully!");

        setShowForm(false);

        setForm({
          name: "",
          gender: "",
          age: "",
          qualification: "",
          cnic: "",
          phone: "",
          email: "",
          address: "",
          experience: "",
          password: "",
          courses: [],
          branchId: "",
          photo: null,
        });

        fetchTeachers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to add teacher");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 lg:p-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Teacher Management
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Add and manage teachers
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-lg transition"
        >
          <Plus size={20} />

          Add Teacher
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">

          <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl relative overflow-hidden">

              {/* Close */}
              <button
                className="absolute top-4 right-4 text-white z-50 hover:text-red-200"
                onClick={() => setShowForm(false)}
              >
                <X size={28} />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 sm:p-6 text-white">

                <h2 className="text-xl sm:text-2xl font-bold">
                  Add New Teacher
                </h2>

                <p className="text-emerald-100 text-sm mt-1">
                  Fill all required teacher details
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
              >

                {/* Name */}
                <InputField
                  icon={<User size={18} />}
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Age */}
                <InputField
                  icon={<Calendar size={18} />}
                  label="Age"
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                />

                {/* Qualification */}
                <InputField
                  icon={<GraduationCap size={18} />}
                  label="Qualification"
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="BS / MS / PhD"
                />

                {/* Assign Courses */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Assign Courses
                  </label>

                  <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">

                    <BookOpen
                      size={18}
                      className="text-slate-400 shrink-0"
                    />

                    <select
                      name="courses"
                      value={form.courses}
                      onChange={handleChange}
                      multiple
                      required
                      className="w-full ml-3 outline-none bg-transparent text-sm sm:text-base"
                    >
                      {courses.map((course) => (
                        <option
                          key={course._id}
                          value={course._id}
                        >
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple courses.
                  </p>
                </div>

                {/* Assign Branch */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Assign Branch *
                  </label>

                  <select
                    name="branchId"
                    value={form.branchId}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">
                      Select Branch
                    </option>

                    {branches.map((branch) => (
                      <option
                        key={branch._id}
                        value={branch._id}
                      >
                        {branch.branchName} ({branch.branchCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <InputField
                  icon={<BookOpen size={18} />}
                  label="Experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="3 Years"
                />

                {/* CNIC */}
                <InputField
                  icon={<CreditCard size={18} />}
                  label="CNIC"
                  name="cnic"
                  value={form.cnic}
                  onChange={handleChange}
                  placeholder="42101-1234567-1"
                  maxLength={15}
                />

                {/* Phone */}
                <InputField
                  icon={<Phone size={18} />}
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03XX-XXXXXXX"
                />

                {/* Email */}
                <InputField
                  icon={<Mail size={18} />}
                  label="Email Address"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="teacher@gmail.com"
                />

                {/* Password */}
                <InputField
                  icon={<Lock size={18} />}
                  label="Password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="******"
                  maxLength={6}
                />

                {/* Profile Picture */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-xl file:bg-emerald-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg hover:file:bg-emerald-700"
                  />
                  {form.photo && (
                    <p className="text-xs text-emerald-600 mt-1">✓ {form.photo.name} selected</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address
                  </label>

                  <div className="flex items-start border border-slate-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">

                    <MapPin
                      size={18}
                      className="text-slate-400 mt-1 shrink-0"
                    />

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      rows="3"
                      required
                      className="w-full outline-none resize-none ml-3 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="md:col-span-2 pt-2">

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
                  >
                    Add Teacher
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Teachers Table */}
      <div className="max-w-7xl mx-auto mt-8 bg-white rounded-xl shadow p-4">

        <h2 className="text-lg font-bold mb-4 text-slate-800">
          All Teachers
        </h2>

        {loading ? (
          <div className="text-center text-slate-400 py-8">
            Loading...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            {error}
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            No teachers found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-[900px] w-full text-left border border-slate-200">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Qualification</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Courses</th>
                  <th className="px-4 py-3">CNIC</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher, index) => (
                  <tr
                    key={teacher._id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.name}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.gender}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.age}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.qualification}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.branchId?.branchName || 'N/A'}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.courses?.length > 0
                        ? teacher.courses
                            .map((c) => c.title)
                            .join(", ")
                        : "No Course"}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.cnic}
                    </td>

                    <td className="px-4 py-3">
                      {teacher.phone}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* Reusable Input Component */
function InputField({
  icon,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  maxLength,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">

        <span className="text-slate-400 shrink-0">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full outline-none ml-3 bg-transparent text-sm sm:text-base"
        />
      </div>
    </div>
  );
}
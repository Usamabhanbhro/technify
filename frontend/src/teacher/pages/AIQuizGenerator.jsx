import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  generateAIQuiz,
  assignQuizToStudents,
  clearError,
  clearSuccess,
} from "../store/quizSlice";
import quizAPI from "../api/quizApi";
import { AlertCircle, CheckCircle, Loader, X } from "lucide-react";

const AIQuizGenerator = () => {
  const dispatch = useDispatch();
  const { currentQuiz, loading, error, successMessage } = useSelector(
    (state) => state.quiz
  );

  const [formData, setFormData] = useState({
    subject: "",
    numQuestions: 10,
    difficulty: "Medium",
    quizTime: 30,
    quizTitle: "",
  });

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [showStudentSelection, setShowStudentSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningQuiz, setAssigningQuiz] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);
      const response = await quizAPI.getStudentsList();
      setStudents(response.data.students);
    } catch (err) {
      console.log(err);
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "numQuestions" || name === "quizTime"
          ? parseInt(value)
          : value,
    }));
  };

  const handleGenerateQuiz = (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) return alert("Enter subject");

    const quizData = {
      ...formData,
      quizTitle:
        formData.quizTitle ||
        `${formData.subject} Quiz - ${formData.difficulty}`,
      assignedStudents: [],
    };

    dispatch(generateAIQuiz(quizData));
  };

  const handleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  const handleAssignQuiz = async () => {
    if (!selectedStudents.length) return alert("Select students");

    setAssigningQuiz(true);

    await dispatch(
      assignQuizToStudents({
        quizId: currentQuiz._id,
        studentIds: selectedStudents,
      })
    );

    setSelectedStudents([]);
    setShowStudentSelection(false);
    setAssigningQuiz(false);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            AI Quiz Generator
          </h1>
          <p className="text-gray-600">
            Generate AI quizzes and assign to students
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" />
              <p>{error}</p>
            </div>
            <button onClick={() => dispatch(clearError())}>
              <X />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" />
              <p>{successMessage}</p>
            </div>
            <button onClick={() => dispatch(clearSuccess())}>
              <X />
            </button>
          </div>
        )}

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* FORM */}
          <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">

            <h2 className="text-xl font-bold mb-5 text-black">
              Quiz Configuration
            </h2>

            <form onSubmit={handleGenerateQuiz} className="space-y-5">

              {/* Subject */}
              <input
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Subject"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />

              {/* Title */}
              <input
                name="quizTitle"
                value={formData.quizTitle}
                onChange={handleInputChange}
                placeholder="Quiz Title (optional)"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              />

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  type="number"
                  name="numQuestions"
                  value={formData.numQuestions}
                  onChange={handleInputChange}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="MCQs"
                />

                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>

              </div>

              {/* Time */}
              <input
                type="number"
                name="quizTime"
                value={formData.quizTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="Time (minutes)"
              />

              {/* Button */}
              <button
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition flex justify-center items-center gap-2"
              >
                {loading && <Loader className="animate-spin" />}
                {loading ? "Generating..." : "Generate Quiz"}
              </button>

            </form>
          </div>

          {/* PREVIEW */}
          {currentQuiz && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">

              <h2 className="text-lg font-bold mb-4">Preview</h2>

              <div className="space-y-3 text-sm">

                <p><b>Title:</b> {currentQuiz.title}</p>
                <p><b>Subject:</b> {currentQuiz.subject}</p>
                <p><b>Difficulty:</b> {currentQuiz.difficulty}</p>
                <p><b>Questions:</b> {currentQuiz.totalQuestions}</p>

              </div>

              <button
                onClick={() => setShowStudentSelection(true)}
                className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
              >
                Assign Students
              </button>

            </div>
          )}

        </div>

        {/* MODAL */}
        {showStudentSelection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

            <div className="bg-white w-full max-w-2xl rounded-2xl p-6">

              <h2 className="text-xl font-bold mb-4">
                Select Students
              </h2>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full px-4 py-3 border rounded-xl mb-4"
              />

              <div className="max-h-80 overflow-y-auto space-y-2">

                {filteredStudents.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center gap-3 p-3 border rounded-xl hover:bg-green-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s._id)}
                      onChange={() => handleStudentSelection(s._id)}
                    />
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-gray-500">{s.email}</p>
                    </div>
                  </div>
                ))}

              </div>

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => setShowStudentSelection(false)}
                  className="w-full py-2 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAssignQuiz}
                  disabled={assigningQuiz}
                  className="w-full py-2 bg-green-600 text-white rounded-xl"
                >
                  Assign
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AIQuizGenerator;
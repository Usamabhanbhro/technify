import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacherQuizzes,
  fetchQuizResults,
  fetchQuizLeaderboard,
} from "../store/quizSlice";

import {
  Download,
  Eye,
  EyeOff,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";

import jsPDF from "jspdf";
import "jspdf-autotable";

const TeacherQuizDashboard = () => {
  const dispatch = useDispatch();
  const { quizzes, quizResults, leaderboard, loading } = useSelector(
    (state) => state.quiz
  );

  const [activeTab, setActiveTab] = useState("quizzes");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    dispatch(fetchTeacherQuizzes());
  }, [dispatch]);

  const handleQuizSelect = async (quizId) => {
    setSelectedQuiz(quizId);
    await Promise.all([
      dispatch(fetchQuizResults(quizId)),
      dispatch(fetchQuizLeaderboard(quizId)),
    ]);
    setActiveTab("results");
  };

  const calculateAnalytics = (results) => {
    if (!results?.length)
      return {
        totalAttempts: 0,
        averageScore: 0,
        passPercentage: 0,
        maxScore: 0,
        minScore: 0,
      };

    const scores = results.map((r) => r.score);
    const pass = results.filter((r) => r.status === "Pass").length;

    return {
      totalAttempts: results.length,
      averageScore: (
        scores.reduce((a, b) => a + b, 0) / scores.length
      ).toFixed(2),
      passPercentage: ((pass / results.length) * 100).toFixed(2),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
    };
  };

  const selectedQuizData = quizzes.find((q) => q._id === selectedQuiz);
  const analytics = calculateAnalytics(quizResults);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            Quiz Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage quizzes, results and leaderboards
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b mb-6">

          {["quizzes", "results", "leaderboard"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab !== "quizzes" && !selectedQuiz}
              className={`
                px-4 py-2 font-semibold capitalize transition
                ${
                  activeTab === tab
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-black"
                }
                disabled:opacity-40
              `}
            >
              {tab}
            </button>
          ))}

        </div>

        {/* ================= QUIZZES ================= */}
        {activeTab === "quizzes" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : quizzes.length === 0 ? (
              <p className="text-gray-500">No quizzes yet</p>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  onClick={() => handleQuizSelect(quiz._id)}
                  className="
                    bg-white border rounded-2xl p-5
                    hover:bg-green-50 hover:border-green-300
                    transition cursor-pointer
                  "
                >

                  <h2 className="font-bold text-black">
                    {quiz.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {quiz.subject}
                  </p>

                  <div className="flex justify-between mt-4 text-sm">
                    <span className="text-gray-700">
                      {quiz.totalQuestions} Qs
                    </span>
                    <span className="text-gray-700">
                      {quiz.duration} min
                    </span>
                  </div>

                  <div className="flex justify-between mt-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <Users size={14} />
                      {quiz.assignedStudents}
                    </span>

                    <span className="flex items-center gap-1 text-blue-600">
                      <TrendingUp size={14} />
                      {quiz.attempts}
                    </span>
                  </div>

                </div>
              ))
            )}

          </div>
        )}

        {/* ================= RESULTS ================= */}
        {activeTab === "results" && selectedQuizData && (
          <div>

            {/* ANALYTICS */}
            <div className="grid md:grid-cols-5 gap-4 mb-6">

              {[
                ["Total", analytics.totalAttempts],
                ["Avg", analytics.averageScore],
                ["Pass %", analytics.passPercentage],
                ["Max", analytics.maxScore],
                ["Min", analytics.minScore],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white border rounded-2xl p-4 text-center"
                >
                  <p className="text-gray-500 text-sm">{label}</p>
                  <p className="text-xl font-bold text-black">
                    {value}
                  </p>
                </div>
              ))}

            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-2xl overflow-hidden">

              <table className="w-full text-sm">

                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">%</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {quizResults.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b hover:bg-green-50 transition"
                    >
                      <td className="p-3 text-black font-medium">
                        {r.studentId?.name}
                      </td>
                      <td className="p-3">{r.score}</td>
                      <td className="p-3">{r.percentage}%</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            r.status === "Pass"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* ================= LEADERBOARD ================= */}
        {activeTab === "leaderboard" && selectedQuizData && (
          <div className="bg-white border rounded-2xl overflow-hidden">

            <div className="bg-green-600 text-white p-4 flex items-center gap-2">
              <Trophy />
              <h2 className="font-bold">Leaderboard</h2>
            </div>

            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Score</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((l, i) => (
                  <tr
                    key={l._id}
                    className="border-b hover:bg-green-50"
                  >
                    <td className="p-3 text-center font-bold">
                      {i + 1}
                    </td>
                    <td className="p-3">{l.studentName}</td>
                    <td className="p-3 font-bold text-green-700">
                      {l.score}
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
};

export default TeacherQuizDashboard;
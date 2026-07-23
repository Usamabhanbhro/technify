import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentQuizAPI from '../api/studentQuizApi';
import { initializeSocket } from '../../utils/socketConfig';
import { Clock, BookOpen, AlertCircle, Loader, CheckCircle } from 'lucide-react';

const MyQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuizzes, setNewQuizzes] = useState([]); // For notifications
  const studentId = localStorage.getItem('studentId'); // Assuming this is stored during login

  useEffect(() => {
    // Initialize socket connection for real-time updates
    if (studentId) {
      initializeSocket(studentId);
    }

    // Listen for new quiz assignments
    const handleQuizAssigned = (event) => {
      const newQuiz = event.detail;
      setNewQuizzes((prev) => [...prev, newQuiz]);

      // Auto-fetch updated quizzes after a delay
      setTimeout(() => {
        fetchMyQuizzes();
      }, 2000);
    };

    window.addEventListener('quizAssigned', handleQuizAssigned);
    fetchMyQuizzes();

    return () => {
      window.removeEventListener('quizAssigned', handleQuizAssigned);
    };
  }, [studentId]);

  const fetchMyQuizzes = async () => {
    try {
      setLoading(true);
      const response = await studentQuizAPI.getMyQuizzes();
      setQuizzes(response.data.quizzes || []);
      setError('');
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.response?.data?.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/student/quiz/${quizId}/take`);
  };

  const handleViewResult = (quizId) => {
    navigate(`/student/quiz/${quizId}/result`);
  };

  const dismissNewQuizNotification = (quizId) => {
    setNewQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));
  };

  const getQuizStatus = (quiz) => {
    if (quiz.attempted) {
      return {
        status: 'Completed',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      };
    }
    return {
      status: 'Pending',
      color: 'bg-yellow-100 text-yellow-700',
      icon: AlertCircle,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Quizzes</h1>
          <p className="text-gray-600">Complete your assigned quizzes and track your progress</p>
        </div>

        {/* New Quiz Notifications */}
        {newQuizzes.length > 0 && (
          <div className="mb-6 space-y-3">
            {newQuizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="bg-blue-100 border border-blue-400 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-blue-800">New Quiz Assigned!</p>
                  <p className="text-blue-700">{quiz.title}</p>
                </div>
                <button
                  onClick={() => dismissNewQuizNotification(quiz.quizId)}
                  className="text-blue-600 hover:text-blue-800 text-xl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
            <p className="text-gray-600">Loading your quizzes...</p>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const { status, color, icon: StatusIcon } = getQuizStatus(quiz);
              return (
                <div
                  key={quiz._id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-start justify-between mb-2">
                      <BookOpen size={24} />
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                        {status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{quiz.title}</h3>
                    <p className="text-blue-100 text-sm mt-1">{quiz.courseName}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Quiz Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase">Questions</p>
                        <p className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2">
                        <Clock size={16} className="text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="text-lg font-bold text-green-600">-</p>
                        </div>
                      </div>
                    </div>

                    {/* Score Display (if attempted) */}
                    {quiz.attempted && quiz.score !== null && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase mb-2">Your Score</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-bold text-purple-600">
                              {quiz.score}
                            </p>
                            <p className="text-sm text-gray-600">
                              out of {quiz.totalMarks}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-pink-600">
                              {((quiz.score / quiz.totalMarks) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quiz Date */}
                    <p className="text-xs text-gray-500">
                      Created: {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      {!quiz.attempted ? (
                        <button
                          onClick={() => handleStartQuiz(quiz._id)}
                          className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition"
                        >
                          Start Quiz
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartQuiz(quiz._id)}
                            className="bg-blue-100 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-200 transition"
                          >
                            Retake
                          </button>
                          <button
                            onClick={() => handleViewResult(quiz._id)}
                            className="bg-green-100 text-green-600 py-2 rounded-lg font-semibold hover:bg-green-200 transition"
                          >
                            View Result
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 text-lg">No quizzes assigned yet</p>
            <p className="text-gray-500 mt-2">Your teacher will assign quizzes here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuizzes;

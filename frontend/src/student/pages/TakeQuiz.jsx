import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentQuizAPI from '../api/studentQuizApi';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, Loader } from 'lucide-react';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  useEffect(() => {
    if (!started || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, quiz]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await studentQuizAPI.getQuizForAttempt(quizId);
      setQuiz(response.data.quiz);
      setTimeLeft(response.data.quiz.duration * 60); // Convert minutes to seconds
      setError('');
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setStarted(true);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      // Prepare answers in the format expected by backend
      const formattedAnswers = quiz.questions.map((q, idx) => ({
        questionId: q._id,
        selectedAnswer: answers[idx] || null,
      }));

      const response = await studentQuizAPI.submitQuizAttempt(quizId, formattedAnswers);
      navigate(`/student/quiz/${quizId}/result`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredQuestions = Object.keys(answers).length;
  const isTimeRunningOut = timeLeft < 300; // Less than 5 minutes

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <p className="text-gray-600 text-lg">{error || 'Quiz not found'}</p>
          <button
            onClick={() => navigate('/student/quizzes')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{quiz.title}</h1>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Questions</p>
                <p className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Duration</p>
                <p className="text-2xl font-bold text-green-600">{quiz.duration}m</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Difficulty</p>
                <p className="text-2xl font-bold text-purple-600">{quiz.difficulty}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Subject</p>
                <p className="text-lg font-bold text-orange-600">{quiz.subject}</p>
              </div>
            </div>

            {quiz.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{quiz.description}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-800 mb-2">Important Instructions:</p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Read each question carefully before answering</li>
                <li>You can navigate between questions using Previous and Next buttons</li>
                <li>The timer will count down. Submit before time runs out</li>
                <li>You cannot go back to this page after starting</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition text-lg"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
            <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {quiz.totalQuestions}</p>
          </div>

          <div className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xl ${
            isTimeRunningOut ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            <Clock size={24} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Question */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                        answers[currentQuestionIndex] === option
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option}
                        checked={answers[currentQuestionIndex] === option}
                        onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-4 text-gray-800 font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={20} />
                </button>

                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h4 className="font-bold text-gray-800 mb-4">
                Progress: {answeredQuestions}/{quiz.totalQuestions}
              </h4>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {quiz.questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-full aspect-square rounded-lg font-bold text-sm transition ${
                      idx === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[idx]
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded border border-green-400"></div>
                  <p className="text-gray-700">Answered</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded border border-gray-400"></div>
                  <p className="text-gray-700">Not Answered</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded border border-blue-400"></div>
                  <p className="text-gray-700">Current</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;

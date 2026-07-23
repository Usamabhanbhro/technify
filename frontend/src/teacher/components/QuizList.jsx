import { useEffect, useState } from 'react';
import { getTeacherQuizzes, deleteQuiz } from '../api';
import { Link } from 'react-router-dom';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await getTeacherQuizzes();
      setQuizzes(data.quizzes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this quiz permanently?')) {
      await deleteQuiz(id);
      loadQuizzes();
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Quizzes</h2>
      {quizzes.length === 0 && <p>No quizzes created yet.</p>}
      <div className="space-y-3">
        {quizzes.map((q) => (
          <div key={q._id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm text-gray-600">Course: {q.courseName} | Questions: {q.questions?.length} | Attempts: {q.attemptCount}</p>
            </div>
            <div className="space-x-2">
              <Link to={`/teacher/quiz-results/${q._id}`} className="text-blue-600">Results</Link>
              <button onClick={() => handleDelete(q._id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizList;
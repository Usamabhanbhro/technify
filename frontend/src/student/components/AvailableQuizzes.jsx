import { useEffect, useState } from 'react';
import { getStudentQuizzes } from '../api';
import { Link } from 'react-router-dom';

const AvailableQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await getStudentQuizzes();
      setQuizzes(data.quizzes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      {quizzes.length === 0 && <p>No quizzes assigned to your course.</p>}
      <div className="space-y-3">
        {quizzes.map((q) => (
          <div key={q._id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm text-gray-600">Course: {q.courseName} | Questions: {q.totalQuestions}</p>
              {q.attempted ? (
                <p className="text-green-600 text-sm">✅ Attempted – Score: {q.score}/{q.totalMarks}</p>
              ) : (
                <p className="text-red-500 text-sm">⚠️ Not attempted yet</p>
              )}
            </div>
            {!q.attempted && (
              <Link to={`/student/take-quiz/${q._id}`} className="bg-blue-600 text-white px-4 py-2 rounded">Start Quiz</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableQuizzes;
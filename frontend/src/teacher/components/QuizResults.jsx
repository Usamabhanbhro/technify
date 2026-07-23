import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizResults } from '../api';

const QuizResults = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const data = await getQuizResults(id);
      setQuiz(data.quiz);
      setAttempts(data.attempts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!quiz) return <div className="p-6">Quiz not found</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">{quiz.title}</h2>
      <p className="mb-4">Course: {quiz.courseName} | Total Questions: {quiz.totalQuestions}</p>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Student</th>
            <th className="border p-2">Roll No</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Out of</th>
            <th className="border p-2">Attempted At</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a._id}>
              <td className="border p-2">{a.student?.name || 'N/A'}</td>
              <td className="border p-2">{a.student?.rollNo || '—'}</td>
              <td className="border p-2">{a.score}</td>
              <td className="border p-2">{a.totalMarks}</td>
              <td className="border p-2">{new Date(a.attemptedAt).toLocaleString()}</td>
            </tr>
          ))}
          {attempts.length === 0 && (
            <tr><td colSpan="5" className="border p-2 text-center">No attempts yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuizResults;
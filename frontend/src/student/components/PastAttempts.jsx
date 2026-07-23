import { useEffect, useState } from 'react';
import { getPastAttempts } from '../api';

const PastAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const data = await getPastAttempts();
      setAttempts(data.attempts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Past Quiz Attempts</h2>
      {attempts.length === 0 && <p>No attempts yet.</p>}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Quiz Title</th>
            <th className="border p-2">Course</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Attempted At</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a._id}>
              <td className="border p-2">{a.quizTitle}</td>
              <td className="border p-2">{a.courseName}</td>
              <td className="border p-2">{a.score}/{a.totalMarks}</td>
              <td className="border p-2">{new Date(a.attemptedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PastAttempts;
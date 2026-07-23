import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizDetails, submitQuiz } from '../api';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const data = await getQuizDetails(id);
      setQuiz(data.quiz);
      setAnswers(new Array(data.quiz.questions.length).fill(null));
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('already attempted')) {
        alert('You have already attempted this quiz.');
        navigate('/student/quizzes');
      } else {
        alert('Error loading quiz');
        console.error(err);
      }
    }
  };

  const handleAnswer = (qIdx, optIdx) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert('Please answer all questions');
      return;
    }
    setSubmitting(true);
    try {
      const data = await submitQuiz(id, answers);
      alert(`Quiz submitted! Your score: ${data.score}/${data.totalMarks}`);
      navigate('/student/quizzes');
    } catch (err) {
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) return <div className="p-6">Loading quiz...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
      <p className="mb-4 text-gray-600">Course: {quiz.courseName}</p>
      <form onSubmit={(e) => e.preventDefault()}>
        {quiz.questions.map((q, idx) => (
          <div key={idx} className="border p-4 mb-4 rounded bg-gray-50">
            <p className="font-semibold mb-2">{idx + 1}. {q.questionText}</p>
            <div className="ml-4 space-y-1">
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className="block">
                  <input type="radio" name={`q${idx}`} value={optIdx} checked={answers[idx] === optIdx} onChange={() => handleAnswer(idx, optIdx)} className="mr-2" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={handleSubmit} disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded w-full">
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  );
};

export default TakeQuiz;
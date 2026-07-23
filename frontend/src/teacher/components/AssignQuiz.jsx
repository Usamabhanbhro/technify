import { useEffect, useState } from 'react';
import { createQuiz, fetchTeacherCourses } from '../api';

const AssignQuiz = () => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', ''], correctIndex: 0 },
  ]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const list = await fetchTeacherCourses();
        setCourses(list);
        if (list.length) setCourseId(list[0]._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load courses.');
      } finally {
        setCourseLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: '', options: ['', ''], correctIndex: 0 },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createQuiz({ courseId, title, questions });
      alert('Quiz assigned successfully!');

      setTitle('');
      setQuestions([{ questionText: '', options: ['', ''], correctIndex: 0 }]);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating quiz');
    } finally {
      setLoading(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="p-6 text-center text-black">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Assign New Quiz
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Create quizzes for your assigned courses
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* NO COURSES */}
        {courses.length === 0 ? (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded text-sm text-yellow-700">
            No courses assigned yet.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* COURSE */}
            <div>
              <label className="font-semibold">Select Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* TITLE */}
            <div>
              <label className="font-semibold">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* QUESTIONS */}
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="border rounded-xl p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition"
                >
                  <h3 className="font-bold mb-3">
                    Question {qIdx + 1}
                  </h3>

                  {/* QUESTION INPUT */}
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIdx].questionText = e.target.value;
                      setQuestions(updated);
                    }}
                    placeholder="Enter question"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />

                  {/* OPTIONS */}
                  <div className="mt-4 space-y-2">
                    {q.options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIdx].options[i] = e.target.value;
                          setQuestions(updated);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-3 rounded-lg border hover:bg-green-600 hover:text-white transition"
              >
                + Add Question
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-3 rounded-lg bg-black text-white hover:bg-green-600 transition flex-1"
              >
                {loading ? 'Assigning...' : 'Create Quiz'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default AssignQuiz;
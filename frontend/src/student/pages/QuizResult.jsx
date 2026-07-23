import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentQuizAPI from '../api/studentQuizApi';
import { Download, Home, Loader, AlertCircle, CheckCircle, X } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QuizResult = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailedAnswers, setShowDetailedAnswers] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchQuizResult();
  }, [quizId]);

  const fetchQuizResult = async () => {
    try {
      setLoading(true);
      const response = await studentQuizAPI.getQuizResult(quizId);
      setResult(response.data.result);
      setError('');
    } catch (err) {
      console.error('Error fetching result:', err);
      setError(err.response?.data?.message || 'Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  const generateResultPDF = async () => {
    if (!result) return;

    setDownloadingPDF(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Quiz Result Report', pageWidth / 2, 20, { align: 'center' });

      // Divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, 25, pageWidth - 10, 25);

      // Student & Quiz Info
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      const infoY = 35;
      pdf.text(`Student Name: [Your Name]`, 20, infoY);
      pdf.text(`Quiz: ${result.quizTitle || 'Quiz'}`, 20, infoY + 8);
      pdf.text(`Date: ${new Date(result.submittedAt).toLocaleDateString()}`, 20, infoY + 16);
      pdf.text(`Time: ${new Date(result.submittedAt).toLocaleTimeString()}`, 20, infoY + 24);

      // Score Section
      pdf.setFontSize(14);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Your Performance', 20, infoY + 40);

      // Score Card
      const scoreBoxY = infoY + 48;
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, scoreBoxY, pageWidth - 40, 40, 'F');
      pdf.setFontSize(28);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${result.score} / ${result.totalMarks}`, pageWidth / 2, scoreBoxY + 20, {
        align: 'center',
      });

      // Percentage and Status
      pdf.setFontSize(12);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`${result.percentage}% - ${result.status}`, pageWidth / 2, scoreBoxY + 32, {
        align: 'center',
      });

      // Statistics
      const statsY = scoreBoxY + 50;
      pdf.setFontSize(11);
      pdf.setTextColor(51, 65, 85);

      const statsData = [
        ['Metric', 'Value'],
        ['Correct Answers', result.correctAnswers.toString()],
        ['Wrong Answers', result.wrongAnswers.toString()],
        ['Time Taken', result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 'N/A'],
      ];

      pdf.autoTable({
        startY: statsY,
        head: statsData.slice(0, 1),
        body: statsData.slice(1),
        margin: { left: 20, right: 20 },
        styles: {
          textColor: [51, 65, 85],
          fontSize: 10,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
      });

      // Detailed Answers
      if (result.resultDetails && result.resultDetails.length > 0) {
        const detailsY = pdf.lastAutoTable.finalY + 20;
        pdf.setFontSize(12);
        pdf.setTextColor(51, 65, 85);
        pdf.text('Detailed Answers', 20, detailsY);

        const detailsData = [
          ['Q No.', 'Your Answer', 'Correct Answer', 'Result'],
          ...result.resultDetails.map((detail, idx) => [
            (idx + 1).toString(),
            detail.userAnswer || 'Not Answered',
            detail.correctAnswer || 'N/A',
            detail.isCorrect ? 'Correct' : 'Wrong',
          ]),
        ];

        pdf.autoTable({
          startY: detailsY + 10,
          head: detailsData.slice(0, 1),
          body: detailsData.slice(1),
          margin: { left: 20, right: 20 },
          styles: {
            textColor: [51, 65, 85],
            fontSize: 9,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          bodyStyles: {
            lineColor: [200, 200, 200],
          },
        });
      }

      pdf.save(`quiz-result-${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-gray-600">Loading your result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <p className="text-gray-600 text-lg mb-6">{error || 'Result not found'}</p>
          <button
            onClick={() => navigate('/student/quizzes')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const statusColor = result.status === 'Pass' ? 'green' : 'red';
  const statusBgColor = statusColor === 'green' ? 'bg-green-100' : 'bg-red-100';
  const statusTextColor = statusColor === 'green' ? 'text-green-700' : 'text-red-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Quiz Result</h1>
          <p className="text-gray-600 mt-2">Your performance summary and detailed feedback</p>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden mb-8">
          {/* Result Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{result.quizTitle || 'Quiz'}</h2>
            <p className="text-blue-100">Completed on {new Date(result.submittedAt).toLocaleDateString()}</p>
          </div>

          {/* Score Display */}
          <div className="p-8">
            {/* Status Badge */}
            <div className="flex justify-between items-center mb-8">
              <span className={`px-6 py-3 rounded-full font-bold text-lg ${statusBgColor} ${statusTextColor}`}>
                {result.status === 'Pass' ? '✓ PASSED' : '✗ FAILED'}
              </span>
              <button
                onClick={generateResultPDF}
                disabled={downloadingPDF}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPDF ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download PDF
                  </>
                )}
              </button>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Main Score */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <p className="text-sm text-blue-100 mb-2">Your Score</p>
                <p className="text-4xl font-bold">{result.score}</p>
                <p className="text-sm text-blue-100 mt-2">out of {result.totalMarks}</p>
              </div>

              {/* Percentage */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <p className="text-sm text-purple-100 mb-2">Percentage</p>
                <p className="text-4xl font-bold">{result.percentage}%</p>
                <p className="text-sm text-purple-100 mt-2">Score percentage</p>
              </div>

              {/* Correct Answers */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <p className="text-sm text-green-100 mb-2">Correct</p>
                <p className="text-4xl font-bold">{result.correctAnswers}</p>
                <p className="text-sm text-green-100 mt-2">correct answers</p>
              </div>

              {/* Wrong Answers */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
                <p className="text-sm text-red-100 mb-2">Wrong</p>
                <p className="text-4xl font-bold">{result.wrongAnswers}</p>
                <p className="text-sm text-red-100 mt-2">wrong answers</p>
              </div>
            </div>

            {/* Time Taken */}
            {result.timeTaken && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">⏱</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Taken</p>
                  <p className="text-lg font-bold text-gray-800">
                    {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Answers Section */}
            {result.resultDetails && result.resultDetails.length > 0 && (
              <div className="border-t pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Detailed Answers</h3>
                  <button
                    onClick={() => setShowDetailedAnswers(!showDetailedAnswers)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {showDetailedAnswers ? 'Hide' : 'Show'} Details
                  </button>
                </div>

                {showDetailedAnswers && (
                  <div className="space-y-4">
                    {result.resultDetails.map((detail, idx) => (
                      <div
                        key={idx}
                        className={`border-l-4 p-4 rounded ${
                          detail.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {detail.isCorrect ? (
                              <CheckCircle className="text-green-600" size={24} />
                            ) : (
                              <X className="text-red-600" size={24} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 mb-2">
                              Q{idx + 1}: {detail.question}
                            </p>
                            <div className="space-y-2 text-sm">
                              <p className="text-gray-700">
                                <span className="font-semibold">Your Answer:</span>{' '}
                                <span className={detail.isCorrect ? 'text-green-700 font-bold' : 'text-red-700'}>
                                  {detail.userAnswer || 'Not Answered'}
                                </span>
                              </p>
                              {!detail.isCorrect && (
                                <p className="text-gray-700">
                                  <span className="font-semibold">Correct Answer:</span>{' '}
                                  <span className="text-green-700 font-bold">{detail.correctAnswer}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/student/quizzes')}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Home size={20} />
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;

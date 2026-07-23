const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    quizAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizAttempt',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    wrongAnswers: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    resultDetails: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
      },
    ],
    resultPdfUrl: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

resultSchema.index({ quizId: 1 });
resultSchema.index({ studentId: 1 });
resultSchema.index({ quizId: 1, studentId: 1 });

module.exports = mongoose.model('Result', resultSchema);

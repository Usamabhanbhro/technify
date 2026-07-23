const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
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
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: String,
        isCorrect: Boolean,
      },
    ],
    score: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 1 },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Pending'],
      default: 'Pending',
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A student can attempt each quiz multiple times (removed unique index)
quizAttemptSchema.index({ quizId: 1, studentId: 1 });
quizAttemptSchema.index({ studentId: 1 });
quizAttemptSchema.index({ quizId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema, 'QuizAttempts');


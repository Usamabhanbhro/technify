const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length === 4, 'Exactly 4 options required'],
    },
    correctAnswer: { type: String, required: true },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    // Basic Info
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    description: { type: String, default: '' },
    
    // Creator & Course
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    courseName: { type: String },
    
    // Quiz Configuration
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    passPercentage: {
      type: Number,
      default: 50,
    },
    
    // Questions
    questions: {
      type: [questionSchema],
      required: true,
      validate: [(arr) => arr.length >= 1, 'At least 1 question required'],
    },
    
    // Assignment & Options
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      marks: { type: Number, default: 0.5 },
    },
    randomizeQuestions: {
      type: Boolean,
      default: true,
    },
    randomizeOptions: {
      type: Boolean,
      default: true,
    },
    
    // Quiz Status
    expiryDate: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

quizSchema.index({ teacherId: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ courseName: 1 });
quizSchema.index({ 'assignedTo': 1 });

module.exports = mongoose.model('Quiz', quizSchema, 'Quizzes');


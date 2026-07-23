const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // Path to the uploaded image
  courseFee: { type: Number, required: true, min: 0 }, // Course fee in PKR
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema, 'Courses');

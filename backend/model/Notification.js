const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Donation', 'Payment', 'Admission', 'Enrollment', 'Certificate', 'System', 'Other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedTo: {
    type: String, // ID of related document (donation ID, student ID, etc.)
  },
  relatedType: {
    type: String, // Type of related document (Donation, Student, etc.)
  },
  sender: {
    name: String,
    email: String,
  },
  status: {
    type: String,
    enum: ['Unread', 'Read', 'Archived'],
    default: 'Unread',
  },
  details: {
    amount: Number,
    paymentMethod: String,
    paymentScreenshot: String,
    studentName: String,
    studentEmail: String,
    donorName: String,
    donorEmail: String,
    courseName: String,
    // Add other relevant fields as needed
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: Date,
});

module.exports = mongoose.model('Notification', notificationSchema);

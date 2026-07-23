const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: true,
    trim: true
  },
  branchCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);

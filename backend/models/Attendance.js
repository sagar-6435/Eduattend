const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true,
  },
  time: {
    type: String, // HH:MM format
  },
  markedBy: {
    type: String,
    enum: ['FaceRecognition', 'Manual'],
    default: 'FaceRecognition',
  },
  confidence: Number, // Confidence score for face recognition
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ adminId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

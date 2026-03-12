const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Twilio only if credentials are available
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Send notifications to absent students' parents
router.post('/send-absent-notifications', auth, async (req, res) => {
  try {
    if (!client) {
      return res.status(400).json({ 
        message: 'Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env' 
      });
    }

    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date required' });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get absent students for this date
    const absentRecords = await Attendance.find({
      adminId: req.adminId,
      date: { $gte: startDate, $lt: endDate },
      status: 'Absent',
    }).populate('studentId');

    const notifications = [];

    for (const record of absentRecords) {
      const student = record.studentId;
      const message = `Dear Parent, Your child ${student.name} (Roll: ${student.rollNumber}) was absent today in college.`;

      try {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: student.parentPhone,
        });

        notifications.push({
          studentId: student._id,
          studentName: student.name,
          parentPhone: student.parentPhone,
          status: 'sent',
        });
      } catch (error) {
        notifications.push({
          studentId: student._id,
          studentName: student.name,
          parentPhone: student.parentPhone,
          status: 'failed',
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Notifications sent',
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

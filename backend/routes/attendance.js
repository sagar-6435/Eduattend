const express = require('express');
const axios = require('axios');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Scan attendance (face recognition)
router.post('/scan', auth, async (req, res) => {
  try {
    const { classroomImage, date } = req.body;

    if (!classroomImage) {
      return res.status(400).json({ message: 'Classroom image required' });
    }

    // Send image to AI service for face recognition
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/recognize`, {
      image: classroomImage,
    });

    const { detectedFaces } = aiResponse.data;

    // Get all students for this admin
    const students = await Student.find({ adminId: req.adminId, isActive: true });

    // Mark attendance for matched students
    const attendanceRecords = [];
    const markedStudentIds = new Set();

    for (const detectedFace of detectedFaces) {
      // Find matching student
      const matchedStudent = students.find(
        s => s._id.toString() === detectedFace.studentId
      );

      if (matchedStudent) {
        markedStudentIds.add(matchedStudent._id.toString());

        const attendance = new Attendance({
          studentId: matchedStudent._id,
          adminId: req.adminId,
          date: new Date(date),
          status: 'Present',
          markedBy: 'FaceRecognition',
          confidence: detectedFace.confidence,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
        });

        await attendance.save();
        attendanceRecords.push(attendance);
      }
    }

    // Mark remaining students as absent
    const absentStudents = students.filter(
      s => !markedStudentIds.has(s._id.toString())
    );

    for (const student of absentStudents) {
      const attendance = new Attendance({
        studentId: student._id,
        adminId: req.adminId,
        date: new Date(date),
        status: 'Absent',
        markedBy: 'FaceRecognition',
        time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
      });

      await attendance.save();
      attendanceRecords.push(attendance);
    }

    res.json({
      message: 'Attendance marked successfully',
      presentCount: markedStudentIds.size,
      absentCount: absentStudents.length,
      records: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manual attendance
router.post('/manual', auth, async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({ message: 'Student ID, date, and status required' });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      studentId,
      date: new Date(date),
    });

    if (existingAttendance) {
      existingAttendance.status = status;
      existingAttendance.markedBy = 'Manual';
      await existingAttendance.save();
      return res.json({
        message: 'Attendance updated successfully',
        attendance: existingAttendance,
      });
    }

    const attendance = new Attendance({
      studentId,
      adminId: req.adminId,
      date: new Date(date),
      status,
      markedBy: 'Manual',
      time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const attendance = await Attendance.find({
      adminId: req.adminId,
      date: { $gte: date, $lt: nextDate },
    }).populate('studentId');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      studentId: req.params.studentId,
      adminId: req.adminId,
    }).sort({ date: -1 });

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      attendance,
      stats: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly report
router.get('/report/monthly/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      adminId: req.adminId,
      date: { $gte: startDate, $lte: endDate },
    }).populate('studentId');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

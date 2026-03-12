const express = require('express');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Add student
router.post('/add', auth, async (req, res) => {
  try {
    const { name, rollNumber, parentPhone, department, faceEncoding } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const student = new Student({
      name,
      rollNumber,
      parentPhone,
      department,
      faceEncoding,
      adminId: req.adminId,
    });

    await student.save();

    res.status(201).json({
      message: 'Student added successfully',
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find({ adminId: req.adminId, isActive: true });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { name, parentPhone, department, faceEncoding } = req.body;

    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    if (name) student.name = name;
    if (parentPhone) student.parentPhone = parentPhone;
    if (department) student.department = department;
    if (faceEncoding) student.faceEncoding = faceEncoding;
    student.updatedAt = Date.now();

    await student.save();

    res.json({
      message: 'Student updated successfully',
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student (soft delete)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

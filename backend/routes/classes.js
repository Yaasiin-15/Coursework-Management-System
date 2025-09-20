const express = require('express');
const Class = require('../models/Class');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', auth, async (req, res) => {
  try {
    let classes;

    if (req.user.role === 'admin') {
      classes = await Class.find()
        .populate('teacher', 'name email')
        .populate('students', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'teacher') {
      classes = await Class.find({ teacher: req.user._id })
        .populate('teacher', 'name email')
        .populate('students', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Students see only their class
      classes = await Class.find({ students: req.user._id })
        .populate('teacher', 'name email')
        .populate('students', 'name email');
    }

    res.json({
      success: true,
      classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create class (teacher/admin only)
router.post('/', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { name, description, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    // Check if class code already exists
    const existingClass = await Class.findOne({ code: code.toUpperCase() });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class code already exists'
      });
    }

    const newClass = new Class({
      name,
      description,
      code: code.toUpperCase(),
      teacher: req.user._id
    });

    await newClass.save();
    await newClass.populate('teacher', 'name email');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get class by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student') {
      const isEnrolled = classItem.students.some(
        student => student._id.toString() === req.user._id.toString()
      );
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'teacher') {
      if (classItem.teacher._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      class: classItem
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add student to class
router.post('/:id/students', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.body;

    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if teacher owns this class (unless admin)
    if (req.user.role === 'teacher' && classItem.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    // Check if student is already in class
    if (classItem.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student already enrolled in this class'
      });
    }

    classItem.students.push(studentId);
    await classItem.save();

    // Update student's classId
    await User.findByIdAndUpdate(studentId, { classId: classItem._id });

    res.json({
      success: true,
      message: 'Student added to class successfully'
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
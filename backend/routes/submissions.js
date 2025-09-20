const express = require('express');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get submissions for an assignment
router.get('/assignment/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    let submissions;

    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      // Teachers and admins can see all submissions for the assignment
      submissions = await Submission.find({ assignmentId: req.params.assignmentId })
        .populate('studentId', 'name email')
        .populate('gradedBy', 'name email')
        .sort({ submittedAt: -1 });
    } else {
      // Students can only see their own submission
      submissions = await Submission.find({
        assignmentId: req.params.assignmentId,
        studentId: req.user._id
      })
      .populate('gradedBy', 'name email');
    }

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit assignment (students only)
router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { assignmentId, fileUrl, fileName } = req.body;

    if (!assignmentId || !fileUrl || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID, file URL, and file name are required'
      });
    }

    // Check if assignment exists and is accessible
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.classId.toString() !== req.user.classId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Submission already exists for this assignment'
      });
    }

    // Check if deadline has passed
    const now = new Date();
    const isLate = now > assignment.deadline;

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Submission deadline has passed'
      });
    }

    const submission = new Submission({
      assignmentId,
      studentId: req.user._id,
      fileUrl,
      fileName,
      status: isLate ? 'late' : 'submitted'
    });

    await submission.save();
    await submission.populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Grade submission (teacher/admin only)
router.put('/:id/grade', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { marks, feedback } = req.body;

    if (marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Marks are required'
      });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if marks are within valid range
    if (marks < 0 || marks > submission.assignmentId.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${submission.assignmentId.maxMarks}`
      });
    }

    // Check if teacher has access to this submission
    if (req.user.role === 'teacher' && 
        submission.assignmentId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    await submission.save();
    await submission.populate('studentId', 'name email');
    await submission.populate('gradedBy', 'name email');

    res.json({
      success: true,
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get submission by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title maxMarks')
      .populate('gradedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student' && 
        submission.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
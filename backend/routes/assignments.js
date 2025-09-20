const express = require('express');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all assignments
router.get('/', auth, async (req, res) => {
  try {
    let assignments;

    if (req.user.role === 'admin') {
      assignments = await Assignment.find()
        .populate('createdBy', 'name email')
        .populate('classId', 'name code')
        .sort({ deadline: 1 });
    } else if (req.user.role === 'teacher') {
      assignments = await Assignment.find({ createdBy: req.user._id })
        .populate('createdBy', 'name email')
        .populate('classId', 'name code')
        .sort({ deadline: 1 });
    } else {
      // Students see assignments for their class
      assignments = await Assignment.find({ classId: req.user.classId })
        .populate('createdBy', 'name email')
        .populate('classId', 'name code')
        .sort({ deadline: 1 });
    }

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create assignment (teacher/admin only)
router.post('/', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      maxMarks,
      deadline,
      classId,
      instructions,
      submissionFormat,
      allowLateSubmission
    } = req.body;

    if (!title || !description || !maxMarks || !deadline || !classId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if class exists and user has access
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (req.user.role === 'teacher' && classItem.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const assignment = new Assignment({
      title,
      description,
      maxMarks,
      deadline: new Date(deadline),
      classId,
      createdBy: req.user._id,
      instructions,
      submissionFormat: submissionFormat || 'file',
      allowLateSubmission: allowLateSubmission || false
    });

    await assignment.save();
    await assignment.populate('createdBy', 'name email');
    await assignment.populate('classId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get assignment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('classId', 'name code');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student') {
      if (assignment.classId._id.toString() !== req.user.classId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'teacher') {
      if (assignment.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update assignment
router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if teacher owns this assignment (unless admin)
    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'maxMarks', 'deadline', 
      'instructions', 'submissionFormat', 'allowLateSubmission'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('classId', 'name code');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete assignment
router.delete('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if teacher owns this assignment (unless admin)
    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
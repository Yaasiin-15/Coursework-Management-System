const express = require('express');
const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    let filter = {};
    
    // Teachers only see their own data
    if (req.user.role === 'teacher') {
      const teacherClasses = await Class.find({ teacher: req.user._id });
      const classIds = teacherClasses.map(c => c._id);
      filter.classId = { $in: classIds };
    }

    // Get basic counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClasses = await Class.countDocuments(req.user.role === 'teacher' ? { teacher: req.user._id } : {});
    const totalAssignments = await Assignment.countDocuments(filter);
    const totalSubmissions = await Submission.countDocuments();

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title')
      .sort({ submittedAt: -1 })
      .limit(10);

    // Get grade distribution
    const gradeStats = await Submission.aggregate([
      { $match: { status: 'graded' } },
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignmentId',
          foreignField: '_id',
          as: 'assignment'
        }
      },
      { $unwind: '$assignment' },
      {
        $addFields: {
          percentage: {
            $multiply: [
              { $divide: ['$marks', '$assignment.maxMarks'] },
              100
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$percentage',
          boundaries: [0, 60, 70, 80, 90, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            avgScore: { $avg: '$percentage' }
          }
        }
      }
    ]);

    // Get assignment completion rates
    const assignmentStats = await Assignment.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'assignmentId',
          as: 'submissions'
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      { $unwind: '$class' },
      {
        $addFields: {
          totalStudents: { $size: '$class.students' },
          submissionCount: { $size: '$submissions' },
          completionRate: {
            $cond: {
              if: { $eq: [{ $size: '$class.students' }, 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: [{ $size: '$submissions' }, { $size: '$class.students' }] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          title: 1,
          deadline: 1,
          totalStudents: 1,
          submissionCount: 1,
          completionRate: 1
        }
      },
      { $sort: { deadline: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalStudents,
          totalClasses,
          totalAssignments,
          totalSubmissions
        },
        recentSubmissions,
        gradeDistribution: gradeStats,
        assignmentStats
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get student performance analytics
router.get('/students/:studentId', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Get student info
    const student = await User.findById(studentId).select('-passwordHash');
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's submissions with assignment details
    const submissions = await Submission.find({ studentId })
      .populate('assignmentId', 'title maxMarks deadline')
      .sort({ submittedAt: -1 });

    // Calculate performance metrics
    const gradedSubmissions = submissions.filter(s => s.status === 'graded');
    const totalSubmissions = submissions.length;
    const avgScore = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, s) => sum + (s.marks / s.assignmentId.maxMarks * 100), 0) / gradedSubmissions.length
      : 0;

    // Get submission timeline
    const submissionTimeline = submissions.map(s => ({
      date: s.submittedAt,
      assignment: s.assignmentId.title,
      score: s.marks ? (s.marks / s.assignmentId.maxMarks * 100) : null,
      status: s.status
    }));

    // Get late submissions count
    const lateSubmissions = submissions.filter(s => s.status === 'late').length;

    res.json({
      success: true,
      analytics: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email
        },
        performance: {
          totalSubmissions,
          gradedSubmissions: gradedSubmissions.length,
          avgScore: Math.round(avgScore * 100) / 100,
          lateSubmissions,
          onTimeRate: totalSubmissions > 0 ? ((totalSubmissions - lateSubmissions) / totalSubmissions * 100) : 0
        },
        submissionTimeline
      }
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
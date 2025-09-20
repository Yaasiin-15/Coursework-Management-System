const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: [true, 'Role is required'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    assignmentReminders: { type: Boolean, default: true },
    gradeNotifications: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: false }
  },
  preferences: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'system' }
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: function () {
      return this.role === 'student';
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
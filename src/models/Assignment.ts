import mongoose from 'mongoose'

export interface IAssignment extends mongoose.Document {
  title: string
  description: string
  course: string
  deadline: Date
  maxMarks: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema)
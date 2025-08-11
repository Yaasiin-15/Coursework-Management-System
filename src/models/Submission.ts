import mongoose from 'mongoose'

export interface ISubmission extends mongoose.Document {
  assignmentId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  fileUrl: string
  fileName: string
  marks?: number
  feedback?: string
  submittedAt: Date
  gradedAt?: Date
  gradedBy?: mongoose.Types.ObjectId
  status: 'submitted' | 'graded' | 'late'
  plagiarismCheck?: {
    similarity: number
    matches: Array<{
      text: string
      startIndex: number
      endIndex: number
      matchedWith: string
    }>
    report: string
    checkedAt: Date
    checkedBy: mongoose.Types.ObjectId
  }
}

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
  },
  marks: {
    type: Number,
    min: 0,
  },
  feedback: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: {
    type: Date,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted',
  },
  plagiarismCheck: {
    similarity: {
      type: Number,
      min: 0,
      max: 1,
    },
    matches: [{
      text: String,
      startIndex: Number,
      endIndex: Number,
      matchedWith: String,
    }],
    report: String,
    checkedAt: Date,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
}, {
  timestamps: true,
})

// Compound index to ensure one submission per student per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)
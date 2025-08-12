import mongoose from 'mongoose'

export interface IClass extends mongoose.Document {
  name: string
  code: string
  description?: string
  teacher: mongoose.Types.ObjectId
  students: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Class code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
})

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema)
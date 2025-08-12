import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  passwordHash: string
  classId?: mongoose.Types.ObjectId // For students - which class they belong to
  createdAt: Date
  updatedAt: Date
}

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
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: function(this: IUser) {
      return this.role === 'student'
    },
  },
}, {
  timestamps: true,
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
const mongoose = require('mongoose')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coursework-management'

// Class schema (simplified for seeding)
const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema)

// User schema (simplified for seeding)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  passwordHash: String,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function seedClasses() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if we already have classes
    const existingClasses = await Class.countDocuments()
    if (existingClasses > 0) {
      console.log(`Found ${existingClasses} existing classes. Skipping seed.`)
      return
    }

    // Find or create a teacher user for the classes
    let teacher = await User.findOne({ role: 'teacher' })
    
    if (!teacher) {
      // Create a sample teacher if none exists
      const bcrypt = require('bcryptjs')
      const passwordHash = await bcrypt.hash('teacher123', 12)
      
      teacher = new User({
        name: 'Sample Teacher',
        email: 'teacher@example.com',
        role: 'teacher',
        passwordHash
      })
      await teacher.save()
      console.log('Created sample teacher')
    }

    // Sample classes to create
    const sampleClasses = [
      {
        name: 'Computer Science 101',
        code: 'CS101',
        description: 'Introduction to Computer Science',
        teacher: teacher._id,
        students: []
      },
      {
        name: 'Mathematics 201',
        code: 'MATH201',
        description: 'Advanced Mathematics',
        teacher: teacher._id,
        students: []
      },
      {
        name: 'Physics 101',
        code: 'PHYS101',
        description: 'Introduction to Physics',
        teacher: teacher._id,
        students: []
      },
      {
        name: 'English Literature',
        code: 'ENG101',
        description: 'English Literature and Composition',
        teacher: teacher._id,
        students: []
      }
    ]

    // Create the classes
    for (const classData of sampleClasses) {
      const newClass = new Class(classData)
      await newClass.save()
      console.log(`Created class: ${classData.name} (${classData.code})`)
    }

    console.log('Successfully seeded classes!')
    
  } catch (error) {
    console.error('Error seeding classes:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedClasses()
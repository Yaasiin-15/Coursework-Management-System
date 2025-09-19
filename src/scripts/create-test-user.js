const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coursework-management'
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

// User schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  passwordHash: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

// Class schema
const ClassSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema)

async function createTestUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if test user already exists
    let testUser = await User.findOne({ email: 'test@example.com' })
    
    if (!testUser) {
      // Create a test user
      const passwordHash = await bcrypt.hash('password123', 12)
      
      // Get a class for the student
      const classDoc = await Class.findOne()
      
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        passwordHash,
        classId: classDoc ? classDoc._id : null
      })
      await testUser.save()
      console.log('Created test user')
    } else {
      console.log('Test user already exists')
    }

    // Generate a token
    const token = jwt.sign({
      userId: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role,
    }, JWT_SECRET, { expiresIn: '7d' })

    console.log('\n=== Test User Info ===')
    console.log('Email:', testUser.email)
    console.log('Password: password123')
    console.log('Role:', testUser.role)
    console.log('Token:', token)
    console.log('\nYou can use this token to test the API endpoints.')
    
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createTestUser()

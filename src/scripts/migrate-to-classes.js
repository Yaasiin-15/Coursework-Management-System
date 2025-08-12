// Migration script to transition existing data to class-based system
// Run this script after deploying the new class system

const mongoose = require('mongoose')

// Import models (adjust paths as needed)
const User = require('../models/User')
const Assignment = require('../models/Assignment')
const Class = require('../models/Class')

async function migrateToClasses() {
  try {
    console.log('Starting migration to class-based system...')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coursework-management')

    // Step 1: Create a default class for each teacher
    const teachers = await User.find({ role: 'teacher' })
    
    for (const teacher of teachers) {
      // Check if teacher already has a class
      const existingClass = await Class.findOne({ teacher: teacher._id })
      
      if (!existingClass) {
        // Create a default class for this teacher
        const defaultClass = new Class({
          name: `${teacher.name}'s Class`,
          code: `${teacher.name.replace(/\s+/g, '').toUpperCase().substring(0, 6)}01`,
          description: `Default class for ${teacher.name}`,
          teacher: teacher._id,
          students: []
        })
        
        await defaultClass.save()
        console.log(`Created default class for teacher: ${teacher.name}`)

        // Step 2: Update all assignments created by this teacher to belong to their default class
        await Assignment.updateMany(
          { createdBy: teacher._id, classId: { $exists: false } },
          { classId: defaultClass._id }
        )
        console.log(`Updated assignments for teacher: ${teacher.name}`)
      }
    }

    // Step 3: Handle students without classes
    const studentsWithoutClass = await User.find({ 
      role: 'student', 
      classId: { $exists: false } 
    })

    if (studentsWithoutClass.length > 0) {
      console.log(`Found ${studentsWithoutClass.length} students without classes`)
      console.log('These students need to be manually assigned to classes by teachers/admins')
      
      // Optionally create a "Unassigned Students" class
      const unassignedClass = await Class.findOne({ code: 'UNASSIGNED' })
      
      if (!unassignedClass && studentsWithoutClass.length > 0) {
        // Find an admin to own the unassigned class
        const admin = await User.findOne({ role: 'admin' })
        
        if (admin) {
          const newUnassignedClass = new Class({
            name: 'Unassigned Students',
            code: 'UNASSIGNED',
            description: 'Temporary class for students awaiting assignment',
            teacher: admin._id,
            students: studentsWithoutClass.map(s => s._id)
          })
          
          await newUnassignedClass.save()
          
          // Update all unassigned students
          await User.updateMany(
            { role: 'student', classId: { $exists: false } },
            { classId: newUnassignedClass._id }
          )
          
          console.log('Created "Unassigned Students" class and moved unassigned students there')
        }
      }
    }

    console.log('Migration completed successfully!')
    
    // Print summary
    const totalClasses = await Class.countDocuments()
    const totalStudentsWithClasses = await User.countDocuments({ 
      role: 'student', 
      classId: { $exists: true } 
    })
    const totalAssignmentsWithClasses = await Assignment.countDocuments({ 
      classId: { $exists: true } 
    })
    
    console.log('\nMigration Summary:')
    console.log(`- Total classes created: ${totalClasses}`)
    console.log(`- Students with classes: ${totalStudentsWithClasses}`)
    console.log(`- Assignments with classes: ${totalAssignmentsWithClasses}`)

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToClasses()
}

module.exports = migrateToClasses
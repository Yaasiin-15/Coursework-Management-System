import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'

export async function GET() {
  try {
    await dbConnect()
    
    // Fetch all classes for registration purposes
    const classes = await Class.find()
      .select('_id name description code')
      .populate('teacher', 'name')
      .sort({ name: 1 })

    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching public classes:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
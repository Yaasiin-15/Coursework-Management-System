import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'teacher' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized - Teacher access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 })
    }

    // Security: Ensure the file path is within the uploads directory
    const uploadsDir = join(process.cwd(), 'uploads')
    const fullPath = join(uploadsDir, filePath)
    
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    try {
      const fileBuffer = await readFile(fullPath)
      const fileName = filePath.split('/').pop() || 'download'
      
      return new NextResponse(fileBuffer as BodyInit, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'application/octet-stream',
        },
      })
    } catch (fileError) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const filename = params.filename
    const filePath = path.join(process.cwd(), 'uploads', filename)

    try {
      const fileBuffer = await readFile(filePath)
      
      // Get file extension to set appropriate content type
      const ext = path.extname(filename).toLowerCase()
      let contentType = 'application/octet-stream'
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf'
          break
        case '.doc':
          contentType = 'application/msword'
          break
        case '.docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          break
        case '.txt':
          contentType = 'text/plain'
          break
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg'
          break
        case '.png':
          contentType = 'image/png'
          break
      }

      return new NextResponse(fileBuffer as BodyInit, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } catch (fileError) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
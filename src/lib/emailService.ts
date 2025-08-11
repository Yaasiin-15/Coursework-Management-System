import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Coursework Management System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      })

      console.log('Email sent:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async sendAssignmentNotification(studentEmail: string, studentName: string, assignment: any) {
    const subject = `New Assignment: ${assignment.title}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Assignment Available</h2>
        <p>Hello ${studentName},</p>
        <p>A new assignment has been posted:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${assignment.title}</h3>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${assignment.course}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(assignment.deadline).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Max Marks:</strong> ${assignment.maxMarks}</p>
        </div>
        
        <p><strong>Description:</strong></p>
        <p>${assignment.description}</p>
        
        <p>Please log in to the system to view the full assignment details and submit your work.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from the Coursework Management System.
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: studentEmail,
      subject,
      html,
      text: `New Assignment: ${assignment.title}\n\nCourse: ${assignment.course}\nDue Date: ${new Date(assignment.deadline).toLocaleDateString()}\nMax Marks: ${assignment.maxMarks}\n\nDescription: ${assignment.description}`
    })
  }

  async sendGradeNotification(studentEmail: string, studentName: string, assignment: any, submission: any) {
    const subject = `Grade Available: ${assignment.title}`
    const percentage = ((submission.marks / assignment.maxMarks) * 100).toFixed(1)
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Grade Available</h2>
        <p>Hello ${studentName},</p>
        <p>Your assignment has been graded:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${assignment.title}</h3>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${assignment.course}</p>
          <p style="margin: 5px 0;"><strong>Your Score:</strong> ${submission.marks}/${assignment.maxMarks} (${percentage}%)</p>
        </div>
        
        ${submission.feedback ? `
          <p><strong>Feedback:</strong></p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;">${submission.feedback}</p>
          </div>
        ` : ''}
        
        <p>Please log in to the system to view your detailed results.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from the Coursework Management System.
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: studentEmail,
      subject,
      html,
      text: `Grade Available: ${assignment.title}\n\nCourse: ${assignment.course}\nYour Score: ${submission.marks}/${assignment.maxMarks} (${percentage}%)\n\n${submission.feedback ? `Feedback: ${submission.feedback}` : ''}`
    })
  }

  async sendDueDateReminder(studentEmail: string, studentName: string, assignment: any, daysUntilDue: number) {
    const subject = `Reminder: ${assignment.title} due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day(s)`}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Assignment Due Date Reminder</h2>
        <p>Hello ${studentName},</p>
        <p>This is a reminder that the following assignment is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day(s)`}:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${assignment.title}</h3>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${assignment.course}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(assignment.deadline).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Max Marks:</strong> ${assignment.maxMarks}</p>
        </div>
        
        <p>Please ensure you submit your work before the deadline to avoid late penalties.</p>
        <p>Log in to the system to submit your assignment.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from the Coursework Management System.
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: studentEmail,
      subject,
      html,
      text: `Assignment Due Date Reminder\n\n${assignment.title}\nCourse: ${assignment.course}\nDue Date: ${new Date(assignment.deadline).toLocaleDateString()}\n\nPlease submit your work before the deadline.`
    })
  }
}

export const emailService = new EmailService()
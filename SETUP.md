# Setup Guide for Coursework Management System

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/coursework-management

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📧 Email Setup (Optional)

To enable email notifications:

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate an app password
   - Use the app password in `SMTP_PASS`

2. **Other Email Providers:**
   - Update `SMTP_HOST` and `SMTP_PORT` accordingly
   - Provide appropriate credentials

## 🎯 Testing Features

Visit `/test-features` to test all implemented features:
- Dark/Light theme toggle
- Notification system
- Analytics dashboard
- Bulk operations
- Grading interface

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Feature Configuration

### Theme System
- Automatic system preference detection
- Manual toggle available
- Persistent theme selection

### Notifications
- Real-time notifications
- Email integration
- Due date reminders

### Analytics
- Performance charts
- Grade distribution
- Trend analysis
- Top performers

### Bulk Operations
- Multi-assignment selection
- Bulk downloads (ZIP)
- Email reminders
- Batch deletion

### Grading Interface
- File downloads
- Inline grading
- Feedback system
- Progress tracking

### Plagiarism Detection
- Text similarity analysis
- Common phrase detection
- Risk level assessment
- Detailed reports

## 🛠️ Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
├── components/            # React components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
├── models/              # Database models
└── types/               # TypeScript types
```

### Key Components
- `DashboardLayout` - Main layout wrapper
- `ThemeContext` - Theme management
- `NotificationContext` - Notification system
- `GradingInterface` - Comprehensive grading
- `AnalyticsDashboard` - Performance analytics
- `BulkOperations` - Batch operations

### API Routes
- `/api/assignments/*` - Assignment management
- `/api/submissions/*` - Submission handling
- `/api/analytics` - Performance data
- `/api/files/*` - File operations

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env.local`

2. **Email Not Working**
   - Verify SMTP credentials
   - Check firewall settings
   - Ensure app passwords are used for Gmail

3. **File Upload Issues**
   - Check `uploads/` directory permissions
   - Verify file size limits

4. **Theme Not Persisting**
   - Clear browser localStorage
   - Check for JavaScript errors

## 📊 Performance

The application includes:
- Optimized React components
- Lazy loading for large datasets
- Efficient database queries
- Compressed file downloads
- Responsive image handling

## 🔒 Security

Security features implemented:
- JWT authentication
- File path validation
- Input sanitization
- CORS protection
- Rate limiting ready

## 📈 Scaling

For production deployment:
- Use MongoDB Atlas for database
- Configure proper SMTP service
- Set up file storage (AWS S3, etc.)
- Enable caching
- Configure CDN for assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
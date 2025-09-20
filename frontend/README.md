# Coursework Management Frontend

A modern Next.js frontend for the coursework management system.

## Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Dark/Light Theme**: Toggle between themes with system preference support
- **Role-based Interface**: Different views for students, teachers, and admins
- **Real-time Notifications**: Toast notifications and notification panel
- **Analytics Dashboard**: Performance charts and statistics
- **File Management**: Upload and download assignment files
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your backend API URL
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend URL (for development)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── analytics/         # Analytics pages
│   │   ├── assignments/       # Assignment management
│   │   ├── classes/           # Class management
│   │   ├── dashboard/         # Main dashboard
│   │   ├── grades/            # Grade management
│   │   ├── login/             # Authentication
│   │   ├── register/          # User registration
│   │   ├── settings/          # User settings
│   │   └── test-features/     # Feature testing
│   ├── components/            # Reusable UI components
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── GradingInterface.tsx
│   │   ├── Navbar.tsx
│   │   ├── NotificationPanel.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/              # React Context providers
│   │   ├── AppProvider.tsx
│   │   ├── LanguageContext.tsx
│   │   ├── NotificationContext.tsx
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useGrades.ts
│   │   └── useTranslations.ts
│   └── lib/                   # Utility functions
│       ├── api.ts             # API client
│       ├── auth.ts            # Authentication utilities
│       └── translations.ts    # Internationalization
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Features

### Authentication
- JWT token-based authentication
- Role-based access control (Student, Teacher, Admin)
- Persistent login state
- Secure token storage

### Dashboard
- Role-specific dashboards
- Real-time data updates
- Performance metrics
- Quick actions

### Assignment Management
- Create and manage assignments
- File upload/download
- Deadline tracking
- Bulk operations

### Grading System
- Comprehensive grading interface
- Feedback system
- Grade analytics
- Export capabilities

### Analytics
- Student performance tracking
- Class statistics
- Assignment completion rates
- Grade distribution charts

### Notifications
- Real-time toast notifications
- Notification panel
- Email integration
- Customizable settings

### Theming
- Dark/Light mode toggle
- System preference detection
- Persistent theme selection
- Smooth transitions

## API Integration

The frontend communicates with the backend API using a centralized API client (`src/lib/api.ts`). All API calls are authenticated using JWT tokens stored in localStorage.

### API Client Usage

```typescript
import { get, post, put, del } from '@/lib/api'

// GET request
const response = await get('/assignments')

// POST request
const response = await post('/assignments', {
  title: 'New Assignment',
  description: 'Assignment description'
})

// PUT request
const response = await put('/assignments/123', updateData)

// DELETE request
const response = await del('/assignments/123')
```

## Development

### Adding New Pages
1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Implement the page component
4. Add navigation links if needed

### Adding New Components
1. Create component in `src/components/`
2. Use TypeScript for type safety
3. Follow the existing naming conventions
4. Add proper props interfaces

### Styling Guidelines
- Use Tailwind CSS classes
- Follow the existing color scheme
- Ensure dark mode compatibility
- Maintain responsive design

### State Management
- Use React Context for global state
- Keep component state local when possible
- Use custom hooks for complex logic

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

The frontend can be deployed to various platforms:

- **Vercel**: Automatic deployment with Git integration
- **Netlify**: Static site hosting with serverless functions
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Docker**: Containerized deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized bundle size
- Code splitting
- Image optimization
- Lazy loading
- Caching strategies
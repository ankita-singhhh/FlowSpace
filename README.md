# FlowSpace - Productivity Management System

A comprehensive productivity management application that helps users organize tasks, habits, notes, reminders, and track their progress with analytics. Built as a Progressive Web App (PWA) for seamless mobile experience.

## 🚀 Features

### Core Functionality
- **Task Management**: Create, organize, and track tasks with priorities and categories
- **Habit Tracking**: Build and maintain daily habits with streak tracking and GitHub-style heatmap
- **Note Taking**: Quick note-taking with markdown support, tagging, and pinning
- **Reminders**: Set and manage time-based reminders with recurring support
- **Analytics Dashboard**: Visualize productivity patterns with interactive charts
- **Weekly Planner**: Drag-and-drop task scheduling across the week
- **AI Chatbot**: Integrated AI assistant for productivity help (Anthropic/Gemini)

### User Experience
- **Authentication**: Secure user authentication with JWT tokens
- **Responsive Design**: Modern UI that works on all devices (mobile, tablet, desktop)
- **Dark Mode**: Full dark theme support with system preference detection
- **Real-time Updates**: WebSocket support for live data synchronization
- **PWA Support**: Install as a native app on mobile devices
- **Offline Mode**: Service worker for offline functionality

### UI/UX Enhancements
- **Smooth Animations**: Framer Motion for page transitions and micro-interactions
- **Confetti Effects**: Celebratory animations for task completion
- **Skeleton Loaders**: Professional loading states for all data lists
- **Custom Empty States**: Beautiful SVG illustrations for empty states
- **Toast Notifications**: Global toast system for user feedback
- **Mobile Bottom Navigation**: Easy navigation on mobile devices

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Zod** - Runtime type validation

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (for production)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FlowSpace
```

### 2. Backend Setup
```bash
cd flowspace-backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/flowspace?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd flowspace-frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🧪 Testing

### Backend Tests
```bash
cd flowspace-backend
npm test
```

### Frontend Tests
```bash
cd flowspace-frontend
npm test
```

### Linting
```bash
# Frontend
cd flowspace-frontend
npm run lint

# Backend (add ESLint if needed)
cd flowspace-backend
npm run lint
```

## 📁 Project Structure

```
FlowSpace/
├── flowspace-backend/
│   ├── config/          # Database configuration
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── tests/           # Backend tests
├── flowspace-frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── test/          # Frontend tests
│   └── public/           # Static assets
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Frontend URL for CORS

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status

### Habits
- `GET /api/habits` - Get all user habits
- `POST /api/habits` - Create new habit
- `PATCH /api/habits/:id/check` - Check in to habit

### Notes
- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Reminders
- `GET /api/reminders` - Get all user reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Analytics
- `GET /api/analytics/summary` - Get productivity summary
- `GET /api/analytics/streaks` - Get habit streaks

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet
- Input validation with Zod
- MongoDB connection security

## 🚀 Deployment

### Quick Start
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Production Build
```bash
# Frontend
cd flowspace-frontend
npm run build

# Backend (no build needed, Node.js directly)
cd flowspace-backend
npm start
```

### Environment Setup
- Set production MongoDB Atlas connection
- Use secure JWT secret
- Configure production CORS origins
- Set up proper environment variables

### PWA Icons Required
Add these icons to `flowspace-frontend/public/`:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

### Deployment Options
1. **Vercel (Frontend) + Render/Railway (Backend)** - Recommended for easy deployment
2. **Single Server** - Build frontend and serve with backend
3. **Docker** - Containerized deployment with docker-compose

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please open an issue in the repository.

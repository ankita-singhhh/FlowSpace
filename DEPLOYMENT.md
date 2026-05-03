# FlowSpace Deployment Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or cloud)
- Git

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowspace
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:5173
NODE_ENV=production

# AI API Keys (optional)
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Quick Start

### Option 1: Vercel (Frontend) + Render (Backend) - Recommended

#### Backend Deployment (Render)
1. Go to [Render Dashboard](https://render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `https://github.com/ankita-singhhh/FlowSpace.git`
4. Set environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secure random string
   - `CLIENT_URL` - Your Render URL
   - `NODE_ENV` - `production`
5. Deploy

#### Frontend Deployment (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/)
2. Click "Add New Project" → "Import Git Repository"
3. Enter: `https://github.com/ankita-singhhh/FlowSpace.git`
4. Set environment variable: `VITE_API_URL=your-render-backend-url`
5. Deploy

### Option 2: Single Server Deployment

```bash
# Build frontend
cd flowspace-frontend
npm run build

# Serve from backend
cd flowspace-backend
cp -r ../flowspace-frontend/dist public
npm install
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/flowspace
JWT_SECRET=your-secure-jwt-secret
CLIENT_URL=your-production-url
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=your-backend-url
```

## 📋 Pre-Deployment Checklist

- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] MongoDB Atlas connection working
- [ ] Frontend builds successfully
- [ ] All API endpoints tested
- [ ] PWA icons added (optional)

## 🌐 Live URLs

After deployment:
- **Frontend**: Your Vercel URL
- **Backend**: Your Render URL
- **MongoDB**: Atlas Dashboard

## 📞 Support

For issues:
- Check environment variables
- Verify MongoDB connection
- Review deployment logs
- Check API endpoints development team

## PWA Setup

### Add Icons
Add the following icons to `flowspace-frontend/public/`:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

### Test PWA
1. Open app in Chrome/Edge
2. Check DevTools > Application > Service Workers
3. Verify service worker is registered
4. Test offline mode in DevTools > Network > Offline

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS in production
- [ ] Set up MongoDB authentication
- [ ] Configure CORS to only allow your frontend domain
- [ ] Enable rate limiting on API endpoints
- [ ] Set up database backups
- [ ] Monitor logs and errors

## Performance Optimization

- Enable gzip compression
- Set up CDN for static assets
- Implement database indexing
- Use Redis for caching (optional)
- Enable HTTP/2

## Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor API performance
- Track user analytics (optional)
- Set up uptime monitoring

## Scaling

- Use load balancer for multiple backend instances
- Implement horizontal scaling for MongoDB
- Use Redis for session management
- Consider serverless functions for specific features

## Troubleshooting

### Frontend build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for missing environment variables

### Backend connection issues
- Verify MongoDB connection string
- Check if MongoDB is running
- Verify CORS configuration

### PWA not working
- Verify manifest.json is accessible
- Check service worker registration in console
- Ensure HTTPS is enabled (required for PWA)

## Support

For issues or questions:
- Check GitHub Issues
- Review documentation
- Contact development team

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

## Local Development

### Backend Setup
```bash
cd flowspace-backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd flowspace-frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Production Deployment

### Option 1: Vercel (Frontend) + Render/Railway (Backend)

#### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Create new web service on Render/Railway
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

#### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `VITE_API_URL=your-backend-url`
4. Deploy

### Option 2: Single Server Deployment

#### Build Frontend
```bash
cd flowspace-frontend
npm run build
```

#### Serve with Backend
```bash
cd flowspace-backend
# Copy built frontend to backend/public folder
cp -r ../flowspace-frontend/dist public
npm install
npm start
```

### Option 3: Docker Deployment

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./flowspace-backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/flowspace
      - JWT_SECRET=your-secret
    depends_on:
      - mongo
  
  frontend:
    build: ./flowspace-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

#### Deploy with Docker
```bash
docker-compose up -d
```

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

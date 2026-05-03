# FlowSpace Deployment Checklist

## ✅ Pre-Deployment Verification

### Frontend
- [x] Build works without errors (`npm run build`)
- [x] All imports resolved correctly
- [x] No console errors in development
- [x] Responsive design tested
- [x] Dark mode works
- [x] All pages load correctly

### Backend
- [x] Server starts without errors
- [x] MongoDB connection works
- [x] All API routes registered
- [x] WebSocket server initializes
- [x] CORS configured correctly
- [x] Environment variables loaded

### Features
- [x] Authentication works (register/login)
- [x] Tasks CRUD operations
- [x] Habits CRUD operations
- [x] Notes CRUD operations
- [x] Reminders CRUD operations
- [x] Analytics data fetching
- [x] Real-time notifications
- [x] AI chatbot integration

### PWA
- [x] manifest.json created
- [x] service-worker.js created
- [x] iOS meta tags added
- [x] Install prompt component created
- [ ] **PWA icons added** (icon-192x192.png, icon-512x512.png)

## 📋 Deployment Steps

### 1. Environment Setup
```bash
# Backend
cd flowspace-backend
cp .env.example .env
# Edit .env with production values:
# - MONGODB_URI (production MongoDB)
# - JWT_SECRET (secure random string)
# - CLIENT_URL (production frontend URL)
# - NODE_ENV=production

# Frontend
cd flowspace-frontend
cp .env.example .env
# Edit .env with:
# - VITE_API_URL (production backend URL)
```

### 2. Add PWA Icons
- Add `icon-192x192.png` to `flowspace-frontend/public/`
- Add `icon-512x512.png` to `flowspace-frontend/public/`
- See `PWA_ICONS_README.md` for guidelines

### 3. Build Frontend
```bash
cd flowspace-frontend
npm run build
```

### 4. Choose Deployment Option

#### Option A: Vercel (Frontend) + Render (Backend)
**Frontend (Vercel):**
1. Push code to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

**Backend (Render):**
1. Push code to GitHub
2. Create web service on Render
3. Set all environment variables
4. Deploy

#### Option B: Single Server
```bash
# Build frontend
cd flowspace-frontend
npm run build

# Copy to backend
cd ..
cp -r flowspace-frontend/dist flowspace-backend/public

# Deploy backend
cd flowspace-backend
npm install
npm start
```

#### Option C: Docker
```bash
docker-compose up -d
```

### 5. Post-Deployment Verification
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Authentication works
- [ ] All features functional
- [ ] PWA installable (on mobile)
- [ ] Service worker registered
- [ ] Offline mode works

## 🔒 Security Checklist

- [ ] JWT_SECRET changed from default
- [ ] MongoDB uses authentication
- [ ] CORS allows only production domain
- [ ] Environment variables not committed
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Database backups set up

## 📊 Performance Checklist

- [ ] Frontend build optimized
- [ ] Images compressed
- [ ] CDN configured (optional)
- [ ] Database indexes created
- [ ] Caching enabled (optional)
- [ ] Monitoring set up (optional)

## 🚨 Rollback Plan

If deployment fails:
1. Revert to previous commit
2. Restore database backup
3. Check error logs
4. Fix issues
5. Redeploy

## 📞 Support

For issues:
- Check `DEPLOYMENT.md` for detailed instructions
- Review error logs
- Check environment variables
- Verify MongoDB connection

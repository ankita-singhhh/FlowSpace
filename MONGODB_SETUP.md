# MongoDB Setup for FlowSpace

## 🗄️ MongoDB Atlas Configuration

### 1. Create MongoDB Atlas Account
- Go to: https://www.mongodb.com/atlas
- Sign up for free account
- Create new project: "FlowSpace"

### 2. Create Cluster
- Click "Build a Cluster"
- Select "M0 Sandbox" (FREE)
- Choose cloud provider and region
- Cluster name: "flowspace-cluster"

### 3. Create Database User
- Go to "Database Access" tab
- Click "Add New Database User"
- Username: `flowspace_admin`
- Password: Generate strong password (save it!)
- Permissions: "Read and write to any database"

### 4. Configure Network Access
- Go to "Network Access" tab
- Click "Add IP Address"
- Select "Allow access from anywhere" (0.0.0.0/0)
- This allows Render to connect to your database

### 5. Get Connection String
- Go to "Clusters" tab
- Click "Connect" on your cluster
- Select "Connect your application"
- Driver: Node.js
- Copy the connection string

### 6. Configure Render Environment

Go to your Render service (flowspace-s8sz) and add these environment variables:

```
MONGO_URI=mongodb+srv://flowspace_admin:<YOUR_PASSWORD>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
CLIENT_URL=https://flowspace-s8sz.onrender.com

# Optional: AI API Keys (for enhanced chatbot features)
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### 7. Deploy and Test

After adding environment variables:
- Render will automatically redeploy
- Check the logs to see: "MongoDB Connected: [cluster-host]"
- Test login/register functionality

## 🎯 Expected Results

After setup:
- ✅ Real user registration and login
- ✅ Persistent data storage
- ✅ User profiles and preferences
- ✅ Goals, tasks, and habits saved to database
- ✅ Full application functionality

## 🔍 Troubleshooting

If connection fails:
1. Check MONGO_URI format
2. Verify database user credentials
3. Ensure IP access is configured
4. Check Render logs for specific errors

## 📞 Support

MongoDB Atlas has excellent documentation and 24/7 support for free tier users.

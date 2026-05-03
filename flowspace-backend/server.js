require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const WebSocketServer = require('./websocket');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://flowspaace.netlify.app',
    process.env.CLIENT_URL
  ].filter(Boolean), 
  credentials: true 
}));
app.use(express.json());

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/goals', require('./routes/goals'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FlowSpace API is running' });
});

app.get('/', (req, res) => {
  res.send('FlowSpace Backend is Running 🚀');
});
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP server with WebSocket support
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket server
const wsServer = new WebSocketServer();
wsServer.initialize(server);

// Export WebSocket server for use in routes
module.exports.wsServer = wsServer;

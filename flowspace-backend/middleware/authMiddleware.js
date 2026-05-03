const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple in-memory blacklist for tokens since Redis isn't set up yet
const tokenBlacklist = new Set();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ success: false, message: 'Token has been invalidated. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = user;
    req.token = token; // Make token available for blacklisting
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

const invalidateToken = (token) => {
  tokenBlacklist.add(token);
};

module.exports = { protect, invalidateToken };

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { protect, invalidateToken } = require('../middleware/authMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema, 
  changePasswordSchema, 
  validate 
} = require('../utils/validators');

const router = express.Router();

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Short-lived access token
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// @route   POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if database is available
    if (!process.env.MONGO_URI) {
      // Fallback registration for demo purposes
      console.log('🔧 Using fallback registration (no database)');
      
      // Simple demo registration - accept any user
      const mockUser = {
        _id: 'demo-user-' + Date.now(),
        name: name,
        email: email,
        avatar: null
      };

      // Generate tokens
      const accessToken = generateAccessToken(mockUser._id);
      const refreshTokenStr = generateRefreshToken();

      return res.status(201).json({
        success: true,
        data: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          accessToken,
          refreshToken: refreshTokenStr
        }
      });
    }

    // Database registration
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshTokenStr = generateRefreshToken();
    
    // Store refresh token in MongoDB
    await RefreshToken.create({
      token: refreshTokenStr,
      userId: user._id
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        accessToken,
        refreshToken: refreshTokenStr
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
router.post('/login', loginRateLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if database is available
    if (!process.env.MONGO_URI) {
      // Fallback authentication for demo purposes
      console.log('🔧 Using fallback authentication (no database)');
      
      // Simple demo authentication - accept any email/password
      const mockUser = {
        _id: 'demo-user-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: null
      };

      // Generate tokens
      const accessToken = generateAccessToken(mockUser._id);
      const refreshTokenStr = generateRefreshToken();

      return res.json({
        success: true,
        data: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          accessToken,
          refreshToken: refreshTokenStr
        }
      });
    }

    // Database authentication
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLoginAt = Date.now();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshTokenStr = generateRefreshToken();
    
    // Store refresh token in MongoDB
    await RefreshToken.create({
      token: refreshTokenStr,
      userId: user._id
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settings: user.settings,
        accessToken,
        refreshToken: refreshTokenStr
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/settings
router.put('/settings', protect, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const { name, email, settings } = req.body;
    
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      req.user.email = email;
    }

    if (name) req.user.name = name;
    
    if (settings) {
      req.user.settings = { ...req.user.settings, ...settings };
    }

    await req.user.save();

    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/password
router.put('/password', protect, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // We need to fetch user with password
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/logout
router.post('/logout', protect, async (req, res, next) => {
  try {
    // Delete refresh token from MongoDB
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    
    invalidateToken(req.token);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    // Find refresh token in MongoDB
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    
    if (!tokenDoc) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Check if token is expired
    if (tokenDoc.isExpired()) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    // Get user
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

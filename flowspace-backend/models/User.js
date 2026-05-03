const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  avatar: {
    type: String,
    default: function() {
      // Return initials as fallback if avatar not provided
      if (this.name) {
        return this.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      }
      return 'U';
    }
  },
  lastLoginAt: {
    type: Date,
  },
  settings: {
    defaultReminderTime: {
      type: String,
      default: '09:00',
    },
    weekStartsOn: {
      type: Number,
      default: 1, // 0=Sun, 1=Mon
      min: 0,
      max: 6,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    theme: {
      type: String,
      default: 'dark',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

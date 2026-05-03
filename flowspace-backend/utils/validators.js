const { z } = require('zod');

// Auth Validators
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  settings: z.object({
    defaultReminderTime: z.string().optional(),
    weekStartsOn: z.number().min(0).max(6).optional(),
    timezone: z.string().optional(),
    theme: z.string().optional(),
    notificationsEnabled: z.boolean().optional()
  }).optional()
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'New password must contain at least 1 number'),
});

// Middleware to validate requests
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // replace body with parsed (and potentially stripped/defaulted) data
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  validate
};

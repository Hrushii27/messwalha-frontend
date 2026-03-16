const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

// General Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Auth Rate Limiter (Stricter for login/register)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 attempts per minute
  message: {
    status: 429,
    message: 'Too many authentication attempts, please try again after a minute'
  }
});

// Security Middleware Bundle
const setupSecurity = (app) => {
  // 1. Sanitization against XSS
  app.use(xss());

  // 2. Prevent HTTP Parameter Pollution
  app.use(hpp());

  // 3. Apply general rate limiter to all api routes
  app.use('/api/', generalLimiter);

  // 4. Apply stricter limiter to auth routes
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
};

module.exports = {
  setupSecurity,
  authLimiter
};

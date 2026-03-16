const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createTables } = require('./config/initDb');
const startScheduler = require('./utils/scheduler');

// Routes
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');
const messRoutes = require('./routes/mess');
const adminRoutes = require('./routes/admin');
const favoritesRoutes = require('./routes/favorites');
const notificationsRoutes = require('./routes/notifications');
const userRoutes = require('./routes/user');
const activityRoutes = require('./routes/activity');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const reviewsRoutes = require('./routes/reviews');
const googleAuthRoutes = require('./routes/googleAuth');

const helmet = require('helmet');
const { setupSecurity } = require('./middleware/security');
const authenticateToken = require('./middleware/auth');
const { activityLogger } = require('./middleware/activityLogger');

console.log('🚀 Server starting process...');
const app = express();
const PORT = process.env.PORT || 5000;
console.log('✅ Express initialized. Port:', PORT);

// --- 1. Security Headers (Helmet) ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.google.com", "https://*.gstatic.com", "https://*.razorpay.com", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://*.google.com", "https://recaptcha.google.com", "https://*.razorpay.com", "https://checkout.razorpay.com"],
        connectSrc: ["'self'", "https://*.google.com", "https://*.gstatic.com", "https://api.findmess.me", "https://*.razorpay.com"],
        imgSrc: ["'self'", "data:", "https://*.gstatic.com", "https://*.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);

// --- 2. CORS Configuration ---
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://frontend-one-swart-57.vercel.app",
      "https://findmess.me",
      "https://www.findmess.me"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// --- 3. Custom Security Layer (Rate Limiting, XSS, HPP) ---
setupSecurity(app);

// --- 4. Activity Logger (Monitor failed/suspicious requests) ---
app.use(activityLogger);

// --- 5. Authentication (Soft Auth) ---
app.use(authenticateToken);

// --- 6. Body Parser ---
app.use(express.json({ limit: '10kb' })); 

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] 📡 ${req.method} ${req.url}`);
  next();
});

// --- Diagnostic Routes ---
app.get('/api/ping', (req, res) => res.json({ status: 'OK', message: 'pong', time: new Date() }));

const db = require('./config/db');
app.get('/api/health', async (req, res) => {
  console.log('🔍 Health check requested');
  try {
    const dbResult = await db.query('SELECT NOW()');
    res.json({
      status: 'UP',
      database: 'CONNECTED',
      time: dbResult.rows[0].now
    });
  } catch (err) {
    console.error('❌ Health check DB error:', err);
    res.status(500).json({ status: 'DOWN', database: 'ERROR', message: err.message });
  }
});

// Initialize Database
console.log('🗄️ Initializing database...');
createTables()
  .then(() => console.log('✅ Database initialization attempted'))
  .catch(err => console.error('❌ Database initialization error:', err));

// Start Scheduler
console.log('⏰ Starting scheduler...');
try {
  startScheduler();
  console.log('✅ Scheduler started');
} catch (err) {
  console.error('❌ Scheduler start error:', err);
}

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);

// Dual support for singular/plural endpoints to avoid frontend breakage
app.use(['/api/subscription', '/api/subscriptions'], subscriptionRoutes);
app.use(['/api/mess', '/api/messes'], messRoutes);
app.use(['/api/notification', '/api/notifications'], notificationsRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);
// Notifications already mounted above with dual support
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewsRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MessWalha Production API is LIVE 🚀',
    version: '1.2.3',
    timestamp: new Date().toISOString()
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`✅ Server successfully listening on port ${PORT}`);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

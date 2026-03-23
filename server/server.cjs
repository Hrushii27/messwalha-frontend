const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Configuration & Utils
const db = require('./config/db');
const { createTables } = require('./config/initDb');
const startScheduler = require('./utils/scheduler');

// Middleware
const { setupSecurity } = require('./middleware/security');
const authenticateToken = require('./middleware/auth');
const { activityLogger } = require('./middleware/activityLogger');

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
const dashboardRoutes = require('./routes/dashboard');

console.log('🚀 Server starting process...');
const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1); // Required for Heroku to handle X-Forwarded-For correctly
console.log('✅ Express initialized. Port:', PORT);

// --- 1. Security Headers (Helmet) ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.google.com", "https://*.gstatic.com", "https://*.razorpay.com", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://*.google.com", "https://recaptcha.google.com", "https://*.razorpay.com", "https://checkout.razorpay.com"],
        connectSrc: ["'self'", "https://*.google.com", "https://*.gstatic.com", "https://api.findmess.me", "https://*.razorpay.com", "https://api.cloudinary.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.gstatic.com", "https://*.google.com", "https://res.cloudinary.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://findmess.me",
  "https://www.findmess.me",
  "https://api.findmess.me"
];

// Temporarily allow all for debugging if strict whitelist fails
const isPermissive = true; 

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = 
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith(".vercel.app") ||
      process.env.NODE_ENV === 'development' ||
      isPermissive;

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(null, true); // Allow all for now during debugging
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
};

app.use(cors(corsOptions));

// --- 2. Global CORS Header Middleware (Step 3 Fix) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Refactored for extreme reliability: reflect origin if present
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Handle Preflight directly
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Global Preflight Request Handler
app.options("*", cors(corsOptions));

// --- 3. Body & Cookie Parsers ---
app.use(express.json({ limit: '10kb' })); 
app.use(cookieParser());

// --- 4. Custom Security Layer (Rate Limiting, XSS, HPP) ---
setupSecurity(app);

// --- 5. Activity Logger (Monitor failed/suspicious requests) ---
app.use(activityLogger);

// --- 6. Authentication (Soft Auth) ---
app.use(authenticateToken);

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] 📡 ${req.method} ${req.url}`);
  next();
});

// --- Diagnostic Routes ---
app.get('/api/ping', (req, res) => res.json({ status: 'OK', message: 'pong', time: new Date() }));

app.get('/api/health', async (req, res) => {
  console.log('🔍 Health check requested');
  try {
    const dbResult = await db.query('SELECT NOW()');
    res.json({
      status: 'ok',
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
app.use(['/api/subscription', '/api/subscriptions'], subscriptionRoutes);
app.use(['/api/mess', '/api/messes'], messRoutes);
app.use(['/api/notification', '/api/notifications'], notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/dashboard', dashboardRoutes);

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

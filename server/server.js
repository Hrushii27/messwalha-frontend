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

console.log('🚀 Server starting process...');
const app = express();
const PORT = process.env.PORT || 5000;
console.log('✅ Express initialized');

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://messwalha-frontend.vercel.app",
    "https://messwala.vercel.app",
    "https://frontend-one-swart-57.vercel.app",
    "https://www.messwala.me",
    "https://messwala.me"
];

app.use(cors({
    origin: function (origin, callback) {
        console.log('🔍 Incoming Origin:', origin);
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Handle preflight globally


// Global Request Logger (Definitive check if request hits Heroku)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] 📡 ${req.method} ${req.url}`);

    // Simple User extractor from Authorization header (Bearer token)
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            console.error('JWT Extract Error:', e.message);
        }
    }
    next();
});

app.use(express.json());

// --- Diagnostic Routes (Top level to avoid routing conflicts) ---
app.get('/api/ping', (req, res) => res.json({ status: 'OK', message: 'pong', time: new Date() }));

const db = require('./config/db');
app.get('/api/health', async (req, res) => {
    console.log('🔍 Health check requested');
    try {
        const dbResult = await db.query('SELECT NOW()');
        res.json({
            status: 'UP',
            database: 'CONNECTED',
            time: dbResult.rows[0].now,
            environment: process.env.NODE_ENV
        });
    } catch (err) {
        console.error('❌ Health check DB error:', err);
        res.status(500).json({
            status: 'DOWN',
            database: 'ERROR',
            message: err.message
        });
    }
});
// -------------------------------------------------------------

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
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/messes', messRoutes); // Changed to plural messes
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
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
        version: '1.1.0',
        timestamp: new Date().toISOString()
    });
});

// Start Server
console.log('🌐 Trying to listen on port', PORT);
const server = app.listen(PORT, () => {
    console.log(`✅ Server successfully listening on port ${PORT}`);
});

// Detailed Error Logging for Heroku H10
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1);
});

server.on('error', (err) => {
    console.error('Server failed to start:', err);
});


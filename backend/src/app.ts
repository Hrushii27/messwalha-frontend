import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { httpLogger } from './utils/logger.js';
import { db } from './config/firebase.js';
import { errorHandler } from './middleware/errorHandler.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import messRoutes from './routes/messRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { trackVisitor } from './middleware/visitorTracker.js';

import rateLimit from 'express-rate-limit';

const app = express();

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { status: 429, message: 'Too many requests, please try again later.' }
});

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MessWalha API',
            version: '1.0.0',
            description: 'API for Mess discovery and subscription platform',
        },
        servers: [{ url: process.env.BACKEND_URL || 'http://localhost:5000' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://*.unsplash.com", "https://via.placeholder.com", "https://res.cloudinary.com"],
            "connect-src": ["'self'", "https://api.cloudinary.com", "https://*.google.com", "https://*.razorpay.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://findmess.me",
    "https://www.findmess.me",
    "https://api.findmess.me"
];

app.use(cors({
    origin: (origin, callback) => {
        // Reflect origin always for debugging reliability
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// --- Global CORS Header Middleware ---
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(httpLogger);
app.use(trackVisitor);
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messes', messRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MessWalha API is live. Use /api-docs for documentation.' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MessWalha API is running' });
});

app.get('/api/health/db', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({
                status: 'ERROR',
                message: 'Database (Firebase) not initialized. Check FIREBASE_SERVICE_ACCOUNT environment variable.'
            });
        }

        // Try a simple operation to verify connection
        await db.collection('system_health').doc('status').get();

        res.status(200).json({
            status: 'OK',
            message: 'Database (Firebase) is connected and responsive.'
        });
    } catch (err: any) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: err.message
        });
    }
});

// Error Handling
app.use(errorHandler);

export default app;

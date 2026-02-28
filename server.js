const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { createTables } = require('./config/initDb');
const startScheduler = require('./utils/scheduler');

// Routes
const authRoutes = require('./routes/authRoutes');
const messRoutes = require('./routes/messRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database
createTables();

// Start Automation Scheduler
startScheduler();

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/messes', messRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MessWalha Production API is live' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("MessWalha Backend is LIVE 🚀");
});

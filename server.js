const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();

const { createTables } = require("./config/initDb");
const startScheduler = require("./utils/scheduler");

// Routes
const authRoutes = require("./routes/authRoutes");
const messRoutes = require("./routes/messRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/* ===========================
   SECURITY & MIDDLEWARE
=========================== */

app.set("trust proxy", 1); // required for Heroku

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
app.use(compression());
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://findmess.me",
  "https://www.findmess.me",
  "https://api.findmess.me"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.includes("vercel.app") ||
        origin.includes("messwala.me") ||
        origin.includes("localhost");

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`🛑 CORS blocked origin: ${origin}`);
        callback(null, true); // Allow for now during debugging
      }
    },
    credentials: true,
  })
);

// --- Global CORS Header Middleware ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.includes("vercel.app"))) {
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
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* ===========================
   DATABASE INIT
=========================== */

createTables();
startScheduler();

/* ===========================
   ROUTES
=========================== */

app.use("/api/auth", authRoutes);
app.use("/api/messes", messRoutes);
app.use("/api/mess", messRoutes); // User requested singular endpoint
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/owner", messRoutes); // Alias for owner mess management

// Placeholder for missing frontend routes
app.get("/api/favorites", (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "MessWalha Backend API is LIVE 🚀",
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MessWalha API endpoint is active. Use subroutes like /auth, /messes etc.' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.get("/diag", async (req, res) => {
  try {
    const db = require("./config/db");
    const tables = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    res.json({ status: "OK", schema: tables.rows });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.get("/api/diag", async (req, res) => {
  try {
    const db = require("./config/db");
    const usersCount = await db.query("SELECT COUNT(*) FROM users");
    const tables = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    res.json({
      status: "OK",
      hasJwtSecret: !!process.env.JWT_SECRET,
      usersCount: usersCount.rows[0].count,
      schema: tables.rows
    });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

/* ===========================
   404 HANDLER
=========================== */

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

/* ===========================
   GLOBAL ERROR HANDLER
=========================== */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

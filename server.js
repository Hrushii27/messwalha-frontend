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

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.NODE_ENV === 'development' ? true : [
      "https://messwalha-frontend.vercel.app",
      "https://messwala.vercel.app",
      "https://frontend-one-swart-57.vercel.app",
      "https://www.messwala.me",
      "https://messwala.me"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/owner", messRoutes); // Alias for owner mess management

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
    const tables = await createTables.db.query(`
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
    const ownersCount = await db.query("SELECT COUNT(*) FROM mess_owners");
    const tables = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    res.json({
      status: "OK",
      hasJwtSecret: !!process.env.JWT_SECRET,
      ownersCount: ownersCount.rows[0].count,
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

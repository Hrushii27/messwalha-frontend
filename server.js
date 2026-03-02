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
      "https://frontend-one-swart-57.vercel.app", // User's live domain
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

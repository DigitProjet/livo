const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const sequelize = require("./src/config/database");

dotenv.config();

const app = express();

// 📁 Créer dossier uploads
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// 🔒 Sécurité avancée
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
}));

// 🌐 CORS configuré
app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 📊 Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" }),
  }));
}

// 🚀 Compression
app.use(compression());

// ⏱️ Rate limiting par route
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Trop de requêtes, veuillez réessayer plus tard",
});
app.use("/api", globalLimiter);

// Limite plus stricte pour l'auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
});
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 📁 Fichiers statiques (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📦 Routes
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const merchantRoutes = require("./src/routes/merchantRoutes");
const courierRoutes = require("./src/routes/courierRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const subscriptionRoutes = require("./src/routes/subscriptionRoutes");
const walletRoutes = require("./src/routes/walletRoutes");
const supportRoutes = require("./src/routes/supportRoutes");
const bannerRoutes = require("./src/routes/bannerRoutes");

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/couriers", courierRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/banners", bannerRoutes);

// 🏠 Route santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// 📄 Documentation simple
app.get("/", (req, res) => {
  res.json({
    name: "Livo API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      orders: "/api/orders",
      merchants: "/api/merchants",
      couriers: "/api/couriers",
      payments: "/api/payments",
      admin: "/api/admin",
      subscriptions: "/api/subscriptions",
      wallet: "/api/wallet",
      support: "/api/support",
      banners: "/api/banners",
    },
  });
});

// ❌ Error handler global
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Fichier trop volumineux (max 5MB)" });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "development" ? err.message : "Erreur interne du serveur",
  });
});

// 🔄 Synchronisation DB
const syncOptions = process.env.NODE_ENV === "production" 
  ? { alter: false, force: false }
  : { alter: true };

sequelize.sync(syncOptions)
  .then(() => {
    console.log("✅ Database connected & synced");
    
    // Créer admin par défaut si besoin
    return require("./src/scripts/createDefaultAdmin")();
  })
  .catch((err) => {
    console.error("❌ Database error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    sequelize.close();
  });
});

module.exports = app;
// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sequelize = require("./src/config/database");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./src/routes/userRoutes");
app.use("/api/users", userRoutes);

// DB sync
sequelize.sync().then(() => {
  console.log("✅ Database connected & synced");
}).catch((err) => {
  console.error("❌ Database error:", err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const productRoutes = require("./src/routes/productRoutes");
app.use("/api/products", productRoutes);


const orderRoutes = require("./src/routes/orderRoutes");
app.use("/api/orders", orderRoutes);

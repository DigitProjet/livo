const express = require("express");
const {
  createOrder,
  getMyOrders,
  getMerchantOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { UserRole } = require("../utils/enums");

const router = express.Router();

// 🔹 Client
router.post("/", authMiddleware, roleMiddleware([UserRole.CLIENT]), createOrder);
router.get("/my-orders", authMiddleware, roleMiddleware([UserRole.CLIENT]), getMyOrders);

// 🔹 Marchand
router.get("/merchant", authMiddleware, roleMiddleware([UserRole.MERCHANT]), getMerchantOrders);
router.put("/:id/status", authMiddleware, roleMiddleware([UserRole.MERCHANT]), updateOrderStatus);

module.exports = router;

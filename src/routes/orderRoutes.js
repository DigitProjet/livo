// src/routes/orderRoutes.js
const express = require("express");
const {
  createOrder,
  getMyOrders,
  getMerchantOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderById,
} = require("../controllers/orderController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const {
  validateOrder, handleValidation, validateUUIDParam,
} = require("../middlewares/validationMiddleware");
const { UserRole } = require("../utils/enums");

const router = express.Router();

// Client
router.post(
  "/",
  authMiddleware,
  roleMiddleware([UserRole.CLIENT]),
  validateOrder,
  handleValidation,
  createOrder
);
router.get(
  "/my-orders",
  authMiddleware,
  roleMiddleware([UserRole.CLIENT]),
  getMyOrders
);
router.put(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware([UserRole.CLIENT]),
  validateUUIDParam("id"),
  handleValidation,
  cancelOrder
);

// Marchand
router.get(
  "/merchant",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  getMerchantOrders
);
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  validateUUIDParam("id"),
  handleValidation,
  updateOrderStatus
);

// Accès commun (client, marchand, livreur, admin)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware([UserRole.CLIENT, UserRole.MERCHANT, UserRole.COURIER, UserRole.ADMIN]),
  validateUUIDParam("id"),
  handleValidation,
  getOrderById
);

module.exports = router;
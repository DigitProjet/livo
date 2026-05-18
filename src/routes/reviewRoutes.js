// src/routes/reviewRoutes.js
const express = require("express");
const {
  createReview,
  getMerchantReviews,
  respondToReview,
} = require("../controllers/reviewController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { validateUUIDParam, handleValidation } = require("../middlewares/validationMiddleware");
const { body } = require("express-validator");
const { UserRole } = require("../utils/enums");

const router = express.Router();

// Publique
router.get("/merchant/:id", validateUUIDParam("id"), handleValidation, getMerchantReviews);

// Client
router.post(
  "/",
  authMiddleware,
  roleMiddleware([UserRole.CLIENT]),
  [
    body("orderId").isUUID(),
    body("targetId").isUUID(),
    body("targetType").isIn(["MERCHANT", "COURIER"]),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isLength({ max: 500 }),
  ],
  handleValidation,
  createReview
);

// Marchand / Livreur
router.put(
  "/:id/respond",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT, UserRole.COURIER]),
  validateUUIDParam("id"),
  [body("response").notEmpty().isLength({ max: 500 })],
  handleValidation,
  respondToReview
);

module.exports = router;
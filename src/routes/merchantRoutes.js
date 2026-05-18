// src/routes/merchantRoutes.js
const express = require("express");
const {
  createMerchantProfile,
  getMerchantProfile,
  updateMerchantProfile,
  getMerchantDashboard,
  getAllMerchants,
  getMerchantById,
} = require("../controllers/merchantController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadMerchantImages,
  uploadMerchantDocs,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");
const {
  validateMerchantProfile, handleValidation,
} = require("../middlewares/validationMiddleware");
const { UserRole } = require("../utils/enums");

const router = express.Router();

// Publiques
router.get("/", getAllMerchants);
router.get("/:id", getMerchantById);

// Protégées — Marchand
router.post(
  "/profile",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  uploadMerchantImages,
  handleUploadError,
  validateMerchantProfile,
  handleValidation,
  createMerchantProfile
);
router.get(
  "/profile/me",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  getMerchantProfile
);
router.put(
  "/profile/me",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  uploadMerchantImages,
  handleUploadError,
  updateMerchantProfile
);
router.get(
  "/dashboard/me",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  getMerchantDashboard
);

module.exports = router;
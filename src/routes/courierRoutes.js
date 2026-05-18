// src/routes/courierRoutes.js
const express = require("express");
const {
  createCourierProfile,
  getCourierProfile,
  updateAvailability,
  getAvailableDeliveries,
  acceptDelivery,
  markPickedUp,
  markDelivered,
  getMyEarnings,
  getMyHistory,
  updateLocation,
} = require("../controllers/courierController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadCourierDocs, handleUploadError,
} = require("../middlewares/uploadMiddleware");
const {
  validateCourierProfile, handleValidation, validateUUIDParam,
} = require("../middlewares/validationMiddleware");
const { UserRole } = require("../utils/enums");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.COURIER]));

router.post(
  "/profile",
  uploadCourierDocs,
  handleUploadError,
  validateCourierProfile,
  handleValidation,
  createCourierProfile
);
router.get("/profile", getCourierProfile);
router.put("/availability", updateAvailability);
router.put("/location", updateLocation);
router.get("/available-deliveries", getAvailableDeliveries);
router.post(
  "/deliveries/:deliveryId/accept",
  validateUUIDParam("deliveryId"),
  handleValidation,
  acceptDelivery
);
router.put(
  "/deliveries/:deliveryId/pickup",
  validateUUIDParam("deliveryId"),
  handleValidation,
  markPickedUp
);
router.put(
  "/deliveries/:deliveryId/deliver",
  validateUUIDParam("deliveryId"),
  handleValidation,
  markDelivered
);
router.get("/earnings", getMyEarnings);
router.get("/history", getMyHistory);

module.exports = router;
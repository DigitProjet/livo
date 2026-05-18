// src/routes/productRoutes.js
const express = require("express");
const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
} = require("../controllers/productController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadProductImage, handleUploadError,
} = require("../middlewares/uploadMiddleware");
const {
  validateProduct, handleValidation, validateUUIDParam,
} = require("../middlewares/validationMiddleware");
const { UserRole } = require("../utils/enums");

const router = express.Router();

// Publique
router.get("/", getAllProducts);

// Marchand
router.post(
  "/",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  uploadProductImage,
  handleUploadError,
  validateProduct,
  handleValidation,
  createProduct
);
router.get("/mine", authMiddleware, roleMiddleware([UserRole.MERCHANT]), getMyProducts);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  uploadProductImage,
  handleUploadError,
  validateUUIDParam("id"),
  handleValidation,
  updateProduct
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([UserRole.MERCHANT]),
  validateUUIDParam("id"),
  handleValidation,
  deleteProduct
);

module.exports = router;
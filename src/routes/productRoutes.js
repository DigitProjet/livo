const express = require("express");
const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
} = require("../controllers/productController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { UserRole } = require("../utils/enums");

const router = express.Router();

// 🔹 Pour les marchands
router.post("/", authMiddleware, roleMiddleware([UserRole.MERCHANT]), createProduct);
router.get("/mine", authMiddleware, roleMiddleware([UserRole.MERCHANT]), getMyProducts);
router.put("/:id", authMiddleware, roleMiddleware([UserRole.MERCHANT]), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware([UserRole.MERCHANT]), deleteProduct);

// 🔹 Pour les clients (voir tout)
router.get("/", getAllProducts);

module.exports = router;

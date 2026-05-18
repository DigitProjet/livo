// src/routes/userRoutes.js
const express = require("express");
const {
  register, login, refreshToken, logout,
  getProfile, updateProfile, changePassword,
} = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  validateRegister, validateLogin, handleValidation,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post("/register", validateRegister, handleValidation, register);
router.post("/login", validateLogin, handleValidation, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
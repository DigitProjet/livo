const express = require("express");
const {
  getMyWallet,
  requestWithdrawal,
  getWithdrawalHistory,
} = require("../controllers/walletController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { UserRole } = require("../utils/enums");
const { validate, withdrawalValidation } = require("../middlewares/validation");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getMyWallet);
router.post("/withdraw", withdrawalValidation.request, validate, requestWithdrawal);
router.get("/withdrawals", getWithdrawalHistory);

// Routes admin pour les retraits (dans adminRoutes)
module.exports = router;
const express = require("express");
const {
  subscribe,
  cancelSubscription,
  getMySubscription,
  renewSubscription,
} = require("../controllers/subscriptionController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validation");

const router = express.Router();

router.use(authMiddleware);

router.post("/subscribe", subscribe);
router.post("/cancel", cancelSubscription);
router.get("/me", getMySubscription);
router.post("/renew", renewSubscription);

module.exports = router;
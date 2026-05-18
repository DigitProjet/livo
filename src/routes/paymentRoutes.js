// src/routes/paymentRoutes.js
const express = require("express");
const {
  initiatePayment,
  getPaymentStatus,
  requestRefund,
} = require("../controllers/paymentController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { validatePayment, handleValidation } = require("../middlewares/validationMiddleware");
const { UserRole } = require("../utils/enums");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/initiate",
  roleMiddleware([UserRole.CLIENT]),
  validatePayment,
  handleValidation,
  initiatePayment
);
router.get("/status/:orderId", getPaymentStatus);
router.post("/refund", roleMiddleware([UserRole.CLIENT]), requestRefund);

module.exports = router;


// src/routes/notificationRoutes.js
const notifRouter = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

notifRouter.use(authMiddleware);
notifRouter.get("/", getMyNotifications);
notifRouter.put("/read-all", markAllAsRead);
notifRouter.put("/:id/read", markAsRead);
notifRouter.delete("/:id", deleteNotification);

module.exports = { paymentRouter: router, notificationRouter: notifRouter };
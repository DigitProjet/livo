const express = require("express");
const {
  createTicket,
  getMyTickets,
  getTicketDetail,
  addMessage,
  closeTicket,
} = require("../controllers/supportController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/tickets", createTicket);
router.get("/tickets", getMyTickets);
router.get("/tickets/:id", getTicketDetail);
router.post("/tickets/:id/messages", addMessage);
router.put("/tickets/:id/close", closeTicket);

module.exports = router;
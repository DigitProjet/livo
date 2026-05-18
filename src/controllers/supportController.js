const SupportTicket = require("../models/supportTicket");
const TicketMessage = require("../models/ticketMessage");
const Notification = require("../models/notification");
const User = require("../models/user");
const { NotificationType } = require("../utils/enums");

// 🔹 Créer un ticket
exports.createTicket = async (req, res) => {
  try {
    const { orderId, subject, category, priority, message } = req.body;
    
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      orderId,
      subject,
      category,
      priority,
      status: "OPEN",
    });
    
    if (message) {
      await TicketMessage.create({
        ticketId: ticket.id,
        userId: req.user.id,
        message,
        isAdminResponse: false,
      });
    }
    
    res.status(201).json({ message: "Ticket created", ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Mes tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { userId: req.user.id },
      include: [{ model: TicketMessage, limit: 1 }],
      order: [["createdAt", "DESC"]],
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Détail d'un ticket avec messages
exports.getTicketDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: TicketMessage,
          include: [{ model: User, attributes: ["firstName", "lastName", "role"] }],
          order: [["createdAt", "ASC"]],
        },
      ],
    });
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    // Marquer messages comme lus
    await TicketMessage.update(
      { isRead: true },
      { where: { ticketId: id, isAdminResponse: true, isRead: false } }
    );
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Ajouter un message
exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;
    
    const ticket = await SupportTicket.findOne({
      where: { id, userId: req.user.id },
    });
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      return res.status(400).json({ error: "Ticket is closed" });
    }
    
    const ticketMessage = await TicketMessage.create({
      ticketId: id,
      userId: req.user.id,
      message,
      attachments,
      isAdminResponse: false,
    });
    
    await ticket.update({ status: "OPEN", lastResponseAt: new Date() });
    
    res.json({ message: "Message added", ticketMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Fermer un ticket
exports.closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    const ticket = await SupportTicket.findOne({
      where: { id, userId: req.user.id },
    });
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    await ticket.update({
      status: "CLOSED",
      resolvedAt: new Date(),
      rating: rating || null,
    });
    
    res.json({ message: "Ticket closed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
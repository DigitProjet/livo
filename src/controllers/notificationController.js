// src/controllers/notificationController.js
const Notification = require("../models/notification");
const { Op } = require("sequelize");

// ✅ Mes notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30, unreadOnly } = req.query;
    const where = { userId: req.user.id };
    if (unreadOnly === "true") where.isRead = false;

    const notifications = await Notification.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      unreadCount,
      page: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user.id },
    });
    if (!notification) return res.status(404).json({ error: "Notification introuvable" });

    await notification.update({ isRead: true, readAt: new Date() });
    res.json({ message: "Notification marquée comme lue" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Marquer toutes comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user.id },
    });
    if (!notification) return res.status(404).json({ error: "Notification introuvable" });
    await notification.destroy();
    res.json({ message: "Notification supprimée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
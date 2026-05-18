// src/routes/adminRoutes.js
const express = require("express");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { UserRole } = require("../utils/enums");
const User = require("../models/user");
const Order = require("../models/order");
const Merchant = require("../models/merchant");
const Courier = require("../models/courier");
const Payment = require("../models/payment");
const Client = require("../models/client");
const Notification = require("../models/notification");
const { Op } = require("sequelize");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ADMIN]));

// ✅ Dashboard
router.get("/dashboard/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers, totalClients, totalMerchants, totalCouriers, activeUsers,
      totalOrders, todayOrders, monthOrders, pendingOrders, deliveredOrders, cancelledOrders,
      totalRevenue, todayRevenue, monthRevenue,
      pendingMerchants, activeMerchants,
      totalCouriersCount, availableCouriers, busyCouriers,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: "CLIENT" } }),
      User.count({ where: { role: "MERCHANT" } }),
      User.count({ where: { role: "COURIER" } }),
      User.count({ where: { accountStatus: "ACTIVE" } }),
      Order.count(),
      Order.count({ where: { createdAt: { [Op.gte]: today } } }),
      Order.count({ where: { createdAt: { [Op.gte]: thisMonth } } }),
      Order.count({ where: { status: "PENDING" } }),
      Order.count({ where: { status: "DELIVERED" } }),
      Order.count({ where: { status: "CANCELLED" } }),
      Payment.sum("amount", { where: { status: "SUCCESS" } }),
      Payment.sum("amount", { where: { status: "SUCCESS", paymentDate: { [Op.gte]: today } } }),
      Payment.sum("amount", { where: { status: "SUCCESS", paymentDate: { [Op.gte]: thisMonth } } }),
      Merchant.count({ where: { status: "PENDING" } }),
      Merchant.count({ where: { status: "ACTIVE" } }),
      Courier.count(),
      Courier.count({ where: { availabilityStatus: "AVAILABLE" } }),
      Courier.count({ where: { availabilityStatus: "BUSY" } }),
    ]);

    res.json({
      users: { total: totalUsers, clients: totalClients, merchants: totalMerchants, couriers: totalCouriers, active: activeUsers },
      orders: { total: totalOrders, today: todayOrders, thisMonth: monthOrders, pending: pendingOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
      revenue: { total: totalRevenue || 0, today: todayRevenue || 0, thisMonth: monthRevenue || 0 },
      merchants: { pending: pendingMerchants, active: activeMerchants },
      couriers: { total: totalCouriersCount, available: availableCouriers, busy: busyCouriers },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Gestion utilisateurs
router.get("/users", async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.accountStatus = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.json({ users: users.rows, total: users.count, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/users/:userId/status", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!["ACTIVE", "SUSPENDED", "DELETED"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    // Empêcher l'admin de se suspendre lui-même
    if (userId === req.user.id) {
      return res.status(400).json({ error: "Vous ne pouvez pas modifier votre propre statut" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    await user.update({ accountStatus: status });

    if (status === "SUSPENDED" && reason) {
      await Notification.create({
        userId,
        type: "SYSTEM",
        title: "Compte suspendu",
        message: `Votre compte a été suspendu. Raison: ${reason}`,
        data: {},
      });
    }

    res.json({ message: "Statut mis à jour", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Vérification marchands
router.get("/merchants", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const merchants = await Merchant.findAndCountAll({
      where,
      include: [{ model: User, as: "user", attributes: ["firstName", "lastName", "email", "phone"] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.json({ merchants: merchants.rows, total: merchants.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/merchants/:merchantId/verify", async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { status, commissionRate, reason } = req.body;

    if (!["ACTIVE", "SUSPENDED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) return res.status(404).json({ error: "Marchand introuvable" });

    const updateData = { status };
    if (commissionRate) updateData.commissionRate = commissionRate;

    await merchant.update(updateData);

    // Activer le compte utilisateur si marchand approuvé
    if (status === "ACTIVE") {
      await User.update({ accountStatus: "ACTIVE" }, { where: { id: merchant.userId } });
      await Notification.create({
        userId: merchant.userId,
        type: "SYSTEM",
        title: "Compte marchand approuvé",
        message: "Votre commerce a été validé. Vous pouvez commencer à recevoir des commandes!",
        data: {},
      });
    } else if (status === "REJECTED" && reason) {
      await Notification.create({
        userId: merchant.userId,
        type: "SYSTEM",
        title: "Dossier refusé",
        message: `Votre dossier a été refusé. Raison: ${reason}`,
        data: {},
      });
    }

    res.json({ message: "Marchand mis à jour", merchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Vérification livreurs
router.get("/couriers", async (req, res) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    const where = {};
    if (verified !== undefined) where.isVerified = verified === "true";

    const couriers = await Courier.findAndCountAll({
      where,
      include: [{ model: User, as: "user", attributes: ["firstName", "lastName", "email", "phone"] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ couriers: couriers.rows, total: couriers.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/couriers/:courierId/verify", async (req, res) => {
  try {
    const { courierId } = req.params;
    const courier = await Courier.findByPk(courierId);
    if (!courier) return res.status(404).json({ error: "Livreur introuvable" });

    await courier.update({ isVerified: true });
    await User.update({ accountStatus: "ACTIVE" }, { where: { id: courier.userId } });

    await Notification.create({
      userId: courier.userId,
      type: "SYSTEM",
      title: "Compte livreur approuvé",
      message: "Votre dossier a été validé. Vous pouvez commencer à livrer!",
      data: {},
    });

    res.json({ message: "Livreur vérifié", courier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Toutes les commandes avec filtres
router.get("/orders", async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: Merchant, as: "merchant", attributes: ["shopName"] },
        { model: Client, as: "client" },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.json({ orders: orders.rows, total: orders.count, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Gérer un litige (forcer statut commande)
router.put("/orders/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    await order.update({
      status,
      cancellationReason: reason,
      cancelledBy: "ADMIN",
    });

    res.json({ message: "Litige résolu", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Rapport financier
router.get("/reports/revenue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { status: "SUCCESS" };
    if (startDate && endDate) {
      where.paymentDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const payments = await Payment.findAll({
      where,
      include: [{ model: Order, as: "order", include: [{ model: Merchant, as: "merchant", attributes: ["shopName", "commissionRate"] }] }],
    });

    const report = {
      totalRevenue: 0,
      totalCommissions: 0,
      totalDeliveryFees: 0,
      byMerchant: {},
      byDay: {},
    };

    payments.forEach((payment) => {
      const amount = parseFloat(payment.amount);
      report.totalRevenue += amount;
      if (payment.order) {
        report.totalDeliveryFees += parseFloat(payment.order.deliveryFee || 0);
        report.totalCommissions += parseFloat(payment.order.commissionAmount || 0);

        const merchantName = payment.order.merchant?.shopName || "Inconnu";
        report.byMerchant[merchantName] = (report.byMerchant[merchantName] || 0) + amount;
      }
      if (payment.paymentDate) {
        const day = new Date(payment.paymentDate).toISOString().slice(0, 10);
        report.byDay[day] = (report.byDay[day] || 0) + amount;
      }
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Mettre à jour le taux de commission d'un marchand
router.put("/merchants/:merchantId/commission", async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { commissionRate } = req.body;

    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ error: "Taux invalide (0-100)" });
    }

    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) return res.status(404).json({ error: "Marchand introuvable" });

    await merchant.update({ commissionRate });
    res.json({ message: "Commission mise à jour", merchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
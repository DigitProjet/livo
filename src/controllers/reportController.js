const Order = require("../models/order");
const Payment = require("../models/payment");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const Courier = require("../models/courier");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// 📊 Rapport financier détaillé
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    // Revenus totaux
    const payments = await Payment.findAll({
      where: { status: "SUCCESS", ...where },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("amount")), "totalRevenue"],
        [sequelize.fn("DATE", sequelize.col("paymentDate")), "date"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("paymentDate"))],
    });
    
    // Commandes par statut
    const ordersByStatus = await Order.findAll({
      where,
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
    });
    
    // Commission totale estimée
    const commissionRate = 0.15; // 15% par défaut
    const totalCommission = payments.reduce((sum, p) => sum + (parseFloat(p.dataValues.totalRevenue) * commissionRate), 0);
    
    // Top marchands
    const topMerchants = await Order.findAll({
      where: { ...where, status: "DELIVERED" },
      attributes: [
        "merchantId",
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalSales"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orderCount"],
      ],
      include: [{ model: Merchant, attributes: ["shopName"] }],
      group: ["merchantId", "merchant.id", "merchant.shopName"],
      limit: 10,
      order: [[sequelize.fn("SUM", sequelize.col("totalAmount")), "DESC"]],
    });
    
    // Performance livreurs
    const courierPerformance = await Courier.findAll({
      attributes: [
        "id",
        "totalDeliveries",
        "totalEarnings",
        "rating",
      ],
      include: [{ model: User, attributes: ["firstName", "lastName"] }],
      order: [["totalDeliveries", "DESC"]],
      limit: 10,
    });
    
    res.json({
      period: { startDate, endDate },
      summary: {
        totalRevenue: payments.reduce((sum, p) => sum + parseFloat(p.dataValues.totalRevenue), 0),
        totalCommission,
        estimatedNetRevenue: payments.reduce((sum, p) => sum + parseFloat(p.dataValues.totalRevenue), 0) - totalCommission,
        totalOrders: ordersByStatus.reduce((sum, o) => sum + parseInt(o.dataValues.count), 0),
      },
      dailyRevenue: payments,
      ordersByStatus,
      topMerchants,
      courierPerformance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📈 Rapport KPIs
exports.getKpiReport = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Commandes aujourd'hui vs hier
    const todayOrders = await Order.count({ where: { createdAt: { [Op.gte]: today } } });
    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayOrders = await Order.count({
      where: { createdAt: { [Op.between]: [yesterdayStart, today] } },
    });
    
    // Revenus ce mois vs mois dernier
    const thisMonthRevenue = await Payment.sum("amount", {
      where: { status: "SUCCESS", paymentDate: { [Op.gte]: thisMonth } },
    }) || 0;
    
    const lastMonthRevenue = await Payment.sum("amount", {
      where: { status: "SUCCESS", paymentDate: { [Op.between]: [lastMonth, thisMonth] } },
    }) || 0;
    
    // Taux de conversion
    const totalOrders = await Order.count();
    const deliveredOrders = await Order.count({ where: { status: "DELIVERED" } });
    const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    
    // Délai de livraison moyen
    const deliveries = await sequelize.query(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, createdAt, updatedAt)) as avgDeliveryTime
      FROM orders
      WHERE status = 'DELIVERED' AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, { type: sequelize.QueryTypes.SELECT });
    
    res.json({
      daily: {
        orders: todayOrders,
        ordersVsYesterday: todayOrders - yesterdayOrders,
        revenue: thisMonthRevenue / 30,
      },
      monthly: {
        revenue: thisMonthRevenue,
        revenueVsLastMonth: thisMonthRevenue - lastMonthRevenue,
        orders: totalOrders,
      },
      performance: {
        conversionRate: conversionRate.toFixed(2),
        avgDeliveryTimeMinutes: Math.round(deliveries[0]?.avgDeliveryTime || 0),
        activeMerchants: await Merchant.count({ where: { status: "ACTIVE" } }),
        activeCouriers: await Courier.count({ where: { availabilityStatus: "AVAILABLE" } }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
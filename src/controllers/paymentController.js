const Payment = require("../models/payment");
const Order = require("../models/order");
const Client = require("../models/client");
const Notification = require("../models/notification");

// 🔹 Initier un paiement
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, method, mobileMoneyNumber, provider } = req.body;
    
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{ model: Client, where: { userId: req.user.id } }],
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Vérifier si paiement existe déjà
    let payment = await Payment.findOne({ where: { orderId } });
    
    if (payment && payment.status === "SUCCESS") {
      return res.status(400).json({ error: "Order already paid" });
    }

    if (!payment) {
      payment = await Payment.create({
        orderId,
        amount: order.totalAmount + order.deliveryFee,
        method,
        mobileMoneyNumber,
        provider,
        status: "PENDING",
      });
    }

    // Simulation de paiement (à remplacer par intégration réelle Mobile Money)
    // En production: appel API Orange Money / Moov Money / Wave
    const paymentSuccess = await simulateMobileMoneyPayment(mobileMoneyNumber, payment.amount);

    if (paymentSuccess) {
      await payment.update({
        status: "SUCCESS",
        paymentDate: new Date(),
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      await order.update({ paymentStatus: "PAID" });

      await Notification.create({
        userId: req.user.id,
        type: "PAYMENT_RECEIVED",
        title: "Paiement confirmé",
        message: `Votre paiement de ${payment.amount} FCFA a été confirmé`,
      });

      res.json({ message: "Payment successful", payment });
    } else {
      await payment.update({ status: "FAILED" });
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Simulation (à remplacer par vraie API)
async function simulateMobileMoneyPayment(phoneNumber, amount) {
  // Simuler succès 95% du temps
  return Math.random() < 0.95;
}

// 🔹 Vérifier statut paiement
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ where: { orderId } });
    
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    
    res.json({ status: payment.status, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Demander remboursement (client)
exports.requestRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{ model: Client, where: { userId: req.user.id } }],
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment || payment.status !== "SUCCESS") {
      return res.status(400).json({ error: "No valid payment found" });
    }

    if (order.status !== "CANCELLED" && order.status !== "DELIVERED") {
      return res.status(400).json({ error: "Refund only available for cancelled orders" });
    }

    await payment.update({
      status: "REFUNDED",
      refundAmount: payment.amount,
      refundReason: reason,
    });

    await Notification.create({
      userId: req.user.id,
      type: "ORDER_CANCELLED",
      title: "Remboursement initié",
      message: `Votre remboursement de ${payment.amount} FCFA a été initié`,
    });

    res.json({ message: "Refund requested", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
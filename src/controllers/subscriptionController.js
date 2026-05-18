const Subscription = require("../models/subscription");
const User = require("../models/user");
const Payment = require("../models/payment");
const Notification = require("../models/notification");
const Settings = require("../models/settings");
const { SubscriptionPlan, SubscriptionStatus, NotificationType } = require("../utils/enums");

// Plans et tarifs (peut venir de Settings)
const PLANS = {
  LIVEO_PLUS_MONTHLY: { price: 5000, durationDays: 30 },
  LIVEO_PLUS_YEARLY: { price: 50000, durationDays: 365 },
};

// 🔹 Souscrire à un abonnement
exports.subscribe = async (req, res) => {
  try {
    const { plan, paymentMethod, autoRenew } = req.body;
    
    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const existingSubscription = await Subscription.findOne({
      where: { userId: req.user.id, status: "ACTIVE" },
    });

    if (existingSubscription) {
      return res.status(400).json({ error: "You already have an active subscription" });
    }

    const planData = PLANS[plan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planData.durationDays);

    const subscription = await Subscription.create({
      userId: req.user.id,
      plan,
      status: "PENDING",
      startDate,
      endDate,
      autoRenew: autoRenew || false,
      paymentMethod,
      amount: planData.price,
    });

    // Simuler paiement (à intégrer avec vrai système)
    const paymentSuccess = await processSubscriptionPayment(req.user.id, planData.price, paymentMethod);

    if (paymentSuccess) {
      await subscription.update({
        status: "ACTIVE",
        transactionId: `SUB_${Date.now()}_${req.user.id}`,
      });

      await Notification.create({
        userId: req.user.id,
        type: NotificationType.SYSTEM,
        title: "Abonnement Livo Plus activé",
        message: `Votre abonnement ${plan} a été activé avec succès. Profitez des livraisons gratuites!`,
      });

      res.json({ message: "Subscription activated", subscription });
    } else {
      await subscription.update({ status: "CANCELLED" });
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Annuler abonnement
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    await subscription.update({ status: "CANCELLED", autoRenew: false });

    res.json({ message: "Subscription cancelled", subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Vérifier statut abonnement
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Renouveler abonnement
exports.renewSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    const planData = PLANS[subscription.plan];
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + planData.durationDays);

    await subscription.update({
      endDate: newEndDate,
      status: "ACTIVE",
    });

    res.json({ message: "Subscription renewed", subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fonction simulée de paiement
async function processSubscriptionPayment(userId, amount, method) {
  // À intégrer avec Orange Money / Moov Money / Wave
  return true;
}
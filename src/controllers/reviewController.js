// src/controllers/reviewController.js
const Review = require("../models/review");
const Order = require("../models/order");
const Client = require("../models/client");
const Merchant = require("../models/merchant");
const Courier = require("../models/courier");
const { OrderStatus } = require("../utils/enums");
const sequelize = require("../config/database");

// ✅ Créer un avis (client uniquement, commande livrée)
exports.createReview = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId, targetId, targetType, rating, comment } = req.body;

    const client = await Client.findOne({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: "Client introuvable" });

    // Vérifier que la commande appartient au client et est livrée
    const order = await Order.findOne({
      where: { id: orderId, clientId: client.id, status: OrderStatus.DELIVERED },
    });
    if (!order) {
      await t.rollback();
      return res.status(400).json({
        error: "Vous ne pouvez noter que les commandes livrées",
      });
    }

    // Vérifier qu'il n'y a pas déjà un avis pour ce couple (commande + cible)
    const existing = await Review.findOne({ where: { orderId, targetId } });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: "Vous avez déjà noté cette commande" });
    }

    const review = await Review.create(
      {
        orderId,
        reviewerId: req.user.id,
        targetId,
        targetType,
        rating,
        comment,
      },
      { transaction: t }
    );

    // Mettre à jour la note moyenne de la cible
    if (targetType === "MERCHANT") {
      const merchantReviews = await Review.findAll({ where: { targetId, targetType: "MERCHANT" } });
      const avgRating =
        merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length;
      await Merchant.update(
        { averageRating: avgRating.toFixed(2) },
        { where: { id: targetId }, transaction: t }
      );
    } else if (targetType === "COURIER") {
      const courierReviews = await Review.findAll({ where: { targetId, targetType: "COURIER" } });
      const avgRating =
        courierReviews.reduce((sum, r) => sum + r.rating, 0) / courierReviews.length;
      await Courier.update(
        { rating: avgRating.toFixed(2) },
        { where: { id: targetId }, transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ message: "Avis publié", review });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

// ✅ Avis d'un marchand
exports.getMerchantReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const reviews = await Review.findAndCountAll({
      where: { targetId: id, targetType: "MERCHANT" },
      include: [{ model: Order, as: "order", attributes: ["id", "createdAt"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const avgRating =
      reviews.rows.reduce((sum, r) => sum + r.rating, 0) / (reviews.rows.length || 1);

    res.json({
      reviews: reviews.rows,
      total: reviews.count,
      averageRating: avgRating.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Répondre à un avis (marchand ou livreur)
exports.respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    // Trouver le profil (marchand ou livreur) lié à cet utilisateur
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    const courier = await Courier.findOne({ where: { userId: req.user.id } });

    const targetId = merchant?.id || courier?.id;
    if (!targetId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const review = await Review.findOne({ where: { id, targetId } });
    if (!review) return res.status(404).json({ error: "Avis introuvable" });

    await review.update({ response });
    res.json({ message: "Réponse publiée", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
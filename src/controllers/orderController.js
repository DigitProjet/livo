// src/controllers/orderController.js
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const Merchant = require("../models/merchant");
const Client = require("../models/client");
const Notification = require("../models/notification");
const Promotion = require("../models/promotion");
const Delivery = require("../models/delivery");
const { OrderStatus, PaymentMethod } = require("../utils/enums");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// ✅ Créer une commande
exports.createOrder = async (req, res) => {
  // Transaction pour garantir l'intégrité
  const t = await sequelize.transaction();
  try {
    const {
      merchantId,
      items,
      paymentMethod,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      specialInstructions,
      promotionCode,
    } = req.body;

    const client = await Client.findOne({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: "Profil client introuvable" });

    // Vérifier que le marchand existe et est actif
    const merchant = await Merchant.findOne({
      where: { id: merchantId, status: "ACTIVE" },
    });
    if (!merchant) return res.status(404).json({ error: "Marchand introuvable ou inactif" });

    // Vérifier horaires d'ouverture (si définis)
    if (merchant.openingHours) {
      const now = new Date();
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const today = days[now.getDay()];
      const hours = merchant.openingHours[today];
      if (hours && hours.closed) {
        return res.status(400).json({ error: "Le marchand est fermé aujourd'hui" });
      }
    }

    // Calculer le total et vérifier les produits/stock
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.productId, merchantId, availability: true },
      });
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          error: `Produit ${item.productId} introuvable ou indisponible`,
        });
      }
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          error: `Stock insuffisant pour ${product.name} (disponible: ${product.stock})`,
        });
      }
      subtotal += parseFloat(product.price) * item.quantity;
      validatedItems.push({ product, quantity: item.quantity });
    }

    // Vérifier montant minimum
    if (subtotal < parseFloat(merchant.minimumOrderAmount)) {
      await t.rollback();
      return res.status(400).json({
        error: `Montant minimum: ${merchant.minimumOrderAmount} FCFA`,
      });
    }

    // Calculer frais de livraison (logique simplifiée, à améliorer avec vraie distance)
    let deliveryFee = 800; // Tarif de base en FCFA

    // Calcul commission
    const commissionRate = parseFloat(merchant.commissionRate) / 100;
    const commissionAmount = subtotal * commissionRate;

    // Appliquer code promo si fourni
    let discountAmount = 0;
    let appliedPromotion = null;

    if (promotionCode) {
      const promo = await Promotion.findOne({
        where: {
          code: promotionCode,
          isActive: true,
          startDate: { [Op.lte]: new Date() },
          endDate: { [Op.gte]: new Date() },
          [Op.or]: [
            { merchantId: merchantId },
            { merchantId: null }, // Promo globale Livo
          ],
        },
      });

      if (promo) {
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
          await t.rollback();
          return res.status(400).json({ error: "Code promo épuisé" });
        }
        if (subtotal < parseFloat(promo.minOrderAmount)) {
          await t.rollback();
          return res.status(400).json({
            error: `Montant minimum pour ce code: ${promo.minOrderAmount} FCFA`,
          });
        }

        if (promo.type === "PERCENTAGE") {
          discountAmount = subtotal * (parseFloat(promo.value) / 100);
          if (promo.maxDiscount) {
            discountAmount = Math.min(discountAmount, parseFloat(promo.maxDiscount));
          }
        } else if (promo.type === "FIXED_AMOUNT") {
          discountAmount = parseFloat(promo.value);
        } else if (promo.type === "FREE_DELIVERY") {
          deliveryFee = 0;
        }

        appliedPromotion = promo;
        await promo.increment("usedCount", { transaction: t });
      } else {
        await t.rollback();
        return res.status(400).json({ error: "Code promo invalide ou expiré" });
      }
    }

    const totalAmount = subtotal - discountAmount;

    // Créer la commande
    const order = await Order.create(
      {
        clientId: client.id,
        merchantId,
        totalAmount,
        deliveryFee,
        commissionAmount,
        paymentMethod,
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        specialInstructions,
        promotionCode,
        discountAmount,
        status: OrderStatus.PENDING,
      },
      { transaction: t }
    );

    // Créer les lignes de commande et décrémenter le stock
    for (const { product, quantity } of validatedItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          quantity,
          unitPrice: product.price,
          totalPrice: parseFloat(product.price) * quantity,
        },
        { transaction: t }
      );

      // Décrémenter le stock
      await product.decrement("stock", { by: quantity, transaction: t });

      // Mettre à jour disponibilité si stock épuisé
      if (product.stock - quantity <= 0) {
        await product.update({ availability: false }, { transaction: t });
      }
    }

    await t.commit();

    // Notifications (hors transaction)
    await Notification.create({
      userId: req.user.id,
      type: "ORDER_CREATED",
      title: "Commande passée",
      message: `Votre commande #${order.id.substring(0, 8)} a été reçue`,
      data: { orderId: order.id },
    });

    // Notifier le marchand
    const merchantUser = await Merchant.findByPk(merchantId);
    if (merchantUser) {
      await Notification.create({
        userId: merchantUser.userId,
        type: "ORDER_CREATED",
        title: "Nouvelle commande",
        message: `Vous avez reçu une nouvelle commande de ${totalAmount} FCFA`,
        data: { orderId: order.id },
      });
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: "items", include: [{ model: Product }] },
      ],
    });

    res.status(201).json({ message: "Commande créée", order: fullOrder });
  } catch (error) {
    await t.rollback();
    console.error("createOrder error:", error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ Mes commandes (Client)
exports.getMyOrders = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: "Client introuvable" });

    const { status, page = 1, limit = 20 } = req.query;
    const where = { clientId: client.id };
    if (status) where.status = status;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: "items", include: [{ model: Product }] },
        { model: Merchant, as: "merchant", attributes: ["shopName", "logoUrl"] },
        { model: Delivery, as: "delivery" },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page),
      totalPages: Math.ceil(orders.count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Commandes du marchand
exports.getMerchantOrders = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: "Marchand introuvable" });

    const { status, page = 1, limit = 20 } = req.query;
    const where = { merchantId: merchant.id };
    if (status) where.status = status;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: "items", include: [{ model: Product }] },
        { model: Client, as: "client", include: ["user"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page),
      totalPages: Math.ceil(orders.count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mettre à jour le statut (Marchand)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: "Marchand introuvable" });

    const order = await Order.findOne({ where: { id, merchantId: merchant.id } });
    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    // Transitions de statut valides pour le marchand
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        error: `Transition invalide: ${order.status} → ${status}`,
      });
    }

    await order.update({ status });

    // Récupérer l'userId du client pour la notification
    const client = await Client.findByPk(order.clientId, {
      include: [{ model: require("../models/user"), as: "user" }],
    });

    const notifMessages = {
      [OrderStatus.ACCEPTED]: "Votre commande a été acceptée",
      [OrderStatus.PREPARING]: "Votre commande est en cours de préparation",
      [OrderStatus.READY]: "Votre commande est prête, un livreur arrive",
      [OrderStatus.CANCELLED]: "Votre commande a été annulée par le marchand",
    };

    if (client?.userId && notifMessages[status]) {
      await Notification.create({
        userId: client.userId,
        type: `ORDER_${status}`,
        title: "Mise à jour commande",
        message: notifMessages[status],
        data: { orderId: order.id },
      });
    }

    res.json({ message: "Statut mis à jour", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Annuler une commande (Client)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const client = await Client.findOne({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: "Client introuvable" });

    const order = await Order.findOne({ where: { id, clientId: client.id } });
    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    // On ne peut annuler que si pas encore en livraison
    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.ACCEPTED];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        error: "Impossible d'annuler une commande déjà en préparation ou en livraison",
      });
    }

    await order.update({
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      cancelledBy: "CLIENT",
    });

    // Remettre le stock
    const items = await OrderItem.findAll({ where: { orderId: order.id } });
    for (const item of items) {
      await Product.increment("stock", {
        by: item.quantity,
        where: { id: item.productId },
      });
      await Product.update(
        { availability: true },
        { where: { id: item.productId } }
      );
    }

    res.json({ message: "Commande annulée", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Détail d'une commande
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: "items", include: [{ model: Product }] },
        { model: Merchant, as: "merchant" },
        { model: Client, as: "client" },
        { model: Delivery, as: "delivery" },
      ],
    });

    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    // Vérifier que l'utilisateur est autorisé à voir cette commande
    const client = await Client.findOne({ where: { userId: req.user.id } });
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });

    const isClient = client && order.clientId === client.id;
    const isMerchant = merchant && order.merchantId === merchant.id;
    const isAdmin = req.user.role === "ADMIN";
    const isCourier = req.user.role === "COURIER";

    if (!isClient && !isMerchant && !isAdmin && !isCourier) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// src/controllers/courierController.js
const Courier = require("../models/courier");
const Delivery = require("../models/delivery");
const Order = require("../models/order");
const Merchant = require("../models/merchant");
const Client = require("../models/client");
const User = require("../models/user");
const Notification = require("../models/notification");
const { DeliveryStatus, CourierAvailability } = require("../utils/enums");
const sequelize = require("../config/database");

// ✅ Créer profil livreur
exports.createCourierProfile = async (req, res) => {
  try {
    const existing = await Courier.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(409).json({ error: "Profil livreur déjà existant" });

    const { vehicleType, vehiclePlate, idCardNumber, zone } = req.body;

    const courierData = {
      userId: req.user.id,
      vehicleType,
      vehiclePlate,
      idCardNumber,
      zone,
      availabilityStatus: CourierAvailability.OFFLINE,
    };

    // Gérer upload documents KYC
    if (req.files) {
      if (req.files.idCardPhoto) {
        courierData.idCardPhoto = `/uploads/kyc/couriers/${req.files.idCardPhoto[0].filename}`;
      }
      if (req.files.drivingLicensePhoto) {
        courierData.drivingLicensePhoto = `/uploads/kyc/couriers/${req.files.drivingLicensePhoto[0].filename}`;
      }
    }

    const courier = await Courier.create(courierData);

    res.status(201).json({
      message: "Profil créé, en attente de vérification admin",
      courier,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Voir mon profil
exports.getCourierProfile = async (req, res) => {
  try {
    const courier = await Courier.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: "user", attributes: ["firstName", "lastName", "phone"] }],
    });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });
    res.json(courier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mettre à jour disponibilité + position GPS
exports.updateAvailability = async (req, res) => {
  try {
    const { status, latitude, longitude } = req.body;

    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    if (!courier.isVerified) {
      return res.status(403).json({
        error: "Compte non vérifié. Attendez la validation de votre dossier.",
      });
    }

    await courier.update({
      availabilityStatus: status,
      currentLatitude: latitude || courier.currentLatitude,
      currentLongitude: longitude || courier.currentLongitude,
    });

    res.json({ message: "Disponibilité mise à jour", courier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Courses disponibles
// CORRECTION: Les livraisons PENDING n'ont pas de courierId assigné
// On cherche les livraisons sans livreur
exports.getAvailableDeliveries = async (req, res) => {
  try {
    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    if (courier.availabilityStatus !== CourierAvailability.AVAILABLE) {
      return res.status(400).json({
        error: "Passez en statut AVAILABLE pour voir les courses",
      });
    }

    // ✅ CORRECTION: Filtrer par courierId IS NULL (pas de livreur assigné)
    const deliveries = await Delivery.findAll({
      where: {
        status: DeliveryStatus.PENDING,
        courierId: null, // Sequelize gère IS NULL correctement
      },
      include: [
        {
          model: Order,
          as: "order",
          include: [
            { model: Merchant, as: "merchant", attributes: ["shopName", "shopAddress", "latitude", "longitude"] },
            { model: Client, as: "client", attributes: ["id"] },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: 20,
    });

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Accepter une course
exports.acceptDelivery = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deliveryId } = req.params;

    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    if (courier.availabilityStatus !== CourierAvailability.AVAILABLE) {
      await t.rollback();
      return res.status(400).json({ error: "Vous n'êtes pas disponible" });
    }

    // ✅ Lock pour éviter double-acceptation (race condition)
    const delivery = await Delivery.findOne({
      where: { id: deliveryId, status: DeliveryStatus.PENDING, courierId: null },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!delivery) {
      await t.rollback();
      return res.status(404).json({ error: "Course indisponible" });
    }

    await delivery.update(
      { courierId: courier.id, status: DeliveryStatus.ACCEPTED },
      { transaction: t }
    );

    await courier.update(
      { availabilityStatus: CourierAvailability.BUSY },
      { transaction: t }
    );

    await Order.update(
      { status: "ACCEPTED", courierId: courier.id },
      { where: { id: delivery.orderId }, transaction: t }
    );

    await t.commit();

    // Notification hors transaction
    const order = await Order.findByPk(delivery.orderId, {
      include: [{ model: Client, as: "client" }],
    });

    if (order?.client?.userId) {
      await Notification.create({
        userId: order.client.userId,
        type: "ORDER_ACCEPTED",
        title: "Livreur assigné",
        message: "Un livreur a accepté votre commande et arrive bientôt",
        data: { deliveryId, courierId: courier.id },
      });
    }

    res.json({ message: "Course acceptée", delivery });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// ✅ Marquer récupéré chez le marchand
exports.markPickedUp = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    const delivery = await Delivery.findOne({
      where: { id: deliveryId, courierId: courier.id, status: DeliveryStatus.ACCEPTED },
    });
    if (!delivery) return res.status(404).json({ error: "Course introuvable" });

    await delivery.update({
      status: DeliveryStatus.PICKED_UP,
      actualPickupTime: new Date(),
    });

    await Order.update({ status: "PICKED_UP" }, { where: { id: delivery.orderId } });

    // Notifier le client
    const order = await Order.findByPk(delivery.orderId, {
      include: [{ model: Client, as: "client" }],
    });
    if (order?.client?.userId) {
      await Notification.create({
        userId: order.client.userId,
        type: "ORDER_PICKED_UP",
        title: "Commande en route!",
        message: "Votre commande a été récupérée et est en chemin",
        data: { orderId: delivery.orderId },
      });
    }

    res.json({ message: "Commande récupérée", delivery });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Marquer livré
exports.markDelivered = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deliveryId } = req.params;
    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    const delivery = await Delivery.findOne({
      where: { id: deliveryId, courierId: courier.id, status: DeliveryStatus.PICKED_UP },
    });
    if (!delivery) return res.status(404).json({ error: "Course introuvable" });

    await delivery.update(
      { status: DeliveryStatus.DELIVERED, actualDeliveryTime: new Date() },
      { transaction: t }
    );

    await Order.update(
      { status: "DELIVERED" },
      { where: { id: delivery.orderId }, transaction: t }
    );

    // Mettre à jour les gains du livreur
    const order = await Order.findByPk(delivery.orderId);
    const fee = parseFloat(order.deliveryFee) || 0;

    await courier.update(
      {
        totalEarnings: parseFloat(courier.totalEarnings) + fee,
        totalDeliveries: courier.totalDeliveries + 1,
        availabilityStatus: CourierAvailability.AVAILABLE,
      },
      { transaction: t }
    );

    await t.commit();

    if (order?.client?.userId) {
      await Notification.create({
        userId: order.client?.userId,
        type: "ORDER_DELIVERED",
        title: "Commande livrée!",
        message: "Votre commande a été livrée. Bon appétit!",
        data: { orderId: delivery.orderId },
      });
    }

    res.json({ message: "Livraison confirmée", delivery });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// ✅ Gains du livreur
exports.getMyEarnings = async (req, res) => {
  try {
    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    const deliveries = await Delivery.findAll({
      where: { courierId: courier.id, status: DeliveryStatus.DELIVERED },
      include: [{ model: Order, as: "order", attributes: ["deliveryFee", "createdAt"] }],
      order: [["createdAt", "DESC"]],
    });

    const earningsByMonth = {};
    deliveries.forEach((d) => {
      if (d.order) {
        const month = d.order.createdAt.toISOString().slice(0, 7);
        earningsByMonth[month] =
          (earningsByMonth[month] || 0) + parseFloat(d.order.deliveryFee || 0);
      }
    });

    res.json({
      totalEarnings: parseFloat(courier.totalEarnings),
      totalDeliveries: courier.totalDeliveries,
      rating: parseFloat(courier.rating),
      earningsByMonth,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Historique courses
exports.getMyHistory = async (req, res) => {
  try {
    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    const { page = 1, limit = 20 } = req.query;

    const deliveries = await Delivery.findAndCountAll({
      where: { courierId: courier.id },
      include: [
        {
          model: Order,
          as: "order",
          include: [
            { model: Merchant, as: "merchant", attributes: ["shopName"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      deliveries: deliveries.rows,
      total: deliveries.count,
      page: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mettre à jour position GPS (appelé fréquemment)
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const courier = await Courier.findOne({ where: { userId: req.user.id } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });

    await courier.update({ currentLatitude: latitude, currentLongitude: longitude });
    res.json({ message: "Position mise à jour" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
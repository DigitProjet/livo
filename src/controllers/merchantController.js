// src/controllers/merchantController.js
const Merchant = require("../models/merchant");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const Payment = require("../models/payment");
const Review = require("../models/review");
const { UserRole } = require("../utils/enums");
const { Op } = require("sequelize");
const path = require("path");
const sequelize = require("../config/database");

// ✅ Créer un profil marchand
exports.createMerchantProfile = async (req, res) => {
  try {
    if (req.user.role !== UserRole.MERCHANT) {
      return res.status(403).json({ error: "Réservé aux marchands" });
    }

    const existing = await Merchant.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(409).json({ error: "Profil marchand déjà existant" });

    const {
      shopName,
      shopAddress,
      latitude,
      longitude,
      description,
      openingHours,
      merchantType,
      estimatedPrepTime,
      deliveryRadius,
      minimumOrderAmount,
      taxId,
    } = req.body;

    const merchantData = {
      userId: req.user.id,
      shopName,
      shopAddress,
      latitude,
      longitude,
      description,
      openingHours: openingHours ? JSON.parse(openingHours) : null,
      merchantType: merchantType || "RESTAURANT",
      estimatedPrepTime,
      deliveryRadius,
      minimumOrderAmount,
      taxId,
      status: "PENDING",
    };

    // Gérer les uploads d'images
    if (req.files) {
      if (req.files.logo) {
        merchantData.logoUrl = `/uploads/merchants/${req.files.logo[0].filename}`;
      }
      if (req.files.cover) {
        merchantData.coverImageUrl = `/uploads/merchants/${req.files.cover[0].filename}`;
      }
    }
    if (req.file) {
      merchantData.businessRegistrationDoc = `/uploads/kyc/merchants/${req.file.filename}`;
    }

    const merchant = await Merchant.create(merchantData);

    res.status(201).json({
      message: "Profil marchand créé, en attente de validation",
      merchant,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Voir mon profil marchand
exports.getMerchantProfile = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: "user", attributes: ["firstName", "lastName", "email", "phone"] }],
    });
    if (!merchant) return res.status(404).json({ error: "Profil marchand introuvable" });
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Modifier mon profil marchand
exports.updateMerchantProfile = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: "Profil marchand introuvable" });

    const updateData = { ...req.body };

    if (updateData.openingHours && typeof updateData.openingHours === "string") {
      updateData.openingHours = JSON.parse(updateData.openingHours);
    }

    if (req.files) {
      if (req.files.logo) updateData.logoUrl = `/uploads/merchants/${req.files.logo[0].filename}`;
      if (req.files.cover) updateData.coverImageUrl = `/uploads/merchants/${req.files.cover[0].filename}`;
    }

    // Empêcher modification de certains champs sensibles
    delete updateData.commissionRate;
    delete updateData.status;
    delete updateData.userId;

    await merchant.update(updateData);
    res.json({ message: "Profil mis à jour", merchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Tableau de bord marchand
exports.getMerchantDashboard = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: "Profil marchand introuvable" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalOrders, todayOrders, monthOrders, pendingOrders, revenue, totalProducts] =
      await Promise.all([
        Order.count({ where: { merchantId: merchant.id } }),
        Order.count({ where: { merchantId: merchant.id, createdAt: { [Op.gte]: today } } }),
        Order.count({ where: { merchantId: merchant.id, createdAt: { [Op.gte]: thisMonth } } }),
        Order.count({ where: { merchantId: merchant.id, status: "PENDING" } }),
        Payment.sum("amount", {
          include: [{ model: Order, as: "order", where: { merchantId: merchant.id } }],
          where: { status: "SUCCESS" },
        }),
        Product.count({ where: { merchantId: merchant.id } }),
      ]);

    res.json({
      merchant: {
        shopName: merchant.shopName,
        status: merchant.status,
        averageRating: merchant.averageRating,
        commissionRate: merchant.commissionRate,
      },
      stats: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          thisMonth: monthOrders,
          pending: pendingOrders,
        },
        revenue: {
          total: revenue || 0,
          netAfterCommission:
            (revenue || 0) * (1 - parseFloat(merchant.commissionRate) / 100),
        },
        products: { total: totalProducts },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Liste des marchands (publique pour les clients)
exports.getAllMerchants = async (req, res) => {
  try {
    const { type, search, sponsored } = req.query;
    const where = { status: "ACTIVE" };

    if (type) where.merchantType = type;
    if (sponsored === "true") where.isSponsored = true;
    if (search) {
      where[Op.or] = [
        { shopName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const merchants = await Merchant.findAll({
      where,
      attributes: [
        "id", "shopName", "shopAddress", "description", "merchantType",
        "logoUrl", "coverImageUrl", "openingHours", "averageRating",
        "estimatedPrepTime", "minimumOrderAmount", "isSponsored",
        "deliveryRadius", "latitude", "longitude",
      ],
      order: [
        ["isSponsored", "DESC"],
        ["averageRating", "DESC"],
      ],
    });

    res.json(merchants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Détail d'un marchand (avec ses produits)
exports.getMerchantById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await Merchant.findOne({
      where: { id, status: "ACTIVE" },
      attributes: { exclude: ["commissionRate", "taxId", "businessRegistrationDoc"] },
      include: [
        {
          model: Product,
          as: "products",
          where: { availability: true },
          required: false,
        },
      ],
    });

    if (!merchant) return res.status(404).json({ error: "Marchand introuvable" });
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
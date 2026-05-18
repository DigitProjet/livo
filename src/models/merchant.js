// src/models/merchant.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const { MerchantType } = require("../utils/enums");

const Merchant = sequelize.define(
  "Merchant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shopAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    merchantType: {
      type: DataTypes.ENUM(...Object.values(MerchantType)),
      defaultValue: MerchantType.RESTAURANT,
    },
    openingHours: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "{ monday: { open: '08:00', close: '22:00', closed: false }, ... }",
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Commission appliquée (définie par admin)
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.00,
      comment: "Pourcentage de commission Livo (12-30%)",
    },
    // Statut de validation du marchand par l'admin
    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "SUSPENDED", "REJECTED"),
      defaultValue: "PENDING",
    },
    // Note moyenne calculée
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Publicité sponsorisée
    isSponsored: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sponsorshipEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Délai de préparation moyen en minutes
    estimatedPrepTime: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },
    // Rayon de livraison en km
    deliveryRadius: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.0,
    },
    minimumOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    // Documents KYC
    businessRegistrationDoc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "merchants",
    timestamps: true,
  }
);

User.hasOne(Merchant, { foreignKey: "userId", onDelete: "CASCADE" });
Merchant.belongsTo(User, { foreignKey: "userId" });

module.exports = Merchant;
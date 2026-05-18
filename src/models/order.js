// src/models/order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { OrderStatus, PaymentMethod, PaymentStatus } = require("../utils/enums");
const Client = require("./client");
const Merchant = require("./merchant");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "clients", key: "id" },
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "merchants", key: "id" },
    },
    // ✅ AJOUT: Le livreur assigné directement sur la commande
    courierId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "couriers", key: "id" },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
    },
    // ✅ AJOUT: Statut paiement séparé du statut commande
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      defaultValue: PaymentStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    // Montant commission Livo
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      defaultValue: PaymentMethod.CASH_ON_DELIVERY,
    },
    // Adresse de livraison (snapshot au moment de la commande)
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deliveryLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    deliveryLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    // Instructions spéciales
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Code promo appliqué
    promotionCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    // Estimation temps livraison
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // Raison annulation
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelledBy: {
      type: DataTypes.ENUM("CLIENT", "MERCHANT", "ADMIN", "SYSTEM"),
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

// Relations
Client.hasMany(Order, { foreignKey: "clientId" });
Merchant.hasMany(Order, { foreignKey: "merchantId" });
Order.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Order.belongsTo(Merchant, { foreignKey: "merchantId", as: "merchant" });

module.exports = Order;
// src/models/subscription.js
// Modèle Livo Plus - abonnement premium pour les clients
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const { SubscriptionPlan } = require("../utils/enums");

const Subscription = sequelize.define(
  "Subscription",
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
    plan: {
      type: DataTypes.ENUM(...Object.values(SubscriptionPlan)),
      defaultValue: SubscriptionPlan.FREE,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED", "CANCELLED", "PENDING"),
      defaultValue: "PENDING",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Prix payé
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Avantages du plan
    freeDeliveriesRemaining: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Pour les plans avec livraisons gratuites limitées",
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: "Réduction sur frais de livraison",
    },
    // Référence au paiement
    paymentTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
  }
);

User.hasMany(Subscription, { foreignKey: "userId", onDelete: "CASCADE" });
Subscription.belongsTo(User, { foreignKey: "userId" });

// Méthode pour vérifier si l'abonnement est actif
Subscription.prototype.isActive = function () {
  return this.status === "ACTIVE" && this.endDate > new Date();
};

module.exports = Subscription;
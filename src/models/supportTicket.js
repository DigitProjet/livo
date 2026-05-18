const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const SupportTicket = sequelize.define(
  "SupportTicket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("ORDER_ISSUE", "PAYMENT", "DELIVERY", "MERCHANT", "ACCOUNT", "OTHER"),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
      defaultValue: "MEDIUM",
    },
    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"),
      defaultValue: "OPEN",
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lastResponseAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
      allowNull: true,
    },
  },
  {
    tableName: "support_tickets",
    timestamps: true,
  }
);

User.hasMany(SupportTicket, { foreignKey: "userId", onDelete: "CASCADE" });
SupportTicket.belongsTo(User, { foreignKey: "userId" });

module.exports = SupportTicket;
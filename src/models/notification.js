const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Notification = sequelize.define(
  "Notification",
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
    type: {
      type: DataTypes.ENUM(
        "ORDER_CREATED",
        "ORDER_ACCEPTED",
        "ORDER_PREPARING",
        "ORDER_PICKED_UP",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "PROMOTION",
        "PAYMENT_RECEIVED",
        "LIVEO_PLUS_EXPIRY",
        "SYSTEM"
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId" });

module.exports = Notification;
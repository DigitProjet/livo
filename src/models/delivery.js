const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./order");
const Courier = require("./courier");

const Delivery = sequelize.define(
  "Delivery",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    courierId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "ACCEPTED",
        "PICKING_UP",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
        "FAILED"
      ),
      defaultValue: "PENDING",
    },
    pickupLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    pickupLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    deliveryLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    deliveryLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    distanceKm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    estimatedTimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actualPickupTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actualDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trackingHistory: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "deliveries",
    timestamps: true,
  }
);

Order.hasOne(Delivery, { foreignKey: "orderId", onDelete: "CASCADE" });
Delivery.belongsTo(Order, { foreignKey: "orderId" });

Courier.hasMany(Delivery, { foreignKey: "courierId" });
Delivery.belongsTo(Courier, { foreignKey: "courierId" });

module.exports = Delivery;
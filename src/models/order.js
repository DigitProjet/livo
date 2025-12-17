const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { OrderStatus, PaymentMethod } = require("../utils/enums");
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
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      defaultValue: PaymentMethod.CASH_ON_DELIVERY,
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
Order.belongsTo(Client, { foreignKey: "clientId" });
Order.belongsTo(Merchant, { foreignKey: "merchantId" });

module.exports = Order;

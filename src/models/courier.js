const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Courier = sequelize.define(
  "Courier",
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
    vehicleType: {
      type: DataTypes.ENUM("MOTO", "VELO", "VOITURE", "PIETON"),
      defaultValue: "MOTO",
    },
    vehiclePlate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idCardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idCardPhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    drivingLicensePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    availabilityStatus: {
      type: DataTypes.ENUM("AVAILABLE", "BUSY", "OFFLINE", "ON_BREAK"),
      defaultValue: "OFFLINE",
    },
    currentLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    currentLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    totalDeliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "couriers",
    timestamps: true,
  }
);

User.hasOne(Courier, { foreignKey: "userId", onDelete: "CASCADE" });
Courier.belongsTo(User, { foreignKey: "userId" });

module.exports = Courier;
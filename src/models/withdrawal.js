const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Withdrawal = sequelize.define(
  "Withdrawal",
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 1000 },
    },
    status: {
      type: DataTypes.ENUM("PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"),
      defaultValue: "PENDING",
    },
    method: {
      type: DataTypes.ENUM("MOBILE_MONEY", "BANK_TRANSFER", "WAVE"),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccount: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "withdrawals",
    timestamps: true,
  }
);

User.hasMany(Withdrawal, { foreignKey: "userId", onDelete: "CASCADE" });
Withdrawal.belongsTo(User, { foreignKey: "userId" });

module.exports = Withdrawal;
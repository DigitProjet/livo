const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Wallet = sequelize.define(
  "Wallet",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    totalEarned: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    totalWithdrawn: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "XOF",
    },
  },
  {
    tableName: "wallets",
    timestamps: true,
  }
);

User.hasOne(Wallet, { foreignKey: "userId", onDelete: "CASCADE" });
Wallet.belongsTo(User, { foreignKey: "userId" });

module.exports = Wallet;
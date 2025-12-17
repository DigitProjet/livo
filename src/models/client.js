const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Client = sequelize.define(
  "Client",
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
    defaultAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "clients",
    timestamps: true,
  }
);

// Relations
User.hasOne(Client, { foreignKey: "userId", onDelete: "CASCADE" });
Client.belongsTo(User, { foreignKey: "userId" });

module.exports = Client;

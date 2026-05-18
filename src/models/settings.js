const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Settings = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category: {
      type: DataTypes.ENUM("COMMISSION", "DELIVERY", "SUBSCRIPTION", "GENERAL", "PROMOTION"),
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dataType: {
      type: DataTypes.ENUM("STRING", "NUMBER", "BOOLEAN", "JSON", "ARRAY"),
      defaultValue: "STRING",
    },
    isEditable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "settings",
    timestamps: true,
  }
);

module.exports = Settings;
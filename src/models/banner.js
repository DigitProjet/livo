const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Merchant = require("./merchant");

const Banner = sequelize.define(
  "Banner",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    linkType: {
      type: DataTypes.ENUM("PRODUCT", "MERCHANT", "PROMOTION", "EXTERNAL"),
      defaultValue: "EXTERNAL",
    },
    linkValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.ENUM("HOME", "CATEGORY", "MERCHANT_PAGE"),
      defaultValue: "HOME",
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isSponsored: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    clickCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "banners",
    timestamps: true,
  }
);

Merchant.hasMany(Banner, { foreignKey: "merchantId", onDelete: "SET NULL" });
Banner.belongsTo(Merchant, { foreignKey: "merchantId" });

module.exports = Banner;
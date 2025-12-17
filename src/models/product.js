const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { ProductCategory } = require("../utils/enums");
const Merchant = require("./merchant");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "merchants",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(ProductCategory)),
      defaultValue: ProductCategory.OTHER,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    availability: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

// Relations
Merchant.hasMany(Product, { foreignKey: "merchantId", onDelete: "CASCADE" });
Product.belongsTo(Merchant, { foreignKey: "merchantId" });

module.exports = Product;

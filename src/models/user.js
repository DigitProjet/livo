// src/models/user.js
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { UserRole, AccountStatus } = require("../utils/enums");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.CLIENT,
  },
  accountStatus: {
    type: DataTypes.ENUM(...Object.values(AccountStatus)),
    defaultValue: AccountStatus.PENDING,
  },
}, {
  tableName: "users",
  timestamps: true,
});

// Hash password before saving
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.prototype.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;

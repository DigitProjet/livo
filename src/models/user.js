// src/models/user.js
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { UserRole, AccountStatus } = require("../utils/enums");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
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
    // Refresh token stocké hashé pour la révocation
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Pour OTP (vérification téléphone)
    otpCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Réinitialisation mot de passe
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Nombre de tentatives de connexion échouées (protection brute force)
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    // ✅ SÉCURITÉ: Ne jamais retourner le mot de passe dans les réponses
    defaultScope: {
      attributes: {
        exclude: [
          "password",
          "refreshToken",
          "otpCode",
          "otpExpiresAt",
          "passwordResetToken",
          "passwordResetExpiresAt",
          "loginAttempts",
          "lockedUntil",
        ],
      },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password", "loginAttempts", "lockedUntil"] },
      },
      withOtp: {
        attributes: { include: ["otpCode", "otpExpiresAt"] },
      },
      withRefreshToken: {
        attributes: { include: ["refreshToken"] },
      },
    },
  }
);

// ✅ Hash password avant création
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

// ✅ Hash password avant mise à jour si modifié
User.beforeUpdate(async (user) => {
  if (user.changed("password") && user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

// Vérifier mot de passe
User.prototype.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Vérifier si compte est verrouillé
User.prototype.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date();
};

module.exports = User;
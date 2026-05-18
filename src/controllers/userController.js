// src/controllers/userController.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const Client = require("../models/client");
const Merchant = require("../models/merchant");
const Courier = require("../models/courier");
const Notification = require("../models/notification");
const { UserRole, AccountStatus } = require("../utils/enums");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// ✅ Génération des tokens JWT
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
};

// ✅ Inscription
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Rôle ADMIN interdit via API publique
    const allowedRoles = [UserRole.CLIENT, UserRole.MERCHANT, UserRole.COURIER];
    const assignedRole = role && allowedRoles.includes(role) ? role : UserRole.CLIENT;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ error: "Ce numéro est déjà utilisé" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: assignedRole,
      accountStatus: AccountStatus.PENDING,
    });

    // Créer profil selon rôle
    if (assignedRole === UserRole.CLIENT) {
      await Client.create({ userId: user.id });
    }

    // Notification de bienvenue
    await Notification.create({
      userId: user.id,
      type: "SYSTEM",
      title: "Bienvenue sur Livo!",
      message: `Bonjour ${firstName}, votre compte a été créé avec succès.`,
      data: {},
    });

    // On retourne l'utilisateur sans le mot de passe (defaultScope)
    const safeUser = await User.findByPk(user.id);
    res.status(201).json({
      message: "Compte créé avec succès",
      user: safeUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ Connexion avec protection brute force
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur avec les champs de sécurité (scope spécial)
    const user = await User.scope("withPassword").findOne({ where: { email } });

    if (!user) {
      // Même message pour éviter l'énumération d'utilisateurs
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le compte est verrouillé
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(429).json({
        error: `Compte temporairement verrouillé. Réessayez dans ${remaining} minute(s).`,
      });
    }

    // Vérifier le statut du compte
    if (user.accountStatus === "SUSPENDED") {
      return res.status(403).json({ error: "Compte suspendu. Contactez le support." });
    }
    if (user.accountStatus === "DELETED") {
      return res.status(403).json({ error: "Compte supprimé." });
    }

    const isValid = await user.checkPassword(password);

    if (!isValid) {
      // Incrémenter tentatives échouées
      const attempts = (user.loginAttempts || 0) + 1;
      const updateData = { loginAttempts: attempts };

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        updateData.lockedUntil = lockUntil;
        updateData.loginAttempts = 0;
      }

      await User.update(updateData, { where: { id: user.id } });

      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Connexion réussie: reset tentatives
    await User.update(
      { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
      { where: { id: user.id } }
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Stocker le refresh token hashé
    const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await User.update({ refreshToken: hashedRefresh }, { where: { id: user.id } });

    const safeUser = await User.findByPk(user.id);
    res.json({
      message: "Connexion réussie",
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Rafraîchir le token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token requis" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: "Refresh token invalide ou expiré" });
    }

    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Token invalide" });
    }

    // Vérifier que le refresh token correspond à celui stocké
    const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const user = await User.scope("withRefreshToken").findOne({
      where: { id: decoded.id, refreshToken: hashedRefresh },
    });

    if (!user) {
      return res.status(401).json({ error: "Refresh token révoqué" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Rotation du refresh token
    const newHashed = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    await User.update({ refreshToken: newHashed }, { where: { id: user.id } });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Déconnexion (révocation du refresh token)
exports.logout = async (req, res) => {
  try {
    await User.update({ refreshToken: null }, { where: { id: req.user.id } });
    res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Mise à jour profil
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    await User.update({ firstName, lastName }, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id);
    res.json({ message: "Profil mis à jour", user: updated });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Changement de mot de passe
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.scope("withPassword").findByPk(req.user.id);
    const isValid = await user.checkPassword(currentPassword);

    if (!isValid) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" });
    }

    await User.update({ password: newPassword }, { where: { id: req.user.id } });
    // Invalider tous les refresh tokens (déconnecter tous les appareils)
    await User.update({ refreshToken: null }, { where: { id: req.user.id } });

    res.json({ message: "Mot de passe modifié. Reconnectez-vous." });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
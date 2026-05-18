// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// ✅ Middleware d'authentification principal
exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant ou format invalide" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expiré", code: "TOKEN_EXPIRED" });
      }
      return res.status(401).json({ error: "Token invalide" });
    }

    // Récupérer l'utilisateur sans le mot de passe (defaultScope)
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Vérifier que le compte est actif
    if (user.accountStatus === "SUSPENDED") {
      return res.status(403).json({ error: "Compte suspendu. Contactez le support." });
    }
    if (user.accountStatus === "DELETED") {
      return res.status(403).json({ error: "Compte supprimé." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'authentification" });
  }
};

// ✅ Middleware de rôle
exports.roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Accès refusé",
        required: roles,
        current: req.user.role,
      });
    }
    next();
  };
};

// ✅ Middleware optionnel (pas d'erreur si pas de token)
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};
// src/middlewares/validationMiddleware.js
const { body, param, query, validationResult } = require("express-validator");

// ✅ Gestionnaire d'erreurs de validation
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: "Données invalides",
      details: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ✅ Règles de validation — Utilisateur
exports.validateRegister = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("Le prénom est requis")
    .isLength({ min: 2, max: 50 }).withMessage("Prénom: 2–50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage("Prénom invalide"),

  body("lastName")
    .trim()
    .notEmpty().withMessage("Le nom est requis")
    .isLength({ min: 2, max: 50 }).withMessage("Nom: 2–50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage("Nom invalide"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail().withMessage("Email invalide"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Le téléphone est requis")
    .matches(/^(\+223|00223)?[0-9]{8}$/).withMessage("Numéro malien invalide (ex: +22370000000)"),

  body("password")
    .isLength({ min: 8 }).withMessage("Mot de passe: minimum 8 caractères")
    .matches(/[A-Z]/).withMessage("Mot de passe doit contenir une majuscule")
    .matches(/[0-9]/).withMessage("Mot de passe doit contenir un chiffre"),

  body("role")
    .optional()
    .isIn(["CLIENT", "MERCHANT", "COURIER"]).withMessage("Rôle invalide"),
];

exports.validateLogin = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Email invalide"),
  body("password").notEmpty().withMessage("Mot de passe requis"),
];

// ✅ Règles de validation — Produit
exports.validateProduct = [
  body("name")
    .trim()
    .notEmpty().withMessage("Nom du produit requis")
    .isLength({ min: 2, max: 100 }),

  body("price")
    .isFloat({ min: 0 }).withMessage("Prix doit être positif"),

  body("stock")
    .isInt({ min: 0 }).withMessage("Stock doit être un entier positif"),

  body("category")
    .optional()
    .isIn(["FOOD", "DRINKS", "PHARMACY", "HYGIENE", "SUPPLIES", "OTHER"])
    .withMessage("Catégorie invalide"),
];

// ✅ Règles de validation — Commande
exports.validateOrder = [
  body("merchantId")
    .isUUID().withMessage("merchantId invalide"),

  body("items")
    .isArray({ min: 1 }).withMessage("La commande doit contenir au moins un article"),

  body("items.*.productId")
    .isUUID().withMessage("productId invalide"),

  body("items.*.quantity")
    .isInt({ min: 1 }).withMessage("Quantité doit être supérieure à 0"),

  body("deliveryAddress")
    .trim()
    .notEmpty().withMessage("Adresse de livraison requise"),

  body("paymentMethod")
    .isIn(["MOBILE_MONEY", "CARD", "CASH_ON_DELIVERY"])
    .withMessage("Mode de paiement invalide"),
];

// ✅ Règles de validation — Paiement
exports.validatePayment = [
  body("orderId").isUUID().withMessage("orderId invalide"),

  body("method")
    .isIn(["MOBILE_MONEY", "CARD", "CASH_ON_DELIVERY"])
    .withMessage("Méthode de paiement invalide"),

  body("mobileMoneyNumber")
    .if(body("method").equals("MOBILE_MONEY"))
    .notEmpty().withMessage("Numéro Mobile Money requis")
    .matches(/^(\+223|00223)?[0-9]{8}$/).withMessage("Numéro invalide"),

  body("provider")
    .if(body("method").equals("MOBILE_MONEY"))
    .isIn(["ORANGE_MONEY", "MOOV_MONEY", "WAVE", "OTHER"])
    .withMessage("Opérateur invalide"),
];

// ✅ Règles de validation — Profil marchand
exports.validateMerchantProfile = [
  body("shopName")
    .trim()
    .notEmpty().withMessage("Nom du commerce requis")
    .isLength({ min: 2, max: 100 }),

  body("shopAddress")
    .trim()
    .notEmpty().withMessage("Adresse du commerce requise"),

  body("merchantType")
    .optional()
    .isIn(["RESTAURANT", "PHARMACY", "SUPERMARKET", "OTHER"]),

  body("commissionRate")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Taux de commission invalide"),
];

// ✅ Règles de validation — Profil livreur
exports.validateCourierProfile = [
  body("vehicleType")
    .isIn(["MOTO", "VELO", "VOITURE", "PIETON"])
    .withMessage("Type de véhicule invalide"),

  body("idCardNumber")
    .trim()
    .notEmpty().withMessage("Numéro CNI requis"),

  body("zone")
    .optional()
    .trim()
    .isLength({ max: 100 }),
];

// ✅ UUID param
exports.validateUUIDParam = (paramName = "id") => [
  param(paramName).isUUID().withMessage(`${paramName} invalide`),
];
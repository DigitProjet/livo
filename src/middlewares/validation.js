const { body, param, query, validationResult } = require("express-validator");

// Validation handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Règles de validation
exports.userValidation = {
  register: [
    body("firstName").notEmpty().withMessage("First name required").isLength({ min: 2 }),
    body("lastName").notEmpty().withMessage("Last name required").isLength({ min: 2 }),
    body("email").isEmail().withMessage("Valid email required"),
    body("phone").matches(/^[0-9]{9,15}$/).withMessage("Valid phone number required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  login: [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
};

exports.orderValidation = {
  create: [
    body("merchantId").isUUID().withMessage("Valid merchant ID required"),
    body("items").isArray({ min: 1 }).withMessage("At least one item required"),
    body("items.*.productId").isUUID().withMessage("Valid product ID required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be positive"),
    body("paymentMethod").isIn(["MOBILE_MONEY", "CARD", "CASH_ON_DELIVERY"]),
  ],
};

exports.productValidation = {
  create: [
    body("name").notEmpty().withMessage("Product name required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be positive"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be >= 0"),
  ],
};

exports.withdrawalValidation = {
  request: [
    body("amount").isFloat({ min: 1000 }).withMessage("Minimum 1000 FCFA"),
    body("method").isIn(["MOBILE_MONEY", "BANK_TRANSFER", "WAVE"]),
    body("phoneNumber").optional().matches(/^[0-9]{9,15}$/),
  ],
};
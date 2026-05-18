// src/middlewares/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// ✅ Créer les dossiers si nécessaire
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ✅ Configuration du stockage local
const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, "../../uploads", folder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = crypto.randomBytes(16).toString("hex");
      cb(null, `${unique}${ext}`);
    },
  });

// ✅ Filtres de type de fichier
const imageFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images JPG, PNG et WEBP sont acceptées"), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers JPG, PNG et PDF sont acceptés"), false);
  }
};

// ✅ Upload photos produits (marchands)
exports.uploadProductImage = multer({
  storage: createStorage("products"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}).single("image");

// ✅ Upload logo/cover marchand
exports.uploadMerchantImages = multer({
  storage: createStorage("merchants"),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

// ✅ Upload documents KYC livreurs
exports.uploadCourierDocs = multer({
  storage: createStorage("kyc/couriers"),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).fields([
  { name: "idCardPhoto", maxCount: 1 },
  { name: "drivingLicensePhoto", maxCount: 1 },
]);

// ✅ Upload documents KYC marchands
exports.uploadMerchantDocs = multer({
  storage: createStorage("kyc/merchants"),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).single("businessRegistrationDoc");

// ✅ Gestionnaire d'erreurs Multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Fichier trop volumineux" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
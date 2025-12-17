const Merchant = require("../models/merchant");
const User = require("../models/user");
const { UserRole } = require("../utils/enums");

// 🔹 Créer un profil marchand
exports.createMerchantProfile = async (req, res) => {
  try {
    if (req.user.role !== UserRole.MERCHANT)
      return res.status(403).json({ error: "Access denied" });

    const existing = await Merchant.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(400).json({ error: "Profile already exists" });

    const { shopName, shopAddress, description, openingHours } = req.body;

    const merchant = await Merchant.create({
      userId: req.user.id,
      shopName,
      shopAddress,
      description,
      openingHours,
      status: "PENDING",
    });

    res.status(201).json({ message: "Merchant profile created", merchant });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Voir mon profil marchand
exports.getMerchantProfile = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({
      where: { userId: req.user.id },
      include: [{ model: User }],
    });

    if (!merchant) return res.status(404).json({ error: "Merchant profile not found" });
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Modifier mon profil marchand
exports.updateMerchantProfile = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: "Merchant profile not found" });

    await merchant.update(req.body);
    res.json({ message: "Merchant profile updated", merchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

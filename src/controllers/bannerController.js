const Banner = require("../models/banner");
const Merchant = require("../models/merchant");
const { Op } = require("sequelize");

// 🔹 Récupérer les bannières actives
exports.getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      include: [{ model: Merchant, attributes: ["shopName", "id"] }],
      order: [["priority", "DESC"]],
      limit: 10,
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Incrementer le compteur de clics
exports.incrementClick = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.increment("clickCount", { where: { id } });
    res.json({ message: "Click counted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
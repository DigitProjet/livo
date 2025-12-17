const Product = require("../models/product");
const Merchant = require("../models/merchant");

// 🔹 Créer un produit
exports.createProduct = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant)
      return res.status(404).json({ error: "Merchant profile not found" });

    const product = await Product.create({
      ...req.body,
      merchantId: merchant.id,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Lister les produits du marchand connecté
exports.getMyProducts = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant)
      return res.status(404).json({ error: "Merchant profile not found" });

    const products = await Product.findAll({
      where: { merchantId: merchant.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Modifier un produit
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant)
      return res.status(404).json({ error: "Merchant profile not found" });

    const product = await Product.findOne({
      where: { id, merchantId: merchant.id },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.update(req.body);
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant)
      return res.status(404).json({ error: "Merchant profile not found" });

    const product = await Product.findOne({
      where: { id, merchantId: merchant.id },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Lister tous les produits (pour les clients)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { availability: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

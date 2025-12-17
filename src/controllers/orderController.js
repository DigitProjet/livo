const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const Merchant = require("../models/merchant");
const Client = require("../models/client");
const { OrderStatus } = require("../utils/enums");

// 🔹 Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const { merchantId, items, paymentMethod, deliveryFee } = req.body;
    const client = await Client.findOne({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: "Client not found" });

    let total = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      total += product.price * item.quantity;
    }

    const order = await Order.create({
      clientId: client.id,
      merchantId,
      totalAmount: total,
      deliveryFee: deliveryFee || 0,
      paymentMethod,
    });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Lister mes commandes (Client)
exports.getMyOrders = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { userId: req.user.id } });
    if (!client) return res.status(404).json({ error: "Client not found" });

    const orders = await Order.findAll({
      where: { clientId: client.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Lister les commandes reçues (Marchand)
exports.getMerchantOrders = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: "Merchant not found" });

    const orders = await Order.findAll({
      where: { merchantId: merchant.id },
      include: [{ model: OrderItem, include: [Product] }],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Mettre à jour le statut d’une commande (Marchand)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: "Merchant not found" });

    const order = await Order.findOne({ where: { id, merchantId: merchant.id } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.update({ status });
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

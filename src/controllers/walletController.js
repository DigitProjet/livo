const Wallet = require("../models/wallet");
const Withdrawal = require("../models/withdrawal");
const User = require("../models/user");
const Notification = require("../models/notification");
const { NotificationType } = require("../utils/enums");

// 🔹 Créer ou récupérer wallet
exports.getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
};

// 🔹 Voir mon wallet
exports.getMyWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      const newWallet = await Wallet.create({ userId: req.user.id, balance: 0 });
      return res.json(newWallet);
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Créditer un wallet (interne)
exports.creditWallet = async (userId, amount, description) => {
  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) return null;
  
  const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
  await wallet.update({
    balance: newBalance,
    totalEarned: parseFloat(wallet.totalEarned) + parseFloat(amount),
  });
  
  return wallet;
};

// 🔹 Débiter un wallet (interne)
exports.debitWallet = async (userId, amount, description) => {
  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) return null;
  
  if (parseFloat(wallet.balance) < parseFloat(amount)) {
    throw new Error("Insufficient balance");
  }
  
  const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
  await wallet.update({
    balance: newBalance,
    totalSpent: parseFloat(wallet.totalSpent) + parseFloat(amount),
  });
  
  return wallet;
};

// 🔹 Demander un retrait
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, phoneNumber, bankAccount } = req.body;
    
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    if (amount < 1000) {
      return res.status(400).json({ error: "Minimum withdrawal amount is 1000 FCFA" });
    }
    
    const withdrawal = await Withdrawal.create({
      userId: req.user.id,
      amount,
      method,
      phoneNumber,
      bankAccount,
      status: "PENDING",
    });
    
    // Notifier l'admin
    await Notification.create({
      userId: req.user.id,
      type: NotificationType.WITHDRAWAL_STATUS,
      title: "Demande de retrait",
      message: `Votre demande de retrait de ${amount} FCFA a été soumise`,
    });
    
    res.json({ message: "Withdrawal request submitted", withdrawal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Historique des retraits
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
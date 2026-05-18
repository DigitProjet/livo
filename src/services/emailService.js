// Configuration email (à installer: npm install nodemailer)
// Pour l'instant, structure prête pour intégration future

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendEmail = async (to, subject, html, text = null) => {
  try {
    const info = await transporter.sendMail({
      from: `"Livo" <${process.env.SMTP_FROM || "noreply@livo.com"}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    });
    return info;
  } catch (error) {
    console.error("Email error:", error);
    return null;
  }
};

exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #FF6B35;">Bienvenue sur Livo!</h1>
      <p>Bonjour ${user.firstName},</p>
      <p>Merci de vous être inscrit sur Livo. Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
      <p>Découvrez des milliers de produits et faites-vous livrer en un clin d'œil!</p>
      <a href="${process.env.FRONTEND_URL}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Commencer</a>
    </div>
  `;
  return await this.sendEmail(user.email, "Bienvenue sur Livo!", html);
};

exports.sendOrderStatusEmail = async (user, order, status) => {
  const statusLabels = {
    PENDING: "en attente",
    ACCEPTED: "acceptée",
    PREPARING: "en préparation",
    PICKED_UP: "récupérée",
    DELIVERED: "livrée",
    CANCELLED: "annulée",
  };
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #FF6B35;">Mise à jour de votre commande</h1>
      <p>Bonjour ${user.firstName},</p>
      <p>Votre commande #${order.id.slice(0, 8)} est maintenant <strong>${statusLabels[status] || status}</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/orders/${order.id}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Suivre ma commande</a>
    </div>
  `;
  return await this.sendEmail(user.email, `Commande ${statusLabels[status]} - Livo`, html);
};
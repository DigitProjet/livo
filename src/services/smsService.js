// Configuration SMS (Orange Mali API, etc.)

exports.sendSMS = async (phoneNumber, message) => {
  try {
    // À intégrer avec API Orange Mali SMS ou autre fournisseur
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // Simulation
    return { success: true, message: "SMS sent" };
  } catch (error) {
    console.error("SMS error:", error);
    return { success: false, error: error.message };
  }
};

exports.sendOTP = async (phoneNumber, otp) => {
  return await this.sendSMS(phoneNumber, `Votre code Livo: ${otp}. Valable 5 minutes.`);
};

exports.sendOrderNotification = async (phoneNumber, orderId, status) => {
  const messages = {
    PENDING: `Votre commande #${orderId.slice(0, 8)} a été reçue.`,
    ACCEPTED: `Votre commande #${orderId.slice(0, 8)} a été acceptée par le marchand.`,
    PICKED_UP: `Votre commande #${orderId.slice(0, 8)} a été récupérée par le livreur.`,
    DELIVERED: `Votre commande #${orderId.slice(0, 8)} a été livrée! Merci d'avoir choisi Livo.`,
  };
  
  if (messages[status]) {
    return await this.sendSMS(phoneNumber, messages[status]);
  }
  return null;
};
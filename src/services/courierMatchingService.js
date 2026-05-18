const Courier = require("../models/courier");
const Delivery = require("../models/delivery");
const { Op } = require("sequelize");
const { calculateDistance } = require("./geocodingService");

// Trouver le meilleur livreur pour une livraison
exports.findBestCourier = async (pickupLat, pickupLon, zone = null) => {
  try {
    const where = {
      availabilityStatus: "AVAILABLE",
      isVerified: true,
    };
    
    if (zone) {
      where.zone = zone;
    }
    
    const couriers = await Courier.findAll({ where });
    
    if (couriers.length === 0) return null;
    
    // Calculer la distance pour chaque livreur
    const couriersWithDistance = couriers.map(courier => ({
      ...courier.toJSON(),
      distance: calculateDistance(
        pickupLat,
        pickupLon,
        parseFloat(courier.currentLatitude || pickupLat),
        parseFloat(courier.currentLongitude || pickupLon)
      ),
    }));
    
    // Trier par distance
    couriersWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Retourner le plus proche
    return couriersWithDistance[0];
  } catch (error) {
    console.error("Courier matching error:", error);
    return null;
  }
};

// Notifier les livreurs disponibles
exports.notifyAvailableCouriers = async (deliveryId, pickupLat, pickupLon, zone) => {
  const bestCourier = await this.findBestCourier(pickupLat, pickupLon, zone);
  
  if (bestCourier) {
    // Logique pour notifier via WebSocket ou push notification
    // Pour l'instant, retourne simplement le meilleur livreur
    return bestCourier;
  }
  
  return null;
};
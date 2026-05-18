// Service de géolocalisation et calcul de distance

const axios = require("axios");

// Configuration OSM Nominatim ou Google Maps
const GEOCODING_API = process.env.GEOCODING_API || "https://nominatim.openstreetmap.org";

exports.geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`${GEOCODING_API}/search`, {
      params: {
        q: address,
        format: "json",
        limit: 1,
      },
    });
    
    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon),
        displayName: response.data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon terrestre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.estimateDeliveryTime = (distanceKm) => {
  // 30 km/h en moyenne en ville
  const timeHours = distanceKm / 30;
  const timeMinutes = Math.ceil(timeHours * 60);
  return Math.max(15, timeMinutes); // Minimum 15 minutes
};

exports.calculateDeliveryFee = (distanceKm, baseFee = 500) => {
  const feePerKm = 100;
  return Math.ceil(baseFee + distanceKm * feePerKm);
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
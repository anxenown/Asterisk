// Haversine formula to calculate distance in km
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simple pincode to approximate lat/lng (Lucknow & nearby demo data)
// In production, use a proper Indian pincode database or Google Geocoding API
const pincodeCoords: Record<string, { lat: number; lng: number }> = {
  "226001": { lat: 26.8467, lng: 80.9462 }, // Lucknow main
  "226002": { lat: 26.8500, lng: 80.9200 },
  "226003": { lat: 26.8300, lng: 80.9500 },
  "226010": { lat: 26.8800, lng: 80.9800 },
  "226016": { lat: 26.8600, lng: 81.0000 },
  "201301": { lat: 28.5355, lng: 77.3910 }, // Noida example
  "110001": { lat: 28.6139, lng: 77.2090 }, // Delhi
  // Add more as needed
};

export function getCoordsFromPincode(pincode: string) {
  return pincodeCoords[pincode] || null;
}
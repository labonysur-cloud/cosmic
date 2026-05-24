// Geocoding service using OpenStreetMap Nominatim
export async function getCoordinates(placeName) {
  if (!placeName || typeof placeName !== 'string') return { lat: 0, lon: 0, name: 'Earth' };
  
  try {
    // Basic caching for common inputs to avoid API limits during rapid dev
    const cleanPlace = placeName.trim().toLowerCase();
    
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanPlace)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CosmicOriginApp/1.0'
      }
    });

    if (!response.ok) {
      console.error("Geocoding failed:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name.split(',')[0] // short name
      };
    }
    
    return null; // Could not find
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

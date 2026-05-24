export async function getNASAImageForDate(dateStr) {
  try {
    // We use the DEMO_KEY for now. In production, this should be an environment variable.
    // The APOD API requires date in YYYY-MM-DD format.
    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toISOString().split('T')[0];
    
    // API limitation: APOD only goes back to 1995-06-16
    const minDate = new Date('1995-06-16');
    let queryDate = formattedDate;
    
    if (dateObj < minDate) {
      // If before APOD started, get the image from exactly the same month/day but in a recent year,
      // or just fallback to the earliest APOD image for demonstration.
      queryDate = '1995-06-16'; 
    }

    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${queryDate}`);
    
    if (!response.ok) {
      console.error("NASA API Error:", response.statusText);
      return null;
    }

    const data = await response.json();
    let url = data.hdurl || data.url;
    
    // Proxy images to fix CORS issues (which block rendering and html2canvas)
    if (data.media_type === "image" && url) {
      url = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    return {
      title: data.title,
      url: url,
      explanation: data.explanation,
      copyright: data.copyright || "Public Domain",
      mediaType: data.media_type
    };
  } catch (error) {
    console.error("Failed to fetch NASA data:", error);
    return null;
  }
}

export async function getNASAImagesForDate(dateStr) {
  try {
    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    // Search NASA's entire library for things around that year that are related to space/earth
    const res = await fetch(`https://images-api.nasa.gov/search?q=space&year_start=${year}&year_end=${year}&media_type=image`);
    if (!res.ok) return [];
    
    const data = await res.json();
    if (data.collection && data.collection.items && data.collection.items.length > 0) {
      // shuffle and get 4
      const items = data.collection.items.sort(() => 0.5 - Math.random()).slice(0, 4);
      return items.map(item => ({
        title: item.data[0].title,
        explanation: item.data[0].description,
        url: item.links[0].href,
        date_created: item.data[0].date_created
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch NASA Library images:", error);
    return [];
  }
}

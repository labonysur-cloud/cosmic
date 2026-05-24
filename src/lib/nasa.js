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

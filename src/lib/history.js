export async function getHistoricalEvents(dateStr) {
  try {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Using Wikipedia's REST API
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const events = data.events || [];
    
    // Pick 3 random interesting events
    const filteredEvents = events.filter(e => e.year && e.text).sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return filteredEvents.map(e => ({
      year: e.year,
      text: e.text
    })).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  } catch (error) {
    console.error("Failed to fetch historical events:", error);
    return [];
  }
}

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

export async function getWaybackMachineSnapshots(dateStr) {
  try {
    const timestamp = dateStr.replace(/-/g, '');
    const urls = ['nytimes.com', 'apple.com', 'yahoo.com'];
    const snapshots = [];
    
    // We can do Promise.all for speed
    const fetches = urls.map(url => 
      fetch(`https://archive.org/wayback/available?url=${url}&timestamp=${timestamp}`)
        .then(r => r.json())
        .then(data => {
          if (data.archived_snapshots && data.archived_snapshots.closest) {
            snapshots.push({
              site: url,
              url: data.archived_snapshots.closest.url,
              timestamp: data.archived_snapshots.closest.timestamp
            });
          }
        })
        .catch(err => console.error(err))
    );
    
    await Promise.all(fetches);
    return snapshots;
  } catch (err) {
    console.error("Failed to fetch Wayback Machine:", err);
    return [];
  }
}

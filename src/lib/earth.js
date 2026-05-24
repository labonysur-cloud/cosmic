export function getEarthStats(dateStr, lat) {
  const date = new Date(dateStr);
  const month = date.getMonth();
  
  let season = "Unknown Season";
  
  if (lat != null) {
    const isNorthern = lat >= 0;
    if (month === 11 || month <= 1) season = isNorthern ? "Winter" : "Summer";
    else if (month >= 2 && month <= 4) season = isNorthern ? "Spring" : "Autumn";
    else if (month >= 5 && month <= 7) season = isNorthern ? "Summer" : "Winter";
    else if (month >= 8 && month <= 10) season = isNorthern ? "Autumn" : "Spring";
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = days[date.getDay()];
  
  // Calculate day of the year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Approximate distance from sun
  const distanceCalc = 149.6 - 2.5 * Math.cos(((dayOfYear - 3) / 365.25) * 2 * Math.PI);
  
  return {
    season: lat != null ? season : null,
    dayOfWeek,
    distanceFromSun: `${distanceCalc.toFixed(2)} million km`
  };
}

import { MoonPhase, SearchMoonPhase, Observer, Equator, Ecliptic, Body, MakeTime, Horizon } from 'astronomy-engine';

export function getMoonPhaseDetails(date) {
  const phaseAngle = MoonPhase(date);
  const phaseFraction = phaseAngle / 360;

  let phaseName = "";
  if (phaseAngle < 1.8 || phaseAngle > 358.2) phaseName = "New Moon";
  else if (phaseAngle < 88.2) phaseName = "Waxing Crescent";
  else if (phaseAngle < 91.8) phaseName = "First Quarter";
  else if (phaseAngle < 178.2) phaseName = "Waxing Gibbous";
  else if (phaseAngle < 181.8) phaseName = "Full Moon";
  else if (phaseAngle < 268.2) phaseName = "Waning Gibbous";
  else if (phaseAngle < 271.8) phaseName = "Third Quarter";
  else phaseName = "Waning Crescent";

  return { angle: phaseAngle, fraction: phaseFraction, name: phaseName };
}

// Calculates accurate planetary visibility using exact latitude and longitude
export function getVisiblePlanets(date, lat, lon) {
  const planets = [Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn];
  
  const astroTime = MakeTime(date);
  
  if (lat == null || lon == null) {
    // Fallback if no location: just use ecliptic difference like before
    let sunEcliptic;
    try { sunEcliptic = Ecliptic(Body.Sun, astroTime); } catch(e) { return []; }
    let visible = [];
    for (let body of planets) {
      try {
        const bodyEcliptic = Ecliptic(body, astroTime);
        const diff = Math.abs(bodyEcliptic.elon - sunEcliptic.elon);
        if (diff > 20 && diff < 340) {
          let name = "Planet";
          if (body === Body.Venus) name = "Venus";
          if (body === Body.Mars) name = "Mars";
          if (body === Body.Jupiter) name = "Jupiter";
          if (body === Body.Saturn) name = "Saturn";
          visible.push(name);
        }
      } catch(e) {}
    }
    return visible;
  }

  const observer = new Observer(lat, lon, 0);
  
  let visible = [];
  for (let body of planets) {
    try {
      const equator = Equator(body, astroTime, observer, true, true);
      const horizon = Horizon(astroTime, observer, equator.ra, equator.dec, 'normal');
      
      // If altitude is > 0, it is above the horizon at that exact time and location
      if (horizon.altitude > 0) {
        let name = "Planet";
        if (body === Body.Venus) name = "Venus";
        if (body === Body.Mars) name = "Mars";
        if (body === Body.Jupiter) name = "Jupiter";
        if (body === Body.Saturn) name = "Saturn";
        visible.push(name);
      }
    } catch(e) {}
  }
  return visible;
}

export function generatePoeticStory(moonPhase, visiblePlanets, timeStr, locationName) {
  const planetStr = visiblePlanets.length > 0 
    ? `while ${visiblePlanets.join(" and ")} watched from above the horizon.` 
    : `in a quiet sky bathed in ancient starlight.`;

  let locationText = locationName ? ` above ${locationName}` : "";
  let timeText = timeStr ? ` at precisely ${timeStr}` : "";

  return `On the night you arrived${locationText}${timeText}, the Moon glowed softly as a ${moonPhase}, ${planetStr} Across the cosmos, ancient light traveled millions of years to meet your sky.`;
}

export function getRealInfo({ dateStr, timeStr, lat, lon, locationName }) {
  // Combine date and time
  let dtStr = dateStr;
  if (timeStr) {
    dtStr = `${dateStr}T${timeStr}:00`;
  } else {
    dtStr = `${dateStr}T00:00:00`;
  }
  const date = new Date(dtStr);
  const phaseDetails = getMoonPhaseDetails(date);
  
  // Calculate visibility based on accurate lat/lon and exact time
  const visiblePlanets = getVisiblePlanets(date, lat, lon);
  
  let dateFormatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // If no time was provided, use UTC date to avoid timezone shifting the day
  if (!timeStr) {
     const [year, month, day] = dateStr.split('-');
     const utcDate = new Date(Date.UTC(year, month - 1, day));
     dateFormatted = utcDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }

  return {
    date: dateFormatted,
    time: timeStr || null,
    location: locationName || null,
    moonPhase: phaseDetails.name,
    moonPhaseFraction: phaseDetails.fraction,
    visiblePlanets,
    story: generatePoeticStory(phaseDetails.name, visiblePlanets, timeStr, locationName)
  };
}

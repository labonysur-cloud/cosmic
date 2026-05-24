import { Ecliptic, Body, MakeTime } from 'astronomy-engine';

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function getZodiacSign(longitude) {
  const index = Math.floor((longitude % 360) / 30);
  return ZODIAC_SIGNS[index];
}

function getZodiacTraits(sunSign, moonSign) {
  const traits = {
    Aries: { core: "bold and pioneering", future: "forge new paths where others hesitate" },
    Taurus: { core: "steadfast and grounded", future: "build lasting foundations of beauty and strength" },
    Gemini: { core: "curious and adaptable", future: "connect disparate worlds through your ideas" },
    Cancer: { core: "nurturing and deeply intuitive", future: "create sanctuaries of emotional warmth" },
    Leo: { core: "radiant and fiercely loyal", future: "inspire others through your natural leadership" },
    Virgo: { core: "analytical and devoted", future: "bring order and healing to complex systems" },
    Libra: { core: "harmonious and diplomatic", future: "restore balance and justice in your spheres" },
    Scorpio: { core: "intense and transformative", future: "uncover hidden truths and undergo profound rebirths" },
    Sagittarius: { core: "adventurous and philosophical", future: "seek wisdom across physical and mental horizons" },
    Capricorn: { core: "disciplined and ambitious", future: "scale great heights through persistent effort" },
    Aquarius: { core: "innovative and visionary", future: "catalyze progressive change for the collective" },
    Pisces: { core: "compassionate and imaginative", future: "channel boundless creativity into the world" }
  };

  const sunData = traits[sunSign] || traits.Aries;
  const moonData = traits[moonSign] || traits.Cancer;

  return `Born with the Sun in ${sunSign}, your core essence is ${sunData.core}. The Moon in ${moonSign} reveals an inner emotional landscape that is ${moonData.core}. Your destiny is written in the stars: you are meant to ${sunData.future}, while finding fulfillment as you ${moonData.future}.`;
}

export function getAstrologicalData(dateStr, timeStr) {
  let dtStr = dateStr;
  if (timeStr) dtStr = `${dateStr}T${timeStr}:00`;
  else dtStr = `${dateStr}T12:00:00`; // default to noon for better accuracy if time is missing
  
  const date = new Date(dtStr);
  const astroTime = MakeTime(date);
  
  try {
    const sunEcliptic = Ecliptic(Body.Sun, astroTime);
    const moonEcliptic = Ecliptic(Body.Moon, astroTime);
    
    const sunSign = getZodiacSign(sunEcliptic.elon);
    const moonSign = getZodiacSign(moonEcliptic.elon);
    
    return {
      sunSign,
      moonSign,
      reading: getZodiacTraits(sunSign, moonSign)
    };
  } catch(e) {
    console.error("Astrology engine error:", e);
    return null;
  }
}

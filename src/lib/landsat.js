export function getLandsatLetters(name) {
  if (!name) return [];
  const chars = name.toLowerCase().replace(/[^a-z]/g, '').split('');
  return chars.map((char, i) => ({
    id: `${char}-${i}`,
    char: char.toUpperCase(),
    // Using a public archive of the genuine NASA Landsat Alphabet images
    url: `https://raw.githubusercontent.com/Hevarh1/NasaGeoSpeller/main/assets/${char}/0.jpg`
  }));
}

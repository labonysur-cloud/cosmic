const landsatImages = {
  a: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80",
  b: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=200&q=80",
  c: "https://images.unsplash.com/photo-1541873676-a18131494184?auto=format&fit=crop&w=200&q=80",
  d: "https://images.unsplash.com/photo-1534996858221-380b92700493?auto=format&fit=crop&w=200&q=80",
  e: "https://images.unsplash.com/photo-1506443432622-d3365c6942c7?auto=format&fit=crop&w=200&q=80",
  f: "https://images.unsplash.com/photo-1483653364400-eedf5efa43d1?auto=format&fit=crop&w=200&q=80",
  g: "https://images.unsplash.com/photo-1446903022384-5f80b90e66da?auto=format&fit=crop&w=200&q=80",
  h: "https://images.unsplash.com/photo-1493606371202-6275828f90f3?auto=format&fit=crop&w=200&q=80",
  i: "https://images.unsplash.com/photo-1532001712282-3c1356fcba3c?auto=format&fit=crop&w=200&q=80",
  j: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=200&q=80",
  k: "https://images.unsplash.com/photo-1487147264018-f937fba0c817?auto=format&fit=crop&w=200&q=80",
  l: "https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?auto=format&fit=crop&w=200&q=80",
  m: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&w=200&q=80",
  n: "https://images.unsplash.com/photo-1481819613568-3701cbc70156?auto=format&fit=crop&w=200&q=80",
  o: "https://images.unsplash.com/photo-1498677231914-50faa5be5142?auto=format&fit=crop&w=200&q=80",
  p: "https://images.unsplash.com/photo-1445905595283-21f8ae8a33d2?auto=format&fit=crop&w=200&q=80",
  q: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&w=200&q=80",
  r: "https://images.unsplash.com/photo-1484589065579-248aad0d8e13?auto=format&fit=crop&w=200&q=80",
  s: "https://images.unsplash.com/photo-1501862700950-18382cd41497?auto=format&fit=crop&w=200&q=80",
  t: "https://images.unsplash.com/photo-1485664187285-d60155026857?auto=format&fit=crop&w=200&q=80",
  u: "https://images.unsplash.com/photo-1470534241031-c06e33f389fb?auto=format&fit=crop&w=200&q=80",
  v: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=200&q=80",
  w: "https://images.unsplash.com/photo-1483086431886-3590a88317fe?auto=format&fit=crop&w=200&q=80",
  x: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&w=200&q=80",
  y: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=200&q=80",
  z: "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?auto=format&fit=crop&w=200&q=80"
};

export function getLandsatLetters(name) {
  if (!name) return [];
  const chars = name.toLowerCase().replace(/[^a-z]/g, '').split('');
  return chars.map((char, i) => ({
    id: `${char}-${i}`,
    char: char.toUpperCase(),
    url: landsatImages[char] || landsatImages['a']
  }));
}

import React from 'react';

export default function PremiumMoon({ phaseAngle, phaseName, dateStr }) {
  // phaseAngle: 0 to 360
  const getMoonPhasePath = (angle) => {
    const rad = (angle / 180) * Math.PI;
    const r = 100;
    
    let path = "";
    if (angle <= 180) {
      let cos = Math.cos(rad); 
      if (angle <= 90) {
        path = `M 100,0 A 100,100 0 0,1 100,200 A ${r * cos},100 0 0,0 100,0`;
      } else {
        path = `M 100,0 A 100,100 0 0,1 100,200 A ${r * Math.abs(cos)},100 0 0,1 100,0`;
      }
    } else {
      let cos = Math.cos(rad);
      if (angle <= 270) {
        path = `M 100,0 A 100,100 0 0,0 100,200 A ${r * Math.abs(cos)},100 0 0,0 100,0`;
      } else {
        path = `M 100,0 A 100,100 0 0,0 100,200 A ${r * cos},100 0 0,1 100,0`;
      }
    }
    return path;
  };

  const pathD = getMoonPhasePath(phaseAngle);

  // A very high-res crisp photo of the moon.
  const moonImageUrl = "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=800";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: '#0a0a0a', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ borderRadius: '50%' }}>
          <defs>
            <mask id="moonMask">
              <path d={pathD} fill="white" />
            </mask>
            <radialGradient id="sphereShading" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#444444" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
            </radialGradient>
          </defs>
          <image href={moonImageUrl} width="200" height="200" mask="url(#moonMask)" />
          {/* Add a 3D spherical shading overlay for a premium volumetric feel */}
          <circle cx="100" cy="100" r="100" fill="url(#sphereShading)" style={{ mixBlendMode: 'multiply' }} />
        </svg>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#e0e0e0', letterSpacing: '1px' }}>{phaseName}</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#888' }}>{new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
    </div>
  );
}

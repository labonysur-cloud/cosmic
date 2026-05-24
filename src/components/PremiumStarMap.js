import React, { useEffect, useRef, useState } from 'react';
import * as ast from 'astronomy-engine';

export default function PremiumStarMap({ dateStr, lat, lon, locationName }) {
  const canvasRef = useRef(null);
  const [stars, setStars] = useState(null);
  const [constellations, setConstellations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/stars.json').then(res => res.json()),
      fetch('/data/constellations.json').then(res => res.json())
    ]).then(([starsData, constellationsData]) => {
      setStars(starsData.features);
      setConstellations(constellationsData.features);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load celestial data:", err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!stars || !canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = window.devicePixelRatio || 1;
    const width = 800;
    const height = 800;
    
    // Internal coordinate size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.maxWidth = '600px';
    canvas.style.aspectRatio = '1 / 1';

    const observer = new ast.Observer(lat, lon, 0);
    const date = new Date(dateStr);

    const radius = Math.min(width, height) / 2 - 20;
    const centerX = width / 2;
    const centerY = height / 2;

    let rotationAngle = 0; // Slowly rotate over time

    // Helper to map RA(deg), Dec(deg) to canvas X,Y
    const project = (ra_deg, dec_deg) => {
      const ra_hours = (ra_deg < 0 ? ra_deg + 360 : ra_deg) / 15;
      const hor = ast.Horizon(date, observer, ra_hours, dec_deg, 'normal');
      
      // Altitude is 0 at horizon, 90 at zenith. We only show alt > 0.
      if (hor.altitude < 0) return null; 

      // Stereographic projection: distance from center = (90 - alt) / 90 * R
      const r = radius * ((90 - hor.altitude) / 90);
      
      // Azimuth: 0=N, 90=E, 180=S, 270=W
      // Canvas: 0 is Right, 90 is Down. We want N (-90 canvas) to be UP.
      const az = hor.azimuth;
      const theta = (az - 90) * Math.PI / 180;
      
      return {
        x: centerX + r * Math.cos(theta),
        y: centerY + r * Math.sin(theta)
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Rotate entire canvas slowly for "premium" feel
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);
      ctx.translate(-centerX, -centerY);

      // Draw background space
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      bgGradient.addColorStop(0, '#0a0d14');
      bgGradient.addColorStop(1, '#05070a');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = bgGradient;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.stroke();

      // Draw graticule (Polar grid)
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.5;
      // Concentric circles (altitudes)
      for (let alt = 15; alt < 90; alt += 15) {
        ctx.beginPath();
        const r = radius * ((90 - alt) / 90);
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.stroke();
      }
      // Radial lines (azimuths)
      for (let az = 0; az < 360; az += 30) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const theta = (az - 90) * Math.PI / 180;
        ctx.lineTo(centerX + radius * Math.cos(theta), centerY + radius * Math.sin(theta));
        ctx.stroke();
      }

      // Draw Constellation Lines
      if (constellations) {
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        constellations.forEach(c => {
          c.geometry.coordinates.forEach(line => {
            let started = false;
            ctx.beginPath();
            line.forEach(coord => {
              const pt = project(coord[0], coord[1]);
              if (pt) {
                if (!started) {
                  ctx.moveTo(pt.x, pt.y);
                  started = true;
                } else {
                  ctx.lineTo(pt.x, pt.y);
                }
              } else {
                started = false;
              }
            });
            ctx.stroke();
          });
        });
      }

      // Draw Stars
      stars.forEach(s => {
        const mag = s.properties.mag;
        if (mag > 6) return; // Only naked eye visible
        const pt = project(s.geometry.coordinates[0], s.geometry.coordinates[1]);
        if (pt) {
          // Brighter stars are larger. Mag 0 is very bright, Mag 6 is faint.
          const size = Math.max(0.5, 3 - (mag / 2));
          const opacity = Math.max(0.2, 1 - (mag / 6));
          
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(255,255,255,${opacity})`;
          ctx.fill();

          // Glow for very bright stars
          if (mag < 2) {
             ctx.beginPath();
             ctx.arc(pt.x, pt.y, size * 3, 0, 2 * Math.PI);
             ctx.fillStyle = `rgba(255,255,255,0.1)`;
             ctx.fill();
          }
        }
      });

      ctx.restore();

      rotationAngle += 0.0002;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dateStr, lat, lon, stars, constellations, loading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', fontFamily: "'Inter', sans-serif" }}>
      {loading && <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>Consulting the celestial spheres...</div>}
      
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <canvas ref={canvasRef} style={{ display: loading ? 'none' : 'block' }}></canvas>
        
        {/* Cardinal Directions Overlay */}
        {!loading && (
          <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '600px', margin: '0 auto', aspectRatio: '1/1' }}>
             <div style={{ position: 'absolute', top: '10px', color: '#fff', fontSize: '10px', opacity: 0.5 }}>N</div>
             <div style={{ position: 'absolute', bottom: '10px', color: '#fff', fontSize: '10px', opacity: 0.5 }}>S</div>
             <div style={{ position: 'absolute', right: '10px', color: '#fff', fontSize: '10px', opacity: 0.5 }}>E</div>
             <div style={{ position: 'absolute', left: '10px', color: '#fff', fontSize: '10px', opacity: 0.5 }}>W</div>
          </div>
        )}
      </div>

      {!loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h3 style={{ margin: '0', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', color: '#ffffff', opacity: 0.9 }}>The Night Sky</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#ffffff', opacity: 0.7 }}>{locationName}</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#ffffff', opacity: 0.5 }}>
            {new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#ffffff', opacity: 0.4 }}>
            {lat.toFixed(4)}&deg; {lat >= 0 ? 'N' : 'S'} / {Math.abs(lon).toFixed(4)}&deg; {lon >= 0 ? 'E' : 'W'}
          </p>
        </div>
      )}
    </div>
  );
}

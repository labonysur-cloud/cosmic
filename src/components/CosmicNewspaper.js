import React from "react";

const MoonPhaseVisual = ({ fraction }) => {
  const isWaxing = fraction <= 0.5;
  const ill = fraction <= 0.5 ? fraction * 2 : 2 - fraction * 2;
  
  const sweepBase = isWaxing ? 1 : 0; 
  
  let rx = 50 - (ill * 100);
  let sweepTerm = 0;
  if (rx < 0) {
     rx = -rx;
     sweepTerm = 1;
  }
  
  const darkColor = "#2b2b2b";
  const lightColor = "#e6e6e6";

  return (
    <svg width="80" height="80" viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>
      <circle cx="50" cy="50" r="49" fill={darkColor} />
      <path 
        d={`M 50,1 A 49,49 0 0,${sweepBase} 50,99 A ${rx},49 0 0,${sweepTerm} 50,1`} 
        fill={lightColor} 
      />
      {/* Craters */}
      <circle cx="30" cy="40" r="5" fill="rgba(0,0,0,0.15)" />
      <circle cx="70" cy="60" r="8" fill="rgba(0,0,0,0.15)" />
      <circle cx="45" cy="75" r="4" fill="rgba(0,0,0,0.15)" />
      <circle cx="50" cy="50" r="49" fill="none" stroke="#2b2b2b" strokeWidth="2" />
    </svg>
  );
};

const CosmicNewspaper = React.forwardRef(({ cosmicData, nasaData }, ref) => {
  if (!cosmicData) return null;

  return (
    <div
      ref={ref}
      style={{
        width: "900px",
        minHeight: "1200px",
        padding: "50px",
        backgroundColor: "#f0ebd8", // vintage paper
        color: "#2b2b2b",
        fontFamily: "'Playfair Display', serif",
        position: "absolute",
        left: "-9999px",
        top: 0,
        boxSizing: "border-box",
        border: "1px solid #dcd3b6",
        boxShadow: "inset 0 0 150px rgba(139, 115, 85, 0.15)",
        backgroundImage: "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)",
        backgroundSize: "4px 4px",
      }}
    >
      <div style={{ border: "4px double #2b2b2b", padding: "40px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        
        {/* Masthead */}
        <div style={{ textAlign: "center", borderBottom: "3px solid #2b2b2b", paddingBottom: "20px", marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", textTransform: "uppercase", borderBottom: "1px solid #2b2b2b", paddingBottom: "10px", marginBottom: "15px", fontWeight: "bold" }}>
            <span>No. 1 &mdash; Verified Historical Record</span>
            <span>{cosmicData.date}</span>
            <span>Price: One Cosmos</span>
          </div>
          <h1 style={{ fontSize: "56px", margin: "0 0 10px 0", textTransform: "uppercase", lineHeight: "1", letterSpacing: "2px" }}>
            The Cosmic Archive
          </h1>
          <h2 style={{ fontSize: "20px", fontStyle: "italic", fontWeight: "normal", margin: 0, color: "#4a4a4a" }}>
            A Chronicle of the Heavens & Earth on the Night You Arrived
          </h2>
        </div>

        {/* CSS Grid Layout for Articles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", flex: 1 }}>
          
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* Top Left: Astronomy & Poetic Story */}
            <article>
              <h3 style={{ fontSize: "26px", borderBottom: "2px solid #2b2b2b", paddingBottom: "5px", marginBottom: "15px", textTransform: "uppercase", lineHeight: "1.1" }}>
                Astronomical Conditions
              </h3>
              
              <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px", padding: "15px", backgroundColor: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.1)" }}>
                <MoonPhaseVisual fraction={cosmicData.moonPhaseFraction} />
                <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                  <p style={{ margin: "0 0 3px 0" }}><strong>Moon Phase:</strong> {cosmicData.moonPhase}</p>
                  <p style={{ margin: "0 0 3px 0" }}><strong>Location:</strong> {cosmicData.location || "Unknown"}</p>
                  <p style={{ margin: "0 0 3px 0" }}><strong>Time:</strong> {cosmicData.time || "Unknown"}</p>
                  <p style={{ margin: 0 }}><strong>Planets:</strong> {cosmicData.visiblePlanets && cosmicData.visiblePlanets.length > 0 ? cosmicData.visiblePlanets.join(", ") : "None visible"}</p>
                </div>
              </div>

              <div style={{ fontStyle: "italic", fontSize: "15px", lineHeight: "1.8", textAlign: "justify" }}>
                <span style={{ fontSize: "48px", float: "left", lineHeight: "0.8", marginRight: "8px", marginTop: "8px", fontFamily: "'Playfair Display', serif" }}>{cosmicData.story.charAt(0)}</span>
                {cosmicData.story.substring(1)}
              </div>
            </article>

            {/* Middle Left: The beautiful landscape name feature */}
            {cosmicData.landsat && cosmicData.landsat.length > 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "15px", color: "#555", borderBottom: "1px solid #dcd3b6", paddingBottom: "5px" }}>
                  A Name Etched in Earth
                </span>
                <div style={{ display: "flex", gap: "3px", justifyContent: "center", flexWrap: "wrap", marginBottom: "10px" }}>
                  {cosmicData.landsat.map(l => (
                    <img key={l.id} src={l.url} alt={l.char} crossOrigin="anonymous" style={{ width: "clamp(40px, 8vw, 65px)", height: "clamp(40px, 8vw, 65px)", objectFit: "cover", filter: "sepia(0.4) contrast(1.1) brightness(0.9)", border: "2px solid #2b2b2b", padding: "1px" }} />
                  ))}
                </div>
                <div style={{ fontSize: "24px", fontStyle: "italic", marginTop: "10px", color: "#4a4a4a" }}>
                  {cosmicData.lastName}
                </div>
              </div>
            )}

            {/* Bottom Left: Astrology */}
            <article style={{ borderTop: "2px dashed #2b2b2b", paddingTop: "20px", marginTop: "auto" }}>
              <h3 style={{ fontSize: "20px", marginBottom: "15px", textTransform: "uppercase", textAlign: "center" }}>
                Character & Destiny
              </h3>
              {cosmicData.astrology ? (
                <div style={{ fontSize: "14px", lineHeight: "1.7", textAlign: "justify" }}>
                  <p style={{ textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
                    Sun in {cosmicData.astrology.realSunConstellation} &nbsp;&bull;&nbsp; Moon in {cosmicData.astrology.realMoonConstellation}
                  </p>
                  <p style={{ margin: 0 }}>{cosmicData.astrology.reading}</p>
                </div>
              ) : (
                <p style={{ fontStyle: "italic", textAlign: "center" }}>Astrological readings are obscured by stardust.</p>
              )}
            </article>

          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px", borderLeft: "2px solid #2b2b2b", paddingLeft: "40px" }}>
            
            {/* Top Right: NASA Image */}
            <article>
              <h3 style={{ fontSize: "26px", borderBottom: "2px solid #2b2b2b", paddingBottom: "5px", marginBottom: "15px", textTransform: "uppercase", lineHeight: "1.1" }}>
                NASA Archive Discovery
              </h3>
              
              {nasaData ? (
                <div>
                  {nasaData.mediaType === "video" ? (
                    <iframe
                      src={nasaData.url}
                      title={nasaData.title}
                      frameBorder="0"
                      allow="encrypted-media"
                      allowFullScreen
                      style={{ width: "100%", aspectRatio: "16/9", border: "4px solid #2b2b2b", padding: "2px", backgroundColor: "#fff", marginBottom: "10px" }}
                    />
                  ) : (
                    <img 
                      src={nasaData.url} 
                      alt={nasaData.title} 
                      crossOrigin="anonymous"
                      style={{ width: "100%", filter: "sepia(0.3) contrast(1.1) brightness(0.9)", border: "4px solid #2b2b2b", padding: "2px", backgroundColor: "#fff", marginBottom: "10px" }} 
                    />
                  )}
                  <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", textAlign: "center" }}>{nasaData.title}</h4>
                  <p style={{ fontSize: "12px", textAlign: "justify", lineHeight: "1.6" }}>
                    {nasaData.explanation.substring(0, 400)}...
                  </p>
                </div>
              ) : (
                <p style={{ fontStyle: "italic" }}>Archive records for this date are currently obscured by cosmic dust.</p>
              )}
            </article>

            {/* Middle Right: Historical Events */}
            <article style={{ borderTop: "2px solid #2b2b2b", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px", textTransform: "uppercase" }}>On This Day In History</h3>
              {cosmicData.history && cosmicData.history.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", lineHeight: "1.5" }}>
                  {cosmicData.history.map((evt, idx) => (
                    <li key={idx} style={{ marginBottom: "8px" }}>
                      <strong>{evt.year}:</strong> {evt.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "13px", fontStyle: "italic" }}>The historical archives are silent for this date.</p>
              )}
            </article>

            {/* The Internet Archive */}
            {cosmicData.wayback && cosmicData.wayback.length > 0 && (
              <article style={{ borderTop: "2px solid #2b2b2b", paddingTop: "20px", marginTop: "20px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "10px", textTransform: "uppercase" }}>The Digital Vault</h3>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", lineHeight: "1.5" }}>
                  {cosmicData.wayback.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: "8px" }}>
                      An archived snapshot of <strong>{s.site}</strong> was permanently recorded in the Wayback Machine on this very day.
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* Bottom Right: Earth Stats */}
            <article style={{ borderTop: "2px solid #2b2b2b", paddingTop: "20px", marginTop: "auto", display: "flex", justifyContent: "space-between", backgroundColor: "rgba(0,0,0,0.03)", padding: "15px", border: "1px solid rgba(0,0,0,0.1)" }}>
               <div style={{ textAlign: "center" }}>
                 <span style={{ fontSize: "10px", textTransform: "uppercase", display: "block" }}>Day of Week</span>
                 <strong>{cosmicData.earth?.dayOfWeek || "Unknown"}</strong>
               </div>
               <div style={{ textAlign: "center", borderLeft: "1px solid rgba(0,0,0,0.1)", borderRight: "1px solid rgba(0,0,0,0.1)", padding: "0 15px" }}>
                 <span style={{ fontSize: "10px", textTransform: "uppercase", display: "block" }}>Season</span>
                 <strong>{cosmicData.earth?.season || "Unknown"}</strong>
               </div>
               <div style={{ textAlign: "center" }}>
                 <span style={{ fontSize: "10px", textTransform: "uppercase", display: "block" }}>Dist. to Sun</span>
                 <strong>{cosmicData.earth?.distanceFromSun || "Unknown"}</strong>
               </div>
            </article>

          </div>
        </div>

      </div>
    </div>
  );
});

CosmicNewspaper.displayName = "CosmicNewspaper";
export default CosmicNewspaper;

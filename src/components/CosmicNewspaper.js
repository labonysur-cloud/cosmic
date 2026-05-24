import React from "react";

const CosmicNewspaper = React.forwardRef(({ cosmicData, nasaData }, ref) => {
  if (!cosmicData) return null;

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        minHeight: "1100px",
        padding: "50px",
        backgroundColor: "#f4eedd", // faded parchment tone
        color: "#2b2b2b",
        fontFamily: "'Playfair Display', serif",
        position: "absolute",
        left: "-9999px",
        top: 0,
        boxSizing: "border-box",
        border: "1px solid #dcd3b6",
        boxShadow: "inset 0 0 100px rgba(139, 115, 85, 0.1)",
        // Adding a subtle noise/grain effect via CSS background gradient
        backgroundImage: "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)",
        backgroundSize: "4px 4px",
      }}
    >
      <div style={{ border: "2px solid #2b2b2b", padding: "40px", height: "100%", boxSizing: "border-box", position: "relative" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #2b2b2b", paddingBottom: "20px", marginBottom: "30px" }}>
          <h4 style={{ textTransform: "uppercase", letterSpacing: "3px", fontSize: "12px", marginBottom: "15px" }}>
            Authentic Historical Record
          </h4>
          <h1 style={{ fontSize: "42px", margin: "0 0 10px 0", textTransform: "uppercase", lineHeight: "1.1" }}>
            The Cosmic Archive
          </h1>
          <h2 style={{ fontSize: "24px", fontStyle: "italic", fontWeight: "normal", margin: 0 }}>
            A Chronicle of the Night You Arrived
          </h2>
        </div>

        {/* Content Columns */}
        <div style={{ display: "flex", gap: "40px" }}>
          
          {/* Left Column (Sky Data & Story) */}
          <div style={{ flex: "1" }}>
            <h3 style={{ borderBottom: "1px solid #2b2b2b", paddingBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Astronomical Conditions
            </h3>
            <p style={{ fontWeight: "bold", marginTop: "15px", fontSize: "18px" }}>Date: {cosmicData.date}</p>
            {cosmicData.time && <p style={{ margin: "5px 0", fontSize: "16px" }}><strong>Time:</strong> {cosmicData.time}</p>}
            {cosmicData.location && <p style={{ margin: "5px 0", fontSize: "16px" }}><strong>Location:</strong> {cosmicData.location}</p>}
            <p style={{ margin: "5px 0" }}><strong>Moon Phase:</strong> {cosmicData.moonPhase}</p>
            <p style={{ margin: "5px 0" }}><strong>Visible Planetary Bodies:</strong> {cosmicData.visiblePlanets && cosmicData.visiblePlanets.length > 0 ? cosmicData.visiblePlanets.join(", ") : "None visible at zenith"}</p>

            <div style={{ marginTop: "40px", fontStyle: "italic", fontSize: "16px", lineHeight: "1.8", textAlign: "justify" }}>
              <span style={{ fontSize: "40px", float: "left", lineHeight: "0.8", marginRight: "8px", marginTop: "8px" }}>O</span>
              {cosmicData.story.substring(1)}
            </div>
            
            <div style={{ marginTop: "40px", borderTop: "1px dashed #2b2b2b", paddingTop: "20px" }}>
              <p style={{ fontSize: "12px", textAlign: "justify", color: "#4a4a4a" }}>
                This record was synthesized from exact planetary positions calculated for the ecliptic and authentic astronomical algorithms. 
                The universe is not static; it is a living memory of light and gravity.
              </p>
            </div>
          </div>

          {/* Right Column (NASA Imagery) */}
          <div style={{ flex: "1", borderLeft: "1px solid #2b2b2b", paddingLeft: "40px" }}>
            <h3 style={{ borderBottom: "1px solid #2b2b2b", paddingBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>
              NASA Archive Discovery
            </h3>
            
            {nasaData ? (
              <div style={{ marginTop: "15px" }}>
                {nasaData.mediaType === "video" ? (
                  <iframe
                    src={nasaData.url}
                    title={nasaData.title}
                    frameBorder="0"
                    allow="encrypted-media"
                    allowFullScreen
                    style={{ width: "100%", aspectRatio: "16/9", border: "4px solid #2b2b2b", padding: "2px", backgroundColor: "#fff" }}
                  />
                ) : (
                  <img 
                    src={nasaData.url} 
                    alt={nasaData.title} 
                    crossOrigin="anonymous"
                    style={{ width: "100%", filter: "sepia(0.6) contrast(1.1) brightness(0.9)", border: "4px solid #2b2b2b", padding: "2px", backgroundColor: "#fff" }} 
                  />
                )}
                <h4 style={{ margin: "15px 0 5px 0", fontSize: "16px" }}>{nasaData.title}</h4>
                <p style={{ fontSize: "12px", textAlign: "justify", lineHeight: "1.6" }}>
                  {nasaData.explanation.substring(0, 500)}...
                </p>
                <p style={{ fontSize: "10px", marginTop: "10px", fontStyle: "italic" }}>
                  Source: NASA Astronomy Picture of the Day API
                  <br />
                  Copyright: {nasaData.copyright || "Public Domain"}
                </p>
              </div>
            ) : (
              <p style={{ marginTop: "15px", fontStyle: "italic" }}>Archive records for this date are currently obscured by cosmic dust.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: "40px", left: "40px", right: "40px", borderTop: "2px solid #2b2b2b", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "12px", textTransform: "uppercase" }}>
          <span>Generated: {new Date().toLocaleDateString()}</span>
          <span>Authentic Scientific Data</span>
          <span>Cosmic Origin Observatory</span>
        </div>
      </div>
    </div>
  );
});

CosmicNewspaper.displayName = "CosmicNewspaper";
export default CosmicNewspaper;

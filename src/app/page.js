"use client";

import { useState, useRef, useEffect } from "react";
import CosmicScene from "@/components/CosmicScene";
import CosmicNewspaper from "@/components/CosmicNewspaper";
import { getRealInfo } from "@/lib/astronomy";
import { getNASAImageForDate, getNASAImagesForDate } from "@/lib/nasa";
import { getHistoricalEvents, getWaybackMachineSnapshots } from "@/lib/history";
import { getAstrologicalData } from "@/lib/astrology";
import { getEarthStats } from "@/lib/earth";
import { getLandsatLetters } from "@/lib/landsat";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [replayStage, setReplayStage] = useState(0); // 0 = landing, 1 = darkness/earth, 2 = moon reveal, 3 = full info
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [cosmicData, setCosmicData] = useState(null);
  const [nasaData, setNasaData] = useState(null);
  
  const newspaperRef = useRef(null);
  const defaultPhaseFraction = 0.5;

  const handleReveal = async (e) => {
    e.preventDefault();
    if (!birthDate) return;

    setIsLoading(true);
    
    let lat = null;
    let lon = null;
    let finalLocationName = birthPlace;
    
    if (birthPlace) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(birthPlace)}`);
        const geoData = await res.json();
        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lon = parseFloat(geoData[0].lon);
          finalLocationName = geoData[0].display_name.split(',')[0]; // Just the first part (e.g. city)
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    }

    const astData = getRealInfo({
      dateStr: birthDate,
      timeStr: birthTime,
      lat,
      lon,
      locationName: finalLocationName
    });
    
    const historyData = await getHistoricalEvents(birthDate);
    const waybackData = await getWaybackMachineSnapshots(birthDate);
    const astrologyData = getAstrologicalData(birthDate, birthTime);
    const earthData = getEarthStats(birthDate, lat);
    const landsatData = getLandsatLetters(firstName);
    const nasaImagesData = await getNASAImagesForDate(birthDate);

    const fullCosmicData = {
      ...astData,
      firstName,
      lastName,
      history: historyData,
      wayback: waybackData,
      astrology: astrologyData,
      earth: earthData,
      landsat: landsatData,
      nasaImages: nasaImagesData
    };

    const nData = await getNASAImageForDate(birthDate);
    
    setCosmicData(fullCosmicData);
    setNasaData(nData);
    
    setIsLoading(false);
    
    // Trigger Cinematic Replay Sequence
    setReplayStage(1); // Zoom to Earth
    setTimeout(() => setReplayStage(2), 4000); // 4 seconds later, Earth zooms out to reveal Moon
    setTimeout(() => setReplayStage(3), 8000); // 8 seconds total, full UI fades in
  };

  const handleDownloadNewspaper = async () => {
    if (!newspaperRef.current) return;
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const element = newspaperRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true, 
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2] 
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Cosmic_Archive_${birthDate}.pdf`);

    } catch (error) {
      console.error("Failed to generate newspaper:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasRevealed = replayStage >= 2;

  return (
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: replayStage >= 3 ? "auto" : "hidden" }}>
      
      {replayStage === 4 && cosmicData && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 0", backgroundColor: "#111" }}>
           <CosmicNewspaper ref={newspaperRef} cosmicData={cosmicData} nasaData={nasaData} />
           <div style={{ marginTop: "40px", display: "flex", gap: "20px" }}>
             <button onClick={handleDownloadNewspaper} className="btn-primary">Download PDF</button>
             <button onClick={() => setReplayStage(3)} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--color-accent)" }}>Back to Dashboard</button>
           </div>
        </div>
      )}

      {/* Export Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "fixed", inset: 0, backgroundColor: "#f4eedd", zIndex: 100,
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              fontFamily: "'Playfair Display', serif", color: "#2b2b2b"
            }}
          >
            <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "url('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/noise.png')" }} />
            <motion.h2 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: "2.5rem", zIndex: 101, letterSpacing: "2px" }}
            >
              Preparing the Archives...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Cosmic Background */}
      <CosmicScene 
        moonPhaseFraction={hasRevealed && cosmicData ? cosmicData.moonPhaseFraction : defaultPhaseFraction} 
        hasRevealed={hasRevealed}
      />

      {/* UI Overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        <AnimatePresence mode="wait">
          {replayStage === 0 && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ pointerEvents: "auto", textAlign: "center", zIndex: 10, marginTop: "20vh" }}
            >
              <h1 style={{ fontSize: "4rem", marginBottom: "1rem", textShadow: "0 4px 20px rgba(0,0,0,0.8)", letterSpacing: "2px" }}>
                Cosmic Origin
              </h1>
              <p style={{ fontSize: "1.2rem", marginBottom: "3rem", color: "var(--color-text-muted)" }}>
                The universe remembers the night you arrived.
              </p>

              <form onSubmit={handleReveal} className="glass-panel" style={{ width: "350px", margin: "0 auto", maxHeight: "60vh", overflowY: "auto" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-accent)" }}>First Name</label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-accent)" }}>Last Name</label>
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
                  </div>
                </div>
                <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-accent)" }}>Date of Arrival</label>
                  <input 
                    type="date" 
                    required 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="input-field" 
                  />
                </div>
                <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-accent)" }}>Exact Time (Optional)</label>
                  <input 
                    type="time" 
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="input-field" 
                  />
                </div>
                <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-accent)" }}>Birth Place</label>
                  <input 
                    type="text" 
                    placeholder="e.g. New York, USA"
                    required
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="input-field" 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={isLoading}>
                  {isLoading ? "Consulting the Archives..." : "Reveal My Cosmic Origin"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Cinematic Overlay Text during Replay Stages */}
          {replayStage === 1 && (
            <motion.div
              key="replay-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10, textAlign: "center" }}
            >
              <h2 style={{ fontSize: "2rem", letterSpacing: "2px", fontWeight: "300", fontStyle: "italic" }}>
                Rewinding the cosmos to {cosmicData?.date}...
              </h2>
            </motion.div>
          )}
          
          {replayStage === 2 && (
            <motion.div
              key="replay-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              style={{ position: "absolute", top: "80%", zIndex: 10, textAlign: "center", width: "100%" }}
            >
              <p style={{ fontSize: "1.5rem", letterSpacing: "1px", fontStyle: "italic" }}>
                "{cosmicData.story}"
              </p>
            </motion.div>
          )}

          {replayStage === 3 && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2 }}
              style={{ pointerEvents: "auto", width: "100%", maxWidth: "1200px", zIndex: 10, margin: "10vh auto", paddingBottom: "10vh" }}
            >
              <h2 style={{ textAlign: "center", fontSize: "3rem", marginBottom: "3rem", letterSpacing: "2px" }}>Your Cosmic Dashboard</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
                
                {/* Landsat Alphabet Card */}
                {cosmicData.landsat && cosmicData.landsat.length > 0 && (
                  <div className="glass-panel" style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--color-accent)", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Your Name in Landsat</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px", marginBottom: "1rem" }}>
                      {cosmicData.landsat.map(l => (
                        <div key={l.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <img src={l.url} alt={`Landsat ${l.char}`} style={{ width: "60px", height: "60px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", objectFit: "cover" }} />
                          <span style={{ fontSize: "10px", marginTop: "5px", color: "#ccc" }}>{l.char}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Spelled using genuine satellite imagery mimicking letterforms.</p>
                  </div>
                )}

                {/* Wayback Machine Card */}
                {cosmicData.wayback && cosmicData.wayback.length > 0 && (
                  <div className="glass-panel" style={{ textAlign: "left" }}>
                    <h3 style={{ color: "var(--color-accent)", marginBottom: "1.5rem", fontSize: "1.2rem" }}>The Internet on this Day</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {cosmicData.wayback.map(s => (
                        <li key={s.site} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>{s.site}</strong>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-accent)" }}>View Archive &rarr;</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "1.5rem" }}>Click to explore the archived websites exactly as they were.</p>
                  </div>
                )}

                {/* Real Constellations & Astronomy */}
                <div className="glass-panel" style={{ textAlign: "left" }}>
                  <h3 style={{ color: "var(--color-accent)", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Real-World Constellations</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                       <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>The Sun resided in</div>
                       <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{cosmicData.astrology?.realSunConstellation}</div>
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                       <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>The Moon resided in</div>
                       <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{cosmicData.astrology?.realMoonConstellation}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>Calculated exactly using their true Right Ascension and Declination.</p>
                </div>

                {/* Real NASA Photos */}
                {cosmicData.nasaImages && cosmicData.nasaImages.length > 0 && (
                  <div className="glass-panel" style={{ textAlign: "left", gridColumn: "1 / -1" }}>
                    <h3 style={{ color: "var(--color-accent)", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Real NASA Archives from {cosmicData.date.split('-')[0]}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                      {cosmicData.nasaImages.map((img, i) => (
                        <div key={i} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <img src={img.url} alt={img.title} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                          <div style={{ padding: "10px", fontSize: "0.8rem" }}>
                            <strong>{img.title}</strong>
                            <p style={{ color: "var(--color-text-muted)", margin: "5px 0 0 0", fontSize: "0.7rem", height: "40px", overflow: "hidden" }}>{img.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
                <button 
                  onClick={() => setReplayStage(4)} 
                  className="btn-primary" 
                  style={{ background: "linear-gradient(135deg, rgba(200,180,120,0.2), rgba(200,180,120,0.05))", borderColor: "rgba(200,180,120,0.4)", fontSize: "1.2rem", padding: "1rem 2rem" }}
                >
                  Compile Cosmic Newspaper
                </button>
                <button 
                  onClick={() => setReplayStage(0)} 
                  className="btn-primary" 
                  style={{ fontSize: "1.2rem", padding: "1rem 2rem" }}
                >
                  Return to Earth
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

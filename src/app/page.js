"use client";

import { useState, useRef, useEffect } from "react";
import CosmicScene from "@/components/CosmicScene";
import CosmicNewspaper from "@/components/CosmicNewspaper";
import PremiumMoon from "@/components/PremiumMoon";
import PremiumStarMap from "@/components/PremiumStarMap";
import { getRealInfo } from "@/lib/astronomy";
import { getNASAImageForDate, getNASAImagesForDate, getHubbleImageForDate } from "@/lib/nasa";
import { getHistoricalEvents, getWaybackMachineSnapshots } from "@/lib/history";
import { getAstrologicalData } from "@/lib/astrology";
import { getEarthStats } from "@/lib/earth";
import { getLandsatLetters } from "@/lib/landsat";
import { getCoordinates } from "@/lib/geocoding";
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

    const exactTime = birthTime || "12:00"; 
    const dateOfArrival = `${birthDate}T${exactTime}:00Z`;

    try {
      const astData = getRealInfo({
        dateStr: birthDate,
        timeStr: exactTime,
        lat: lat,
        lon: lon,
        locationName: finalLocationName
      });
      const astrologyData = await getAstrologicalData(birthDate, exactTime);
      const geocoded = await getCoordinates(birthPlace);
      const earthData = getEarthStats(dateOfArrival, geocoded?.lat || lat || 0);
      const landsatData = getLandsatLetters(firstName);
      const nasaImagesData = await getNASAImagesForDate(birthDate);
      const hubbleData = await getHubbleImageForDate(birthDate);
      const historyData = await getHistoricalEvents(birthDate);
      const waybackData = await getWaybackMachineSnapshots(birthDate);
      const nData = await getNASAImageForDate(birthDate);

      const fullCosmicData = {
        ...astData,
        firstName,
        lastName,
        birthDate: dateOfArrival,
        birthTime: exactTime,
        birthPlace,
        geocoded: geocoded || { lat: lat || 0, lon: lon || 0, name: finalLocationName || birthPlace },
        astrology: astrologyData,
        earth: earthData,
        landsat: landsatData,
        nasaImages: nasaImagesData,
        hubble: hubbleData,
        history: historyData,
        wayback: waybackData,
        nasaData: nData,
        sunConstellation: astrologyData?.realSunConstellation || "Unknown",
        moonConstellation: astrologyData?.realMoonConstellation || "Unknown",
        moonPhaseDetails: {
          phaseAngle: astData?.moonPhaseAngle || 0,
          phaseName: astData?.moonPhase || "Unknown"
        }
      };

      setCosmicData(fullCosmicData);
      setNasaData(nData);
      
      setIsLoading(false);
      
      // Trigger Cinematic Replay Sequence
      setReplayStage(1); // Zoom to Earth
      setTimeout(() => setReplayStage(2), 4000); // 4 seconds later, Earth zooms out to reveal Moon
      setTimeout(() => setReplayStage(3), 8000); // 8 seconds total, full UI fades in
    } catch (error) {
      console.error("Reveal Error:", error);
      setIsLoading(false);
      alert("Failed to compile archives. Please check your inputs.");
    }
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

  const downloadSection = async (id, filename) => {
    setIsExporting(true);
    try {
      const element = document.getElementById(id);
      if (!element) return;
      // hide the download button temporarily
      const btn = element.querySelector('button');
      if (btn) btn.style.display = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#050508'
      });

      if (btn) btn.style.display = '';

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = filename;
      link.click();
    } catch (error) {
      console.error("Failed to download section:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main style={{ position: "relative", width: "100vw", minHeight: "100vh", overflowX: "hidden", overflowY: "auto" }}>
      
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
              <h1 className="title-main">
                Cosmic Origin
              </h1>
              <p className="subtitle-main">
                The universe remembers the night you arrived.
              </p>

              <form onSubmit={handleReveal} className="glass-panel form-container">
                <div className="responsive-row" style={{ marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1, textAlign: "left", width: "100%" }}>
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
              className="dashboard-container"
            >
              <h2 style={{ textAlign: "center", fontSize: "3rem", marginBottom: "3rem", letterSpacing: "2px" }}>Your Cosmic Dashboard</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem", marginBottom: "4rem" }}>
                
                {/* Landsat Alphabet Card */}
                {cosmicData.landsat && cosmicData.landsat.length > 0 && (
                  <div id="landsat-panel" className="glass-panel" style={{ textAlign: "center", position: "relative" }}>
                    <h3 style={{ color: "var(--color-accent)", marginBottom: "2rem", fontSize: "1.8rem", letterSpacing: "2px", textTransform: "uppercase" }}>Your Name in Landsat</h3>
                    <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", justifyContent: "center", gap: "10px", paddingBottom: "1rem" }}>
                      {cosmicData.landsat.map((l, idx) => (
                        <div key={`${l.id}-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <img src={l.url} alt={`Landsat ${l.char}`} style={{ width: "100px", height: "100px", borderRadius: "8px", border: "2px solid rgba(255,255,255,0.4)", objectFit: "cover", boxShadow: "0 4px 15px rgba(0,0,0,0.5)" }} />
                          <span style={{ fontSize: "14px", marginTop: "10px", color: "#ddd", fontWeight: "bold" }}>{l.char}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>Spelled using genuine satellite imagery mimicking letterforms.</p>
                    <button onClick={() => downloadSection('landsat-panel', `Landsat_${firstName}.png`)} className="btn-primary" style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Download</button>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "3rem" }}>
                  {/* Wayback Machine Card */}
                  {cosmicData.wayback && cosmicData.wayback.length > 0 && (
                    <div id="wayback-panel" className="glass-panel" style={{ textAlign: "left", position: "relative" }}>
                      <h3 style={{ color: "var(--color-accent)", marginBottom: "1.5rem", fontSize: "1.5rem", letterSpacing: "1px", textTransform: "uppercase" }}>The Internet on this Day</h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {cosmicData.wayback.map(s => (
                          <li key={s.site} style={{ padding: "15px", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.1rem" }}>
                              <strong>{s.site}</strong>
                              <span style={{ fontSize: "0.9rem", color: "var(--color-accent)" }}>View Archive &rarr;</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                      <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", marginTop: "1.5rem" }}>Click to explore the archived websites exactly as they were.</p>
                      <button onClick={() => downloadSection('wayback-panel', `Internet_${cosmicData.date}.png`)} className="btn-primary" style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Download</button>
                    </div>
                  )}

                  {/* Real Constellations */}
                  <div id="constellations-panel" className="glass-panel responsive-row" style={{ position: "relative" }}>
                    <div className="responsive-col" style={{ justifyContent: "center" }}>
                      <h3 style={{ margin: "0 0 15px 0", color: "var(--color-accent)", fontSize: "1.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>Real-World Constellations</h3>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <strong style={{ display: "block", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.8 }}>The Sun resided in</strong>
                        <span style={{ fontSize: "2.5rem", fontWeight: "bold", textShadow: "0 2px 10px rgba(255,255,255,0.2)" }}>{cosmicData.sunConstellation}</span>
                      </div>
                      <div>
                        <strong style={{ display: "block", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.8 }}>The Moon glowed in</strong>
                        <span style={{ fontSize: "2.5rem", fontWeight: "bold", textShadow: "0 2px 10px rgba(255,255,255,0.2)" }}>{cosmicData.moonConstellation}</span>
                      </div>
                      <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", marginTop: "1.5rem" }}>Calculated exactly using their true Right Ascension and Declination.</p>
                    </div>
                    <div className="responsive-divider" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                      <PremiumMoon 
                        phaseAngle={cosmicData.moonPhaseDetails.phaseAngle} 
                        phaseName={cosmicData.moonPhaseDetails.phaseName}
                        dateStr={cosmicData.birthDate} 
                      />
                    </div>
                    <button onClick={() => downloadSection('constellations-panel', `Constellations_${cosmicData.date}.png`)} className="btn-primary" style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Download</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "3rem" }}>
                  {/* Premium Star Map */}
                  <div id="starmap-panel" className="glass-panel" style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                     <PremiumStarMap 
                       dateStr={cosmicData.birthDate} 
                       lat={cosmicData.geocoded.lat} 
                       lon={cosmicData.geocoded.lon} 
                       locationName={cosmicData.geocoded.name || cosmicData.birthPlace} 
                     />
                     <button onClick={() => downloadSection('starmap-panel', `StarMap_${cosmicData.date}.png`)} className="btn-primary" style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.5rem 1rem", fontSize: "0.8rem", zIndex: 20 }}>Download</button>
                  </div>

                  {/* What Did Hubble See on Your Birthday? */}
                  {cosmicData.hubble && (
                    <div id="hubble-panel" className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "15px", position: "relative" }}>
                      <h3 style={{ margin: 0, color: "var(--color-accent)", fontSize: "1.5rem", textTransform: "uppercase", letterSpacing: "1px", paddingRight: "100px" }}>
                        What Did Hubble See on Your Birthday?
                      </h3>
                      <p style={{ margin: 0, fontSize: "1rem", opacity: 0.9, fontStyle: "italic", lineHeight: "1.6" }}>
                        Hubble explores the universe 24 hours a day, 7 days a week. That means it has observed some fascinating cosmic wonder every day of the year, including on your birthday. Here is a real authentic picture from that date.
                      </p>
                      <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "20px" }}>
                         <img src={cosmicData.hubble.url} alt={cosmicData.hubble.title} style={{ width: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)", backgroundColor: "#000" }} />
                         <div>
                            <h4 style={{ margin: "0 0 10px 0", fontSize: "1.4rem" }}>{cosmicData.hubble.title}</h4>
                            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#e0e0e0" }}>{cosmicData.hubble.explanation}</p>
                         </div>
                      </div>
                      <button onClick={() => downloadSection('hubble-panel', `Hubble_${cosmicData.date}.png`)} className="btn-primary" style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Download</button>
                    </div>
                  )}
                </div>

                {/* Real NASA Photos */}
                {cosmicData.nasaImages && cosmicData.nasaImages.length > 0 && (
                  <div id="nasa-panel" className="glass-panel" style={{ textAlign: "left", position: "relative" }}>
                    <h3 style={{ color: "var(--color-accent)", marginBottom: "2rem", fontSize: "1.8rem", letterSpacing: "1px", textTransform: "uppercase" }}>Real NASA Archives from {cosmicData.date ? cosmicData.date.split('-')[0] : cosmicData.birthDate.split('T')[0].split('-')[0]}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                      {cosmicData.nasaImages.map((img, i) => (
                        <div key={i} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(0,0,0,0.3)" }}>
                          <img src={img.url} alt={img.title} style={{ width: "100%", height: "250px", objectFit: "cover" }} />
                          <div style={{ padding: "15px" }}>
                            <strong style={{ fontSize: "1.1rem", display: "block", marginBottom: "8px" }}>{img.title}</strong>
                            <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.9rem", lineHeight: "1.5" }}>{img.explanation.substring(0, 150)}...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => downloadSection('nasa-panel', `NASA_Archives_${cosmicData.date}.png`)} className="btn-primary" style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Download</button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
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

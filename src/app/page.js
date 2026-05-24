"use client";

import { useState, useRef, useEffect } from "react";
import CosmicScene from "@/components/CosmicScene";
import CosmicNewspaper from "@/components/CosmicNewspaper";
import CosmicIdentityCard from "@/components/CosmicIdentityCard";
import { getRealInfo } from "@/lib/astronomy";
import { getNASAImageForDate } from "@/lib/nasa";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
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
    const nData = await getNASAImageForDate(birthDate);
    
    setCosmicData(astData);
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
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: replayStage === 3 ? "auto" : "hidden" }}>
      
      {replayStage === 3 && cosmicData && (
        <CosmicNewspaper ref={newspaperRef} cosmicData={cosmicData} nasaData={nasaData} />
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

              <form onSubmit={handleReveal} className="glass-panel" style={{ width: "350px", margin: "0 auto" }}>
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
              key="revealed"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2 }}
              style={{ pointerEvents: "auto", width: "100%", maxWidth: "900px", zIndex: 10, margin: "10vh auto", paddingBottom: "10vh" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", marginBottom: "4rem" }}>
                {/* Holographic ID Card */}
                <CosmicIdentityCard cosmicData={cosmicData} />

                {/* NASA Image Section next to card */}
                {nasaData && (
                  <div className="glass-panel" style={{ flex: "1", minWidth: "350px", textAlign: "left" }}>
                    <h4 style={{ fontSize: "1.2rem", color: "var(--color-accent)", marginBottom: "1rem" }}>NASA Archive</h4>
                    {nasaData.mediaType === "video" ? (
                      <iframe
                        src={nasaData.url}
                        title={nasaData.title}
                        frameBorder="0"
                        allow="encrypted-media"
                        allowFullScreen
                        style={{ width: "100%", aspectRatio: "16/9", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                    ) : (
                      <img 
                        src={nasaData.url} 
                        alt={nasaData.title} 
                        crossOrigin="anonymous"
                        style={{ width: "100%", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.1)" }} 
                      />
                    )}
                    <h5 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{nasaData.title}</h5>
                    <p style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "var(--color-text-muted)" }}>
                      {nasaData.explanation.substring(0, 400)}...
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem" }}>
                <button 
                  onClick={handleDownloadNewspaper} 
                  className="btn-primary" 
                  style={{ background: "linear-gradient(135deg, rgba(200,180,120,0.2), rgba(200,180,120,0.05))", borderColor: "rgba(200,180,120,0.4)" }}
                >
                  Export Cosmic Newspaper
                </button>
                <button 
                  onClick={() => setReplayStage(0)} 
                  className="btn-primary" 
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

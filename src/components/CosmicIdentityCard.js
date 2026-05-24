"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import React from "react";

export default function CosmicIdentityCard({ cosmicData }) {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  const rotateX = useTransform(y, [0, 400], [15, -15]);
  const rotateY = useTransform(x, [0, 400], [-15, 15]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  if (!cosmicData) return null;

  // Simple hash for celestial signature
  const signatureHash = btoa(cosmicData.date).substring(0, 12).toUpperCase();

  return (
    <motion.div
      style={{
        perspective: 1000,
        display: "inline-block"
      }}
      onMouseMove={handleMouse}
      onMouseLeave={() => {
        x.set(200);
        y.set(200);
      }}
    >
      <motion.div
        style={{
          width: "400px",
          height: "600px",
          borderRadius: "20px",
          backgroundColor: "rgba(10, 15, 30, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          rotateX,
          rotateY,
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transformStyle: "preserve-3d"
        }}
      >
        {/* Holographic glare overlay */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)",
          zIndex: 1,
          pointerEvents: "none"
        }} />

        {/* Content Layer (translated Z for 3D depth) */}
        <div style={{ transform: "translateZ(30px)", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "15px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#a3b8cc" }}>
              Interstellar Passport<br/>
              <span style={{ color: "#fff", fontSize: "16px", letterSpacing: "3px" }}>Cosmic Origin</span>
            </div>
            <div style={{ fontSize: "10px", textAlign: "right", color: "#a3b8cc" }}>
              Auth ID: {signatureHash}<br/>
              Class: Rarity Prime
            </div>
          </div>

          <div style={{ marginTop: "40px" }}>
            <h2 style={{ fontSize: "12px", textTransform: "uppercase", color: "#a3b8cc", marginBottom: "5px", letterSpacing: "1px" }}>Arrival Date</h2>
            <p style={{ fontSize: "24px", margin: 0, fontFamily: "'Playfair Display', serif" }}>{cosmicData.date}</p>
            {cosmicData.time && (
              <div style={{ marginTop: "10px" }}>
                <h2 style={{ fontSize: "10px", textTransform: "uppercase", color: "#a3b8cc", marginBottom: "2px", letterSpacing: "1px" }}>Time</h2>
                <p style={{ fontSize: "16px", margin: 0, fontFamily: "'Playfair Display', serif" }}>{cosmicData.time}</p>
              </div>
            )}
            {cosmicData.location && (
              <div style={{ marginTop: "10px" }}>
                <h2 style={{ fontSize: "10px", textTransform: "uppercase", color: "#a3b8cc", marginBottom: "2px", letterSpacing: "1px" }}>Location</h2>
                <p style={{ fontSize: "16px", margin: 0, fontFamily: "'Playfair Display', serif" }}>{cosmicData.location}</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "12px", textTransform: "uppercase", color: "#a3b8cc", marginBottom: "5px", letterSpacing: "1px" }}>Moon Phase</h2>
              <p style={{ fontSize: "16px", margin: 0 }}>{cosmicData.moonPhase}</p>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "12px", textTransform: "uppercase", color: "#a3b8cc", marginBottom: "5px", letterSpacing: "1px" }}>Zenith Planets</h2>
              <p style={{ fontSize: "14px", margin: 0 }}>{cosmicData.visiblePlanets && cosmicData.visiblePlanets.length > 0 ? cosmicData.visiblePlanets.join(", ") : "Void"}</p>
            </div>
          </div>

          <div style={{ marginTop: "40px", padding: "15px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ fontSize: "10px", textTransform: "uppercase", color: "#a3b8cc", marginBottom: "5px", letterSpacing: "1px" }}>Celestial Alignment</h2>
            <p style={{ fontSize: "12px", fontStyle: "italic", margin: 0, lineHeight: "1.6" }}>
              "{cosmicData.story}"
            </p>
          </div>
        </div>

        {/* Footer Layer */}
        <div style={{ transform: "translateZ(20px)", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "15px", display: "flex", justifyContent: "space-between", fontSize: "10px", letterSpacing: "1px", color: "#a3b8cc", textTransform: "uppercase" }}>
          <span>Authentic Record</span>
          <span>Verified Archive</span>
        </div>

      </motion.div>
    </motion.div>
  );
}

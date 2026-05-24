"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

export default function Moon({ phaseFraction = 0.5 }) {
  const moonRef = useRef();

  // Rotate the moon slowly for a cinematic effect
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.001;
    }
  });

  // Calculate sun (light) position based on moon phase
  // Phase 0 = New Moon (light from behind)
  // Phase 0.5 = Full Moon (light from front)
  const angle = phaseFraction * Math.PI * 2;
  const lightRadius = 10;
  
  // X = left/right, Z = front/back
  const lightX = Math.sin(angle) * lightRadius;
  const lightZ = -Math.cos(angle) * lightRadius; // -cos so 0 is -Z (behind)

  return (
    <group>
      {/* The Moon */}
      <Sphere ref={moonRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#dcdcdc"
          roughness={0.9}
          metalness={0.1}
          bumpScale={0.02}
        />
      </Sphere>

      {/* The Sun (Directional Light illuminating the moon) */}
      <directionalLight 
        position={[lightX, 0, lightZ]} 
        intensity={2.5} 
        color="#ffffff" 
      />
      
      {/* Extremely subtle ambient light to not leave the dark side completely black */}
      <ambientLight intensity={0.02} color="#445577" />
    </group>
  );
}

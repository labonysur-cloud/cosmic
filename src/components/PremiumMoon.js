import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const MoonSphere = ({ phaseAngle }) => {
  const moonRef = useRef();
  
  // Use a high-quality moon texture map
  const colorMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.002;
    }
  });

  // Calculate light direction based on phaseAngle. 
  // phaseAngle 0 = New Moon (light from behind)
  // phaseAngle 180 = Full Moon (light from front)
  const rad = (phaseAngle / 180) * Math.PI;
  // We want the light to rotate around the Y axis. 
  // At phase 180 (Full Moon), light should be directly in front (Z axis).
  const lightX = Math.sin(rad - Math.PI) * 10;
  const lightZ = Math.cos(rad - Math.PI) * 10;

  return (
    <group>
      <ambientLight intensity={0.05} />
      <directionalLight 
        position={[lightX, 0, lightZ]} 
        intensity={2.5} 
        color="#ffffff" 
      />
      <mesh ref={moonRef} rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};

export default function PremiumMoon({ phaseAngle, phaseName, dateStr }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: 'relative', width: '250px', height: '250px', borderRadius: '50%', backgroundColor: '#000', boxShadow: '0 10px 40px rgba(255,255,255,0.05)' }}>
        <Canvas 
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: [0, 0, 6], fov: 45 }}
          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
        >
          <Suspense fallback={null}>
            <MoonSphere phaseAngle={phaseAngle} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
          </Suspense>
        </Canvas>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#e0e0e0', letterSpacing: '1px', textTransform: 'uppercase' }}>{phaseName}</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#aaa' }}>{new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
    </div>
  );
}

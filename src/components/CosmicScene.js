"use client";

import { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Moon from './Moon';
import Earth from './Earth';

function CinematicCamera({ replayStage }) {
  const { camera } = useThree();
  
  // stage 0 = landing (Earth)
  // stage 1 = zooming past Earth
  // stage 2 & 3 = Moon
  const targetZ = replayStage >= 2 ? 8 : (replayStage === 1 ? -2 : 12);
  const targetY = replayStage >= 2 ? 0 : 2;

  useFrame(() => {
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.015);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.015);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function CosmicScene({ moonPhaseFraction, replayStage }) {
  const hasRevealed = replayStage >= 2;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
        <color attach="background" args={['#020204']} />
        
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          {!hasRevealed && <Earth />}
          {hasRevealed && <Moon phaseFraction={moonPhaseFraction} />}
        </Suspense>

        <CinematicCamera replayStage={replayStage} />

        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={hasRevealed}
          autoRotateSpeed={0.5}
          maxDistance={20}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
}

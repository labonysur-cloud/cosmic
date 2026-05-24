"use client";

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();

  // Load standard earth textures from public Three.js examples (CORS safe via unpkg or raw github)
  const [colorMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005; // Slow rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0007; // Clouds rotate slightly faster
    }
  });

  return (
    <group position={[0, -2, 5]}>
      {/* Earth Body */}
      <Sphere ref={earthRef} args={[3, 64, 64]}>
        <meshPhongMaterial 
          map={colorMap} 
          specularMap={specularMap}
          shininess={15}
        />
      </Sphere>

      {/* Cloud Layer */}
      <Sphere ref={cloudsRef} args={[3.03, 64, 64]}>
        <meshPhongMaterial 
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Cinematic rim lighting for the Earth */}
      <directionalLight position={[-5, 3, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[5, -3, 2]} intensity={0.5} color="#4466aa" />
    </group>
  );
}

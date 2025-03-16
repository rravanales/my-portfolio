"use client";
import React, { useRef } from 'react';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import glsl from 'babel-plugin-glsl/macro';

// Define el material personalizado utilizando shaderMaterial
const ShadowMaterial = shaderMaterial(
  {
    color: new THREE.Color(0x000000), // Color de la sombra (negro)
    radius: 0.5, // Radio de la sombra
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    uniform vec3 color;
    uniform float radius;
    void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
      float alpha = smoothstep(radius, radius - 0.2, dist);
      gl_FragColor = vec4(color, alpha);
    }
  `
);

// Registrar el material en JSX
extend({ ShadowMaterial });

// Declarar globalmente el elemento JSX para nuestro material personalizado
declare global {
  namespace JSX {
    interface IntrinsicElements {
      shadowMaterial: any;
    }
  }
}

function ShadowPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow >
      <planeGeometry args={[10, 10]} />
      <shadowMaterial ref={materialRef} transparent={true} />
    </mesh>
  );
}

export default ShadowPlane;

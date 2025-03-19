"use client";
import React, { useRef } from "react";
import { extend, ThreeElements } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
//import glsl from "babel-plugin-glsl/macro";
import { type ThreeElement } from '@react-three/fiber'

// Define el material personalizado utilizando shaderMaterial
const ShadowMaterial = shaderMaterial(
  {
    uShadowColor: new THREE.Color("#d04500"), // Color de la sombra
    uAlpha: 0.5, // Transparencia de la sombra
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
    uniform vec3 uShadowColor;
    uniform float uAlpha;
    void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
      float alpha = smoothstep(0.5, 0.45, dist); // Controla el desvanecimiento
      gl_FragColor = vec4(uShadowColor, alpha * uAlpha);
    }
  `
);

// Extiende JSX para incluir el material personalizado
extend({ ShadowMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    shadowMaterial: ThreeElement<typeof ShadowMaterial>;
  }
}

// Define las propiedades del componente
type ShadowProps = {
  uShadowColor?: THREE.Color;
  uAlpha?: number;
};

const ShadowPlane: React.FC<ShadowProps> = ({
  uShadowColor = new THREE.Color("#d04500"),
  uAlpha = 0.5,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -0.01]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <shadowMaterial
        ref={materialRef}
        transparent={true}
        uShadowColor={uShadowColor}
        uAlpha={uAlpha}
      />
    </mesh>
  );
};

export default ShadowPlane;

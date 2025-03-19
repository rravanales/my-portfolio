"use client";
import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, useGLTF, shaderMaterial } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";
import glsl from "babel-plugin-glsl/macro";
import gsap from "gsap";
import FloorShadow from "./FloorShadow"; // Componente del piso con sombra personalizado
import ShadowPlane from "./FloorShadow";

// --- Componente genérico para cargar modelos GLTF --- //
type ModelProps = {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  name?: string;
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

const Model: React.FC<ModelProps> = ({
  url,
  position,
  rotation = [0, 0, 0],
  name,
  wireframe = false,
  castShadow = true,
  receiveShadow = false,
}) => {
  const { scene } = useGLTF(url) as { scene: THREE.Group };

  // Clonar la escena y asignar propiedades de sombra y wireframe
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        if ("wireframe" in child.material) {
          (child.material as any).wireframe = wireframe;
        }
      }
    });
    return clone;
  }, [scene, wireframe, castShadow, receiveShadow]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      name={name}
    />
  );
};

// --- Componentes de la sección Intro --- //
const StaticScene: React.FC<{ wireframe?: boolean }> = ({
  wireframe = false,
}) => (
  <Model
    url="/models/intro/static/base.glb"
    position={[0, 0, 0]}
    name="introStaticBase"
    wireframe={wireframe}
    receiveShadow
  />
);

type InstructionsProps = { wireframe?: boolean };
const Instructions: React.FC<InstructionsProps> = ({ wireframe = false }) => {
  const { scene } = useGLTF("/models/intro/instructions/labels.glb") as {
    scene: THREE.Group;
  };
  const arrowMesh = useMemo(() => {
    const obj = scene.getObjectByName("arrows")?.clone();
    if (obj) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.castShadow = true;
          child.receiveShadow = true;
          if ("wireframe" in child.material) {
            (child.material as any).wireframe = wireframe;
          }
        }
      });
    }
    return obj;
  }, [scene, wireframe]);
  if (!arrowMesh) return null;
  return <primitive object={arrowMesh} />;
};

const ArrowUp: React.FC<{ wireframe?: boolean }> = ({ wireframe = false }) => (
  <Model
    url="/models/intro/arrowKey/base.glb"
    position={[-1, 0.5, 0]}
    name="arrowUp"
    wireframe={wireframe}
    castShadow
  />
);

// Componentes para las letras
const LetterB: React.FC = () => (
  <Model url="/models/intro/b/base.glb" position={[-3, 0, 0]} name="letterB" castShadow />
);
const LetterR: React.FC = () => (
  <Model url="/models/intro/r/base.glb" position={[-2, 0, 0]} name="letterR" castShadow />
);
const LetterU: React.FC = () => (
  <Model url="/models/intro/u/base.glb" position={[-1, 0, 0]} name="letterU" castShadow />
);
const LetterN: React.FC = () => (
  <Model url="/models/intro/n/base.glb" position={[0, 0, 0]} name="letterN" castShadow />
);
const LetterO: React.FC = () => (
  <Model url="/models/intro/o/base.glb" position={[1, 0, 0]} name="letterO" castShadow />
);
const LetterS: React.FC = () => (
  <Model url="/models/intro/s/base.glb" position={[2, 0, 0]} name="letterS" castShadow />
);
const LetterI: React.FC = () => (
  <Model url="/models/intro/i/base.glb" position={[3, 0, 0]} name="letterI" castShadow />
);
const LetterM: React.FC = () => (
  <Model url="/models/intro/m/base.glb" position={[4, 0, 0]} name="letterM" castShadow />
);

// Componentes adicionales
const Creative: React.FC = () => (
  <Model url="/models/intro/creative/base.glb" position={[0, -2, 0]} name="creative" castShadow />
);
const Dev: React.FC = () => (
  <Model url="/models/intro/dev/base.glb" position={[2, -2, 0]} name="dev" castShadow />
);

// Componente que agrupa todas las letras y las anima con GSAP
const AnimatedLetters: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (groupRef.current) {
      // Animar la posición: desde y = -10 hasta y = 0
      gsap.fromTo(
        groupRef.current.position,
        { y: -10 },
        { y: 0, duration: 1.5, ease: "power2.out" }
      );
      // Animar la rotación: desde z = -PI/4 hasta z = 0
      gsap.fromTo(
        groupRef.current.rotation,
        { z: -Math.PI / 4 },
        { z: 0, duration: 1.5, ease: "power2.out" }
      );
    }
  }, []);
  return (
    <group ref={groupRef}>
      <LetterB />
      <LetterR />
      <LetterU />
      <LetterN />
      <LetterO />
      <LetterS />
      <LetterI />
      <LetterM />
    </group>
  );
};

// Componente para controlar el wireframe (por Leva)
const WireframeControls: React.FC = () => {
  const { wireframe } = useControls("Wireframe Controls", {
    wireframe: { value: false },
  });
  return (
    <>
      <StaticScene wireframe={wireframe} />
      <Instructions wireframe={wireframe} />
      <ArrowUp wireframe={wireframe} />
    </>
  );
};

// -----------------------------------------------------------------------------
// Componente principal de la sección Intro
const IntroSection: React.FC = () => {
  return (
    <Canvas
      shadows
      style={{ width: "100vw", height: "100vh", display: "block" }}
      camera={{ position: [0, -60, 25], fov: 50 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight name="directionalLight" position={[5, 5, 5]} intensity={1.8} castShadow />
      <primitive object={new THREE.AxesHelper(5)} />
      <Suspense fallback={null}>
        <WireframeControls />
        <AnimatedLetters />
        <Creative />
        <Dev />
        {/* Integramos el piso con sombra personalizada */}
        <FloorShadow uShadowColor={new THREE.Color("#d04500")} uAlpha={0.5} />
     
        {/* <ShadowPlane uShadowColor={new THREE.Color("#d04500")} uAlpha={0.5} /> */}

      </Suspense>
      <OrbitControls enableDamping dampingFactor={0.1} minDistance={10} maxDistance={30} />
    </Canvas>
  );
};

export default IntroSection;

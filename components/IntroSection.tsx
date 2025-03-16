"use client";
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

// Tipo para los props del modelo
type ModelProps = {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  name?: string;
  wireframe?: boolean;
};

const Model: React.FC<ModelProps> = ({
  url,
  position,
  rotation = [0, 0, 0],
  name,
  wireframe = false,
}) => {
  const { scene } = useGLTF(url) as { scene: THREE.Group };

  // Clonamos la escena y recorremos sus hijos para aplicar "wireframe" en materiales compatibles.
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if ('wireframe' in child.material) {
          (child.material as any).wireframe = wireframe;
        }
      }
    });
    return clone;
  }, [scene, wireframe]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      name={name}
    />
  );
};

// Escenario estático (base de Intro)
const StaticScene: React.FC<{ wireframe?: boolean }> = ({ wireframe = false }) => {
  return (
    <Model
      url="/models/intro/static/base.glb"
      position={[0, 0, 0]}
      name="introStaticBase"
      wireframe={wireframe}
    />
  );
};

// Instrucciones visuales (buscando el mesh "arrows")
type InstructionsProps = { wireframe?: boolean };
const Instructions: React.FC<InstructionsProps> = ({ wireframe = false }) => {
  const { scene } = useGLTF('/models/intro/instructions/labels.glb') as {
    scene: THREE.Group;
  };

  const arrowMesh = React.useMemo(() => {
    const obj = scene.getObjectByName('arrows')?.clone();
    if (obj) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if ('wireframe' in child.material) {
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

// Tecla "Up"
const ArrowUp: React.FC<{ wireframe?: boolean }> = ({ wireframe = false }) => {
  return (
    <Model
      url="/models/intro/arrowKey/base.glb"
      position={[-1, 0.5, 0]}
      name="arrowUp"
      wireframe={wireframe}
    />
  );
};

// Componentes para las letras (posiciones fijas según el diseño original)
const LetterB: React.FC = () => {
  return <Model url="/models/intro/b/base.glb" position={[-3, 0, 0]} name="letterB" />;
};
const LetterR: React.FC = () => {
  return <Model url="/models/intro/r/base.glb" position={[-2, 0, 0]} name="letterR" />;
};
const LetterU: React.FC = () => {
  return <Model url="/models/intro/u/base.glb" position={[-1, 0, 0]} name="letterU" />;
};
const LetterN: React.FC = () => {
  return <Model url="/models/intro/n/base.glb" position={[0, 0, 0]} name="letterN" />;
};
const LetterO: React.FC = () => {
  return <Model url="/models/intro/o/base.glb" position={[1, 0, 0]} name="letterO" />;
};
const LetterS: React.FC = () => {
  return <Model url="/models/intro/s/base.glb" position={[2, 0, 0]} name="letterS" />;
};
const LetterI: React.FC = () => {
  return <Model url="/models/intro/i/base.glb" position={[3, 0, 0]} name="letterI" />;
};
const LetterM: React.FC = () => {
  return <Model url="/models/intro/m/base.glb" position={[4, 0, 0]} name="letterM" />;
};

// Componentes adicionales ("creative" y "dev")
const Creative: React.FC = () => {
  return <Model url="/models/intro/creative/base.glb" position={[0, -2, 0]} name="creative" />;
};
const Dev: React.FC = () => {
  return <Model url="/models/intro/dev/base.glb" position={[2, -2, 0]} name="dev" />;
};

// Componente para controlar el wireframe de ciertos objetos mediante Leva
const WireframeControls: React.FC = () => {
  const { wireframe } = useControls('Wireframe Controls', {
    wireframe: { value: false },
  });
  return (
    <>
      <StaticScene wireframe={!wireframe} />
      <Instructions wireframe={wireframe} />
      <ArrowUp wireframe={wireframe} />
    </>
  );
};

const IntroSection: React.FC = () => {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh', display: 'block' }}
      camera={{ position: [0, -60, 25], fov: 50 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight
        name="directionalLight"
        position={[5, 5, 5]}
        intensity={1.8}
      />

      {/* AxesHelper importado directamente desde THREE */}
      <primitive object={new THREE.AxesHelper(5)} />

      <Suspense fallback={null}>
        <WireframeControls />
        <LetterB />
        <LetterR />
        <LetterU />
        <LetterN />
        <LetterO />
        <LetterS />
        <LetterI />
        <LetterM />
        <Creative />
        <Dev />
      </Suspense>

      {/* Eliminamos el panel de Leva para la cámara y la luz */}
      <OrbitControls enableDamping dampingFactor={0.1} minDistance={10} maxDistance={30} />
    </Canvas>
  );
};

export default IntroSection;

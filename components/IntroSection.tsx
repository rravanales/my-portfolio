"use client"

// components/IntroSection.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';


const IntroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Crear la escena, la cámara y el renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      80
    );
    camera.position.set(0, 2, 15);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Agregar luces básicas
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);


    // Configurar DRACOLoader para modelos comprimidos con Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/'); // Ruta a la carpeta con los decodificadores
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    
    // 1. Cargar el modelo estático de la Intro
    loader.load(
      '/models/intro/static/base.glb',
      (gltf: GLTF) => {
        const staticModel = gltf.scene;
        staticModel.position.set(0, 0, 0);
        scene.add(staticModel);
      },
      undefined,
      (error: ErrorEvent) => console.error('Error al cargar el modelo estático:', error)
    );

    // 2. Cargar las instrucciones visuales (por ejemplo, el mesh "arrows")
    loader.load(
      '/models/intro/instructions/labels.glb',
      (gltf: GLTF) => {
        // Buscamos el mesh con nombre "arrows"
        const labelMesh = gltf.scene.getObjectByName('arrows');
        if (labelMesh) {
          labelMesh.position.set(0, 1.5, 0);
          scene.add(labelMesh);
        } else {
          console.warn("No se encontró el mesh 'arrows' en las instrucciones.");
        }
      },
      undefined,
      (error: ErrorEvent) => console.error('Error al cargar instrucciones:', error)
    );

    // 3. Cargar el modelo de la tecla "Up" (como ejemplo)
    loader.load(
      '/models/intro/arrowKey/base.glb',
      (gltf: GLTF) => {
        const upArrow = gltf.scene;
        upArrow.position.set(-1, 0.5, 0);
        scene.add(upArrow);
      },
      undefined,
      (error: ErrorEvent) => console.error('Error al cargar el modelo de la tecla Up:', error)
    );

    // 4. Cargar un modelo de letra (por ejemplo, la letra "B")
    loader.load(
      '/models/intro/b/base.glb',
      (gltf: GLTF) => {
        const letterB = gltf.scene;
        letterB.position.set(-2, 0, 0);
        scene.add(letterB);
      },
      undefined,
      (error: ErrorEvent) => console.error('Error al cargar la letra B:', error)
    );

    // Función de animación (render loop)
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Manejar redimensionado de la ventana
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default IntroSection;

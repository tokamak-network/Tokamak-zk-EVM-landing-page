"use client";

import { useEffect, useRef, useState } from "react";

export function EthereumLogoOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let disposeScene: (() => void) | null = null;
    let disposed = false;

    const buildScene = async () => {
      try {
        const THREE = await import("three");

        if (disposed) {
          return;
        }

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          canvas,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
        camera.position.set(0, 0.28, 5.4);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.AmbientLight(0xd9e8ff, 1.8));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(3.6, 4.8, 5.2);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x58b7ff, 1.5);
        rimLight.position.set(-3.6, -1.2, 4.8);
        scene.add(rimLight);

        const logoGroup = new THREE.Group();
        scene.add(logoGroup);
        const disposableGeometries: Array<{ dispose: () => void }> = [];
        const disposableMaterials: Array<{ dispose: () => void }> = [];

        const top = new THREE.Vector3(0, 1.42, 0);
        const bottom = new THREE.Vector3(0, -1.24, 0);
        const left = new THREE.Vector3(-0.74, 0, 0);
        const right = new THREE.Vector3(0.74, 0, 0);
        const front = new THREE.Vector3(0, 0, 0.46);
        const back = new THREE.Vector3(0, 0, -0.46);

        const faceColors = [
          "#e7f1ff",
          "#a8d4ff",
          "#5d9df0",
          "#263d76",
          "#d1e7ff",
          "#84bdff",
          "#3a75d1",
          "#15214b",
        ];

        const faces = [
          [top, left, front],
          [top, front, right],
          [top, right, back],
          [top, back, left],
          [bottom, front, left],
          [bottom, right, front],
          [bottom, back, right],
          [bottom, left, back],
        ];

        faces.forEach((points, index) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([...points]);
          geometry.setIndex([0, 1, 2]);
          geometry.computeVertexNormals();
          disposableGeometries.push(geometry);

          const material = new THREE.MeshStandardMaterial({
            color: faceColors[index],
            emissive: index % 4 === 0 ? "#12345c" : "#050a16",
            emissiveIntensity: index % 4 === 0 ? 0.18 : 0.08,
            metalness: 0.36,
            roughness: 0.42,
            side: THREE.DoubleSide,
          });
          disposableMaterials.push(material);

          logoGroup.add(new THREE.Mesh(geometry, material));

          const edges = new THREE.EdgesGeometry(geometry);
          disposableGeometries.push(edges);
          const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0xd8ecff,
            transparent: true,
            opacity: 0.32,
          });
          disposableMaterials.push(edgeMaterial);
          const lines = new THREE.LineSegments(
            edges,
            edgeMaterial,
          );
          logoGroup.add(lines);
        });

        const ringGeometry = new THREE.TorusGeometry(1.26, 0.007, 8, 120);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x61b8ff,
          opacity: 0.3,
          transparent: true,
        });
        disposableGeometries.push(ringGeometry);
        disposableMaterials.push(ringMaterial);

        const ring = new THREE.Mesh(
          ringGeometry,
          ringMaterial,
        );
        ring.rotation.x = Math.PI / 2;
        logoGroup.add(ring);

        logoGroup.rotation.x = Math.PI / 6;
        logoGroup.rotation.y = 0.58;
        logoGroup.rotation.z = -0.08;

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.floor(bounds.width));
          const height = Math.max(1, Math.floor(bounds.height));
          const aspect = width / height;
          const verticalSize = 3.9;

          camera.left = (-verticalSize * aspect) / 2;
          camera.right = (verticalSize * aspect) / 2;
          camera.top = verticalSize / 2;
          camera.bottom = -verticalSize / 2;
          camera.updateProjectionMatrix();

          renderer.setSize(width, height, false);
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        resize();

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );

        const render = () => {
          if (!reducedMotion.matches) {
            const time = performance.now() * 0.001;
            logoGroup.rotation.y = 0.58 + time * 0.74;
            logoGroup.rotation.x = Math.PI / 6 + Math.sin(time * 0.65) * 0.06;
            ring.rotation.z = time * -0.42;
          }

          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };

        render();
        disposeScene = () => {
          disposableGeometries.forEach((geometry) => geometry.dispose());
          disposableMaterials.forEach((material) => material.dispose());
          renderer.dispose();
        };
      } catch (error) {
        console.error("Failed to render Ethereum logo animation.", error);
        setShowFallback(true);
      }
    };

    buildScene();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      disposeScene?.();
    };
  }, []);

  return (
    <div className="ethereum-orbit" aria-hidden="true">
      <canvas ref={canvasRef} className="ethereum-orbit__canvas" />
      {showFallback ? <div className="ethereum-orbit__fallback" /> : null}
    </div>
  );
}

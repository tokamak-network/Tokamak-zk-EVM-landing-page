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
        const disposableTextures: Array<{ dispose: () => void }> = [];

        const top = new THREE.Vector3(0, 1.5041, 0);
        const bottom = new THREE.Vector3(0, -1.3241, 0);
        const upperY = 0.1722;
        const lowerY = 0.0078;
        const upperLeft = new THREE.Vector3(-0.74, upperY, 0);
        const upperRight = new THREE.Vector3(0.74, upperY, 0);
        const upperFront = new THREE.Vector3(0, upperY, 0.74);
        const upperBack = new THREE.Vector3(0, upperY, -0.74);
        const lowerLeft = new THREE.Vector3(-0.74, lowerY, 0);
        const lowerRight = new THREE.Vector3(0.74, lowerY, 0);
        const lowerFront = new THREE.Vector3(0, lowerY, 0.74);
        const lowerBack = new THREE.Vector3(0, lowerY, -0.74);

        const surfaces = [
          {
            points: [top, upperLeft, upperFront],
            color: "#e7f1ff",
            opacity: 0.75,
          },
          {
            points: [top, upperFront, upperRight],
            color: "#a8d4ff",
            opacity: 0.75,
          },
          {
            points: [top, upperRight, upperBack],
            color: "#5d9df0",
            opacity: 0.75,
          },
          {
            points: [top, upperBack, upperLeft],
            color: "#263d76",
            opacity: 0.75,
          },
          { points: [bottom, lowerFront, lowerLeft], color: "#d1e7ff" },
          { points: [bottom, lowerRight, lowerFront], color: "#84bdff" },
          { points: [bottom, lowerBack, lowerRight], color: "#3a75d1" },
          { points: [bottom, lowerLeft, lowerBack], color: "#15214b" },
          {
            points: [upperLeft, upperBack, upperRight, upperFront],
            color: "#4a9dff",
            index: [0, 1, 2, 0, 2, 3],
          },
          {
            points: [lowerLeft, lowerFront, lowerRight, lowerBack],
            color: "#326faa",
            index: [0, 1, 2, 0, 2, 3],
          },
        ];

        surfaces.forEach((surface, index) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            ...surface.points,
          ]);
          geometry.setIndex(surface.index ?? [0, 1, 2]);
          geometry.computeVertexNormals();
          disposableGeometries.push(geometry);

          const material = new THREE.MeshStandardMaterial({
            color: surface.color,
            emissive: index % 4 === 0 ? "#12345c" : "#050a16",
            emissiveIntensity: index % 4 === 0 ? 0.18 : 0.08,
            metalness: 0.36,
            opacity: surface.opacity ?? 1,
            roughness: 0.42,
            side: THREE.DoubleSide,
            transparent: surface.opacity !== undefined,
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

        const createDiamondGlowTexture = () => {
          const size = 512;
          const glowCanvas = document.createElement("canvas");
          glowCanvas.width = size;
          glowCanvas.height = size;
          const context = glowCanvas.getContext("2d");

          if (!context) {
            throw new Error("Canvas 2D context is unavailable.");
          }

          const image = context.createImageData(size, size);
          const data = image.data;

          for (let y = 0; y < size; y += 1) {
            for (let x = 0; x < size; x += 1) {
              const nx = ((x + 0.5) / size) * 2 - 1;
              const ny = ((y + 0.5) / size) * 2 - 1;
              const diamondDistance = Math.abs(nx) + Math.abs(ny);
              const radialDistance = Math.sqrt(nx * nx + ny * ny);
              const pixelIndex = (y * size + x) * 4;

              if (diamondDistance > 1.5) {
                data[pixelIndex + 3] = 0;
                continue;
              }

              const core = Math.max(0, 1 - diamondDistance / 0.34);
              const face = Math.max(0, 1 - diamondDistance / 0.84);
              const spill = Math.max(0, 1 - diamondDistance / 1.5);
              const radialFade = Math.max(0, 1 - radialDistance / 1.05);
              const alpha =
                Math.pow(core, 1.15) * 0.62 +
                Math.pow(face, 1.7) * 0.32 +
                Math.pow(spill * radialFade, 2.2) * 0.4;

              data[pixelIndex] = 244;
              data[pixelIndex + 1] = 250;
              data[pixelIndex + 2] = 255;
              data[pixelIndex + 3] = Math.round(Math.min(1, alpha) * 255);
            }
          }

          context.putImageData(image, 0, 0);

          const texture = new THREE.CanvasTexture(glowCanvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = false;
          texture.magFilter = THREE.LinearFilter;
          texture.minFilter = THREE.LinearFilter;
          texture.needsUpdate = true;

          return texture;
        };

        const glowTexture = createDiamondGlowTexture();
        disposableTextures.push(glowTexture);
        const updateGlowLayers: Array<(time: number) => void> = [];

        const addFaceGlow = ({
          baseOpacity,
          baseScale,
          direction,
          offset,
          opacityPulse,
          phase,
          scalePulse,
          y,
        }: {
          baseOpacity: number;
          baseScale: number;
          direction: -1 | 1;
          offset: number;
          opacityPulse: number;
          phase: number;
          scalePulse: number;
          y: number;
        }) => {
          const geometry = new THREE.PlaneGeometry(1.52, 1.52);
          disposableGeometries.push(geometry);

          const material = new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: 0xffffff,
            depthTest: false,
            depthWrite: false,
            map: glowTexture,
            opacity: baseOpacity,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
          });
          material.color.setRGB(3.4, 3.7, 4.05);
          disposableMaterials.push(material);

          const glow = new THREE.Mesh(geometry, material);
          glow.position.y = y + direction * offset;
          glow.renderOrder = 3;
          glow.rotation.x = -Math.PI / 2;
          glow.scale.setScalar(baseScale);
          logoGroup.add(glow);

          updateGlowLayers.push((time) => {
            const pulse = (Math.sin(time * 1.62 + phase) + 1) / 2;
            const easedPulse = pulse * pulse * (3 - 2 * pulse);

            glow.position.y =
              y + direction * (offset + easedPulse * 0.018);
            glow.scale.setScalar(baseScale + easedPulse * scalePulse);
            material.opacity = baseOpacity + easedPulse * opacityPulse;
          });
        };

        addFaceGlow({
          baseOpacity: 0.36,
          baseScale: 0.94,
          direction: -1,
          offset: 0.01,
          opacityPulse: 0.14,
          phase: 0.1,
          scalePulse: 0.1,
          y: upperY,
        });
        addFaceGlow({
          baseOpacity: 0.15,
          baseScale: 1.13,
          direction: -1,
          offset: 0.028,
          opacityPulse: 0.12,
          phase: 1.45,
          scalePulse: 0.34,
          y: upperY,
        });
        addFaceGlow({
          baseOpacity: 0.065,
          baseScale: 1.38,
          direction: -1,
          offset: 0.052,
          opacityPulse: 0.075,
          phase: 2.5,
          scalePulse: 0.48,
          y: upperY,
        });
        addFaceGlow({
          baseOpacity: 0.31,
          baseScale: 0.94,
          direction: 1,
          offset: 0.01,
          opacityPulse: 0.12,
          phase: 0.7,
          scalePulse: 0.1,
          y: lowerY,
        });
        addFaceGlow({
          baseOpacity: 0.13,
          baseScale: 1.11,
          direction: 1,
          offset: 0.028,
          opacityPulse: 0.105,
          phase: 2.05,
          scalePulse: 0.3,
          y: lowerY,
        });
        addFaceGlow({
          baseOpacity: 0.055,
          baseScale: 1.34,
          direction: 1,
          offset: 0.052,
          opacityPulse: 0.065,
          phase: 3.1,
          scalePulse: 0.44,
          y: lowerY,
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

        const logoPitch = (31.5 * Math.PI) / 180;

        logoGroup.rotation.x = logoPitch;
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
        const logoSpinSpeed = 0.74;
        const axisOscillationSpeed = logoSpinSpeed * (2 / 7);

        const render = () => {
          if (!reducedMotion.matches) {
            const time = performance.now() * 0.001;
            logoGroup.rotation.y = 0.58 + time * logoSpinSpeed;
            logoGroup.rotation.x =
              logoPitch + Math.sin(time * axisOscillationSpeed) * 0.03;
            ring.rotation.z = time * -0.42;
            updateGlowLayers.forEach((updateGlowLayer) =>
              updateGlowLayer(time),
            );
          }

          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };

        render();
        disposeScene = () => {
          disposableGeometries.forEach((geometry) => geometry.dispose());
          disposableMaterials.forEach((material) => material.dispose());
          disposableTextures.forEach((texture) => texture.dispose());
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

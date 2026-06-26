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

        const createPointGlowTexture = () => {
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
              const radialDistance = Math.sqrt(nx * nx + ny * ny);
              const pixelIndex = (y * size + x) * 4;

              if (radialDistance > 1) {
                data[pixelIndex + 3] = 0;
                continue;
              }

              const core = Math.max(0, 1 - radialDistance / 0.16);
              const bloom = Math.max(0, 1 - radialDistance / 0.54);
              const spill = Math.max(0, 1 - radialDistance);
              const alpha =
                Math.pow(core, 0.72) * 0.98 +
                Math.pow(bloom, 1.45) * 0.56 +
                Math.pow(spill, 2.55) * 0.32;

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

        const glowTexture = createPointGlowTexture();
        disposableTextures.push(glowTexture);
        const updateGlowLayers: Array<(time: number) => void> = [];
        const gapCenterY = (upperY + lowerY) / 2;

        const centerLight = new THREE.PointLight(0xf6fbff, 8.5, 4.4, 1.35);
        centerLight.position.set(0, gapCenterY, 0);
        logoGroup.add(centerLight);

        const addCenteredGlow = ({
          baseOpacity,
          baseScale,
          opacityPulse,
          phase,
          scalePulse,
        }: {
          baseOpacity: number;
          baseScale: number;
          opacityPulse: number;
          phase: number;
          scalePulse: number;
        }) => {
          const material = new THREE.SpriteMaterial({
            blending: THREE.AdditiveBlending,
            color: 0xffffff,
            depthTest: true,
            depthWrite: false,
            map: glowTexture,
            opacity: baseOpacity,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
          });
          material.color.setRGB(3.8, 4.15, 4.7);
          disposableMaterials.push(material);

          const glow = new THREE.Sprite(material);
          glow.position.set(0, gapCenterY, 0);
          glow.renderOrder = 3;
          glow.scale.setScalar(baseScale);
          logoGroup.add(glow);

          updateGlowLayers.push((time) => {
            const pulse = (Math.sin(time * 1.62 + phase) + 1) / 2;
            const easedPulse = pulse * pulse * (3 - 2 * pulse);

            glow.scale.setScalar(baseScale + easedPulse * scalePulse);
            material.opacity = baseOpacity + easedPulse * opacityPulse;
          });
        };

        addCenteredGlow({
          baseOpacity: 0.94,
          baseScale: 0.76,
          opacityPulse: 0.2,
          phase: 0.1,
          scalePulse: 0.08,
        });
        addCenteredGlow({
          baseOpacity: 0.68,
          baseScale: 1.58,
          opacityPulse: 0.24,
          phase: 1.45,
          scalePulse: 0.32,
        });
        addCenteredGlow({
          baseOpacity: 0.38,
          baseScale: 2.72,
          opacityPulse: 0.16,
          phase: 2.5,
          scalePulse: 0.56,
        });
        addCenteredGlow({
          baseOpacity: 0.18,
          baseScale: 4,
          opacityPulse: 0.1,
          phase: 0.7,
          scalePulse: 0.82,
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

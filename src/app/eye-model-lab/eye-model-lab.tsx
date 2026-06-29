"use client";

import { useEffect, useRef, useState } from "react";

export function EyeModelLab() {
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
        renderer.setClearColor(0x020305, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 0.02, 5.2);
        camera.lookAt(0, 0, 0);

        const disposableResources: Array<{ dispose: () => void }> = [];
        const trackDisposable = <T extends { dispose: () => void }>(
          resource: T,
        ) => {
          disposableResources.push(resource);
          return resource;
        };

        scene.add(new THREE.AmbientLight(0xeef6ff, 1.18));

        const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
        keyLight.position.set(2.4, 2.8, 4.2);
        scene.add(keyLight);

        const softLight = new THREE.DirectionalLight(0x8fd7ff, 1.4);
        softLight.position.set(-2.8, -0.4, 3.2);
        scene.add(softLight);

        const rimLight = new THREE.DirectionalLight(0x6cb8ff, 2.1);
        rimLight.position.set(-2.2, 1.8, -2.4);
        scene.add(rimLight);

        const eyeRig = new THREE.Group();
        eyeRig.rotation.set(0, 0, 0);
        scene.add(eyeRig);

        const irisCanvas = document.createElement("canvas");
        irisCanvas.width = 1024;
        irisCanvas.height = 1024;
        const irisContext = irisCanvas.getContext("2d");

        if (irisContext) {
          const center = irisCanvas.width / 2;
          const irisGradient = irisContext.createRadialGradient(
            center,
            center,
            18,
            center,
            center,
            500,
          );

          irisGradient.addColorStop(0, "#d9fbf2");
          irisGradient.addColorStop(0.18, "#69b6a7");
          irisGradient.addColorStop(0.46, "#2e747b");
          irisGradient.addColorStop(0.74, "#173d55");
          irisGradient.addColorStop(1, "#07111f");
          irisContext.fillStyle = irisGradient;
          irisContext.fillRect(0, 0, irisCanvas.width, irisCanvas.height);

          for (let index = 0; index < 160; index++) {
            const angle = (index / 160) * Math.PI * 2;
            const inner = 72 + (index % 11) * 5;
            const outer = 410 + (index % 17) * 3;

            irisContext.beginPath();
            irisContext.moveTo(
              center + Math.cos(angle) * inner,
              center + Math.sin(angle) * inner,
            );
            irisContext.lineTo(
              center + Math.cos(angle) * outer,
              center + Math.sin(angle) * outer,
            );
            irisContext.strokeStyle =
              index % 4 === 0
                ? "rgba(232, 255, 239, 0.34)"
                : "rgba(2, 20, 31, 0.34)";
            irisContext.lineWidth = index % 5 === 0 ? 7 : 3;
            irisContext.stroke();
          }

          irisContext.beginPath();
          irisContext.arc(center, center, 500, 0, Math.PI * 2);
          irisContext.strokeStyle = "rgba(1, 10, 20, 0.82)";
          irisContext.lineWidth = 44;
          irisContext.stroke();

          irisContext.beginPath();
          irisContext.arc(center, center, 165, 0, Math.PI * 2);
          irisContext.fillStyle = "#020406";
          irisContext.fill();
        }

        const irisTexture = trackDisposable(new THREE.CanvasTexture(irisCanvas));
        irisTexture.colorSpace = THREE.SRGBColorSpace;

        const skinMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#8b625d",
            emissive: "#1c0f12",
            emissiveIntensity: 0.1,
            metalness: 0.02,
            roughness: 0.5,
            side: THREE.DoubleSide,
          }),
        );
        const rimMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#171113",
            emissive: "#020101",
            emissiveIntensity: 0.04,
            metalness: 0.02,
            roughness: 0.42,
          }),
        );
        const wetlineMaterial = trackDisposable(
          new THREE.MeshPhysicalMaterial({
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            color: "#d2a69e",
            emissive: "#2d1418",
            emissiveIntensity: 0.12,
            metalness: 0,
            roughness: 0.12,
          }),
        );

        const eyeWidth = 2.22;
        const lidPoint = (t: number, upper: boolean, z = 0.69) => {
          const x = -eyeWidth / 2 + t * eyeWidth;
          const arch = Math.sin(t * Math.PI);
          const base = -0.006 + (t - 0.5) * 0.014;
          const y = upper ? base + arch * 0.335 : base - arch * 0.285;

          return new THREE.Vector3(x, y, z);
        };

        const createScleraGeometry = () => {
          const rows = 28;
          const columns = 68;
          const positions: number[] = [];
          const uvs: number[] = [];
          const indices: number[] = [];

          for (let row = 0; row <= rows; row++) {
            const v = row / rows;

            for (let column = 0; column <= columns; column++) {
              const t = column / columns;
              const upper = lidPoint(t, true);
              const lower = lidPoint(t, false);
              const x = upper.x;
              const y = lower.y + (upper.y - lower.y) * v;
              const normalizedX = x / (eyeWidth / 2);
              const normalizedY = y / 0.36;
              const curvature =
                0.048 *
                Math.max(
                  0,
                  1 - normalizedX * normalizedX * 0.72 - normalizedY * normalizedY * 0.42,
                );

              positions.push(x, y, 0.632 + curvature);
              uvs.push(t, v);
            }
          }

          for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
              const a = row * (columns + 1) + column;
              const b = a + 1;
              const c = a + columns + 1;
              const d = c + 1;

              indices.push(a, c, b, b, c, d);
            }
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3),
          );
          geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
          geometry.setIndex(indices);
          geometry.computeVertexNormals();

          return geometry;
        };

        const scleraMaterial = trackDisposable(
          new THREE.MeshPhysicalMaterial({
            clearcoat: 0.34,
            clearcoatRoughness: 0.22,
            color: "#f2efe7",
            emissive: "#111315",
            emissiveIntensity: 0.05,
            metalness: 0,
            roughness: 0.36,
            side: THREE.DoubleSide,
          }),
        );
        const sclera = new THREE.Mesh(
          trackDisposable(createScleraGeometry()),
          scleraMaterial,
        );
        eyeRig.add(sclera);

        const irisMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            map: irisTexture,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        );
        const iris = new THREE.Mesh(
          trackDisposable(new THREE.CircleGeometry(0.265, 128)),
          irisMaterial,
        );
        iris.position.set(0, 0, 0.695);
        eyeRig.add(iris);

        const cornea = new THREE.Mesh(
          trackDisposable(new THREE.CircleGeometry(0.288, 128)),
          trackDisposable(
            new THREE.MeshPhysicalMaterial({
              clearcoat: 1,
              clearcoatRoughness: 0.02,
              color: "#ffffff",
              metalness: 0,
              opacity: 0.18,
              roughness: 0.02,
              side: THREE.DoubleSide,
              transparent: true,
              transmission: 0.68,
            }),
          ),
        );
        cornea.position.set(0, 0, 0.704);
        eyeRig.add(cornea);

        const createShapeMesh = (
          points: Array<[number, number]>,
          material: InstanceType<typeof THREE.Material>,
          z: number,
        ) => {
          const shape = new THREE.Shape();

          points.forEach(([x, y], index) => {
            if (index === 0) {
              shape.moveTo(x, y);
            } else {
              shape.lineTo(x, y);
            }
          });
          shape.closePath();

          const mesh = new THREE.Mesh(
            trackDisposable(new THREE.ShapeGeometry(shape, 32)),
            material,
          );
          mesh.position.z = z;

          return mesh;
        };

        const createLidBand = (
          upper: boolean,
          thickness: number,
          material: InstanceType<typeof THREE.Material>,
          z: number,
        ) => {
          const samples = 72;
          const outer: Array<[number, number]> = [];
          const inner: Array<[number, number]> = [];

          for (let index = 0; index < samples; index++) {
            const t = index / (samples - 1);
            const point = lidPoint(t, upper);
            const taper = Math.sin(t * Math.PI);
            const bandThickness = thickness * Math.pow(taper, 0.78);
            const yOffset = upper ? bandThickness : -bandThickness;

            outer.push([point.x, point.y + yOffset]);
            inner.push([point.x, point.y]);
          }

          return createShapeMesh([...outer, ...inner.reverse()], material, z);
        };

        const upperOpening = Array.from({ length: 60 }, (_, index) =>
          lidPoint(index / 59, true, 0.705),
        );
        const lowerOpening = Array.from({ length: 60 }, (_, index) =>
          lidPoint(index / 59, false, 0.703),
        );
        const upperSkin = [
          ...Array.from({ length: 60 }, (_, index) => {
            const t = index / 59;
            const inner = lidPoint(t, true, 0.705);
            const taper = Math.sin(t * Math.PI);
            const y = inner.y + taper * 0.145;
            const x = inner.x + (t - 0.5) * 0.05 * taper;

            return [x, y] as [number, number];
          }),
          ...upperOpening
            .slice()
            .reverse()
            .map((point) => [point.x, point.y] as [number, number]),
        ];
        const lowerSkin = [
          ...lowerOpening.map((point) => [point.x, point.y] as [number, number]),
          ...Array.from({ length: 60 }, (_, index) => {
            const t = 1 - index / 59;
            const inner = lidPoint(t, false, 0.703);
            const taper = Math.sin(t * Math.PI);
            const y = inner.y - taper * 0.1;
            const x = inner.x + (t - 0.5) * 0.035 * taper;

            return [x, y] as [number, number];
          }),
        ];

        eyeRig.add(createShapeMesh(upperSkin, skinMaterial, 0.718));
        eyeRig.add(createShapeMesh(lowerSkin, skinMaterial, 0.716));

        eyeRig.add(createLidBand(true, 0.052, rimMaterial, 0.724));
        eyeRig.add(createLidBand(false, 0.034, wetlineMaterial, 0.722));

        const highlightMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#ffffff",
            opacity: 0.42,
            side: THREE.DoubleSide,
            transparent: true,
          }),
        );
        const highlight = new THREE.Mesh(
          trackDisposable(new THREE.CircleGeometry(0.064, 24)),
          highlightMaterial,
        );
        highlight.position.set(0.13, 0.145, 0.716);
        highlight.scale.y = 0.42;
        eyeRig.add(highlight);

        const state = {
          dragging: false,
          lastX: 0,
          lastY: 0,
          targetRotationX: 0,
          targetRotationY: 0,
        };

        const onPointerDown = (event: PointerEvent) => {
          state.dragging = true;
          state.lastX = event.clientX;
          state.lastY = event.clientY;
          canvas.setPointerCapture(event.pointerId);
        };
        const onPointerMove = (event: PointerEvent) => {
          if (!state.dragging) {
            return;
          }

          const deltaX = event.clientX - state.lastX;
          const deltaY = event.clientY - state.lastY;
          state.lastX = event.clientX;
          state.lastY = event.clientY;
          state.targetRotationY += deltaX * 0.008;
          state.targetRotationX = Math.max(
            -0.55,
            Math.min(0.38, state.targetRotationX + deltaY * 0.006),
          );
        };
        const onPointerUp = (event: PointerEvent) => {
          state.dragging = false;

          if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
          }
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.floor(bounds.width));
          const height = Math.max(1, Math.floor(bounds.height));

          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        resize();

        const render = () => {
          const time = performance.now() * 0.001;

          eyeRig.rotation.x += (state.targetRotationX - eyeRig.rotation.x) * 0.08;
          eyeRig.rotation.y += (state.targetRotationY - eyeRig.rotation.y) * 0.08;
          highlight.material.opacity = 0.58 + Math.sin(time * 1.6) * 0.08;
          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };

        render();
        disposeScene = () => {
          cancelAnimationFrame(animationFrame);
          resizeObserver?.disconnect();
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerup", onPointerUp);
          canvas.removeEventListener("pointercancel", onPointerUp);
          disposableResources.forEach((resource) => resource.dispose());
          renderer.dispose();
        };
      } catch (error) {
        console.error("Failed to render eye model lab.", error);
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
    <main className="eye-model-lab" aria-label="Eye model review workspace">
      <canvas ref={canvasRef} className="eye-model-lab__canvas" />
      {showFallback ? <div className="eye-model-lab__fallback" /> : null}
    </main>
  );
}

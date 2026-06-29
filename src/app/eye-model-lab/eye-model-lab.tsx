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
        eyeRig.rotation.set(-0.04, -0.22, 0.015);
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

        const scleraMaterial = trackDisposable(
          new THREE.MeshPhysicalMaterial({
            clearcoat: 0.38,
            clearcoatRoughness: 0.18,
            color: "#f0eee5",
            emissive: "#17191a",
            emissiveIntensity: 0.08,
            metalness: 0,
            roughness: 0.32,
          }),
        );
        const sclera = new THREE.Mesh(
          trackDisposable(new THREE.SphereGeometry(0.88, 96, 48)),
          scleraMaterial,
        );
        sclera.scale.set(1.12, 0.78, 0.66);
        eyeRig.add(sclera);

        const irisMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            map: irisTexture,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        );
        const iris = new THREE.Mesh(
          trackDisposable(new THREE.CircleGeometry(0.34, 96)),
          irisMaterial,
        );
        iris.position.z = 0.595;
        eyeRig.add(iris);

        const cornea = new THREE.Mesh(
          trackDisposable(new THREE.SphereGeometry(0.895, 96, 48)),
          trackDisposable(
            new THREE.MeshPhysicalMaterial({
              clearcoat: 1,
              clearcoatRoughness: 0.02,
              color: "#ffffff",
              metalness: 0,
              opacity: 0.2,
              roughness: 0.02,
              transparent: true,
              transmission: 0.86,
            }),
          ),
        );
        cornea.scale.set(1.12, 0.78, 0.69);
        eyeRig.add(cornea);

        const skinMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#9b6d63",
            emissive: "#1c0f12",
            emissiveIntensity: 0.1,
            metalness: 0.02,
            roughness: 0.5,
            side: THREE.DoubleSide,
          }),
        );
        const rimMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#c49084",
            emissive: "#27151a",
            emissiveIntensity: 0.08,
            metalness: 0.02,
            roughness: 0.34,
          }),
        );
        const wetlineMaterial = trackDisposable(
          new THREE.MeshPhysicalMaterial({
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            color: "#f2c8bd",
            emissive: "#2d1418",
            emissiveIntensity: 0.12,
            metalness: 0,
            roughness: 0.12,
          }),
        );
        const lashMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#090708",
            emissive: "#000000",
            metalness: 0,
            roughness: 0.64,
          }),
        );

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

        const lidPoint = (t: number, upper: boolean) => {
          const x = -1.15 + t * 2.3;
          const arch = Math.sin(t * Math.PI);
          const skew = (t - 0.5) * 0.08;
          const y = upper
            ? 0.04 + arch * 0.48 + skew
            : -0.1 - arch * 0.34 + skew * 0.32;

          return new THREE.Vector3(x, y, 0.68);
        };

        const upperOpening = Array.from({ length: 42 }, (_, index) =>
          lidPoint(index / 41, true),
        );
        const lowerOpening = Array.from({ length: 42 }, (_, index) =>
          lidPoint(index / 41, false),
        );
        const upperSkin = [
          ...Array.from({ length: 42 }, (_, index) => {
            const t = index / 41;
            const x = -1.32 + t * 2.64;
            const y = 0.16 + Math.sin(t * Math.PI) * 0.82 + (t - 0.5) * 0.08;

            return [x, y] as [number, number];
          }),
          ...upperOpening
            .slice()
            .reverse()
            .map((point) => [point.x, point.y] as [number, number]),
        ];
        const lowerSkin = [
          ...lowerOpening.map((point) => [point.x, point.y] as [number, number]),
          ...Array.from({ length: 42 }, (_, index) => {
            const t = 1 - index / 41;
            const x = -1.28 + t * 2.56;
            const y = -0.18 - Math.sin(t * Math.PI) * 0.58 + (t - 0.5) * 0.04;

            return [x, y] as [number, number];
          }),
        ];

        eyeRig.add(createShapeMesh(upperSkin, skinMaterial, 0.66));
        eyeRig.add(createShapeMesh(lowerSkin, skinMaterial, 0.65));

        const makeTube = (
          points: Array<InstanceType<typeof THREE.Vector3>>,
          radius: number,
          material: InstanceType<typeof THREE.Material>,
          segments = 48,
        ) => {
          return new THREE.Mesh(
            trackDisposable(
              new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(points),
                segments,
                radius,
                10,
                false,
              ),
            ),
            material,
          );
        };

        eyeRig.add(makeTube(upperOpening, 0.04, rimMaterial, 72));
        eyeRig.add(makeTube(lowerOpening, 0.032, wetlineMaterial, 72));

        const highlightMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#ffffff",
            opacity: 0.72,
            side: THREE.DoubleSide,
            transparent: true,
          }),
        );
        const highlight = new THREE.Mesh(
          trackDisposable(new THREE.CircleGeometry(0.095, 24)),
          highlightMaterial,
        );
        highlight.position.set(0.18, 0.2, 0.715);
        highlight.scale.y = 0.48;
        eyeRig.add(highlight);

        for (let index = 0; index < 42; index++) {
          const t = index / 41;
          const base = lidPoint(t, true);
          const length = 0.22 + Math.sin(t * Math.PI) * 0.18;
          const side = (t - 0.5) * 0.6;
          const tip = new THREE.Vector3(
            base.x + side,
            base.y + length,
            0.77 - Math.abs(t - 0.5) * 0.16,
          );
          const control = new THREE.Vector3(
            (base.x + tip.x) / 2,
            base.y + length * 0.62,
            0.85,
          );

          eyeRig.add(makeTube([base, control, tip], 0.006, lashMaterial, 12));
        }

        for (let index = 0; index < 22; index++) {
          const t = index / 21;
          const base = lidPoint(t, false);
          const length = 0.11 + Math.sin(t * Math.PI) * 0.06;
          const tip = new THREE.Vector3(
            base.x + (t - 0.5) * 0.18,
            base.y - length,
            0.72,
          );

          eyeRig.add(makeTube([base, tip], 0.004, lashMaterial, 8));
        }

        const backing = new THREE.Mesh(
          trackDisposable(new THREE.PlaneGeometry(3.3, 2.1)),
          trackDisposable(
            new THREE.MeshBasicMaterial({
              color: "#071019",
              opacity: 0.36,
              transparent: true,
            }),
          ),
        );
        backing.position.z = -0.82;
        eyeRig.add(backing);

        const state = {
          dragging: false,
          lastX: 0,
          lastY: 0,
          targetRotationX: -0.04,
          targetRotationY: -0.22,
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

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );

        const render = () => {
          const time = performance.now() * 0.001;

          if (!state.dragging && !reducedMotion.matches) {
            state.targetRotationY += 0.0022;
          }

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

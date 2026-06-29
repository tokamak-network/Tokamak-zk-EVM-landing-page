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

          irisContext.fillStyle = "#f7f4ed";
          irisContext.fillRect(0, 0, irisCanvas.width, irisCanvas.height);

          for (let index = 0; index < 96; index++) {
            const angle = (index / 96) * Math.PI * 2;
            const inner = 150;
            const outer = 430;

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
              index % 3 === 0
                ? "rgba(10, 10, 10, 0.62)"
                : "rgba(10, 10, 10, 0.34)";
            irisContext.lineWidth = index % 4 === 0 ? 7 : 4;
            irisContext.stroke();
          }

          irisContext.beginPath();
          irisContext.arc(center, center, 452, 0, Math.PI * 2);
          irisContext.strokeStyle = "#050505";
          irisContext.lineWidth = 72;
          irisContext.stroke();

          irisContext.beginPath();
          irisContext.arc(center, center, 165, 0, Math.PI * 2);
          irisContext.fillStyle = "#050505";
          irisContext.fill();

          irisContext.beginPath();
          irisContext.ellipse(
            center + 118,
            center - 124,
            70,
            36,
            -0.18,
            0,
            Math.PI * 2,
          );
          irisContext.fillStyle = "rgba(255, 255, 255, 0.9)";
          irisContext.fill();
        }

        const irisTexture = trackDisposable(new THREE.CanvasTexture(irisCanvas));
        irisTexture.colorSpace = THREE.SRGBColorSpace;

        const inkMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            color: "#050505",
            side: THREE.DoubleSide,
          }),
        );

        const eyeWidth = 2.08;
        const lidPoint = (t: number, upper: boolean, z = 0.69) => {
          const x = -eyeWidth / 2 + t * eyeWidth;
          const arch = Math.sin(t * Math.PI);
          const base = -0.006 + (t - 0.5) * 0.014;
          const y = upper ? base + arch * 0.425 : base - arch * 0.34;

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
          new THREE.MeshBasicMaterial({
            color: "#f8f6ef",
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
          trackDisposable(new THREE.CircleGeometry(0.255, 128)),
          irisMaterial,
        );
        iris.position.set(0, -0.045, 0.695);
        eyeRig.add(iris);

        const cornea = new THREE.Mesh(
          trackDisposable(new THREE.CircleGeometry(0.276, 128)),
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
        cornea.position.set(0, -0.045, 0.704);
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

        const createLidLine = (
          upper: boolean,
          radius: number,
        ) => {
          const points = Array.from({ length: 68 }, (_, index) => {
            const t = 0.025 + (index / 67) * 0.95;
            const point = lidPoint(t, upper, 0.736);

            point.y += upper ? -0.026 : 0.022;

            return point;
          });

          return new THREE.Mesh(
            trackDisposable(
              new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(points),
                96,
                radius,
                8,
                false,
              ),
            ),
            inkMaterial,
          );
        };

        eyeRig.add(createLidLine(true, 0.011));
        eyeRig.add(createLidLine(false, 0.008));

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
          eyeRig.rotation.x += (state.targetRotationX - eyeRig.rotation.x) * 0.08;
          eyeRig.rotation.y += (state.targetRotationY - eyeRig.rotation.y) * 0.08;
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

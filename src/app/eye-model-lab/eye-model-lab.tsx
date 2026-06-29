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
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        camera.position.set(0, 0, 6);
        camera.lookAt(0, 0, 0);

        const disposableResources: Array<{ dispose: () => void }> = [];
        const trackDisposable = <T extends { dispose: () => void }>(
          resource: T,
        ) => {
          disposableResources.push(resource);
          return resource;
        };

        scene.add(new THREE.AmbientLight(0xffffff, 1.8));

        const eyeRig = new THREE.Group();
        scene.add(eyeRig);

        const eyeTextureCanvas = document.createElement("canvas");
        eyeTextureCanvas.width = 2400;
        eyeTextureCanvas.height = 1200;
        const context = eyeTextureCanvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create eye texture canvas.");
        }

        const centerX = eyeTextureCanvas.width / 2;
        const centerY = eyeTextureCanvas.height / 2;
        const ink = "#070707";
        const paper = "#f9f7ef";

        context.clearRect(0, 0, eyeTextureCanvas.width, eyeTextureCanvas.height);
        context.lineCap = "round";
        context.lineJoin = "round";

        const drawEyePath = () => {
          context.beginPath();
          context.moveTo(centerX - 770, centerY + 18);
          context.bezierCurveTo(
            centerX - 430,
            centerY - 255,
            centerX + 430,
            centerY - 255,
            centerX + 770,
            centerY + 18,
          );
          context.bezierCurveTo(
            centerX + 430,
            centerY + 205,
            centerX - 430,
            centerY + 205,
            centerX - 770,
            centerY + 18,
          );
          context.closePath();
        };

        drawEyePath();
        context.fillStyle = paper;
        context.fill();
        context.strokeStyle = ink;
        context.lineWidth = 20;
        context.stroke();

        context.beginPath();
        context.moveTo(centerX - 650, centerY + 2);
        context.bezierCurveTo(
          centerX - 355,
          centerY - 168,
          centerX + 345,
          centerY - 168,
          centerX + 650,
          centerY + 2,
        );
        context.strokeStyle = ink;
        context.lineWidth = 26;
        context.stroke();

        context.beginPath();
        context.moveTo(centerX - 560, centerY + 82);
        context.bezierCurveTo(
          centerX - 260,
          centerY + 155,
          centerX + 270,
          centerY + 155,
          centerX + 560,
          centerY + 82,
        );
        context.strokeStyle = ink;
        context.lineWidth = 10;
        context.stroke();

        const irisX = centerX;
        const irisY = centerY + 54;
        const irisRadius = 145;

        context.beginPath();
        context.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
        context.fillStyle = paper;
        context.fill();
        context.strokeStyle = ink;
        context.lineWidth = 24;
        context.stroke();

        for (let index = 0; index < 64; index++) {
          const angle = (index / 64) * Math.PI * 2;
          const inner = 54;
          const outer = 128;

          context.beginPath();
          context.moveTo(
            irisX + Math.cos(angle) * inner,
            irisY + Math.sin(angle) * inner,
          );
          context.lineTo(
            irisX + Math.cos(angle) * outer,
            irisY + Math.sin(angle) * outer,
          );
          context.strokeStyle =
            index % 4 === 0 ? "rgba(7, 7, 7, 0.72)" : "rgba(7, 7, 7, 0.42)";
          context.lineWidth = index % 4 === 0 ? 5 : 3;
          context.stroke();
        }

        context.beginPath();
        context.arc(irisX, irisY, 72, 0, Math.PI * 2);
        context.fillStyle = ink;
        context.fill();

        context.beginPath();
        context.ellipse(irisX + 54, irisY - 58, 43, 21, -0.2, 0, Math.PI * 2);
        context.fillStyle = "#ffffff";
        context.fill();

        for (let index = 0; index < 9; index++) {
          const x = centerX - 300 + index * 75;

          context.beginPath();
          context.moveTo(x, centerY + 132);
          context.lineTo(x + 34, centerY + 228);
          context.strokeStyle = "rgba(7, 7, 7, 0.72)";
          context.lineWidth = 6;
          context.stroke();
        }

        const eyeTexture = trackDisposable(
          new THREE.CanvasTexture(eyeTextureCanvas),
        );
        eyeTexture.colorSpace = THREE.SRGBColorSpace;

        const faceMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            map: eyeTexture,
            transparent: true,
            toneMapped: false,
          }),
        );
        const face = new THREE.Mesh(
          trackDisposable(new THREE.PlaneGeometry(3.8, 1.9)),
          faceMaterial,
        );
        face.position.z = 0.04;
        eyeRig.add(face);

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
          state.targetRotationY += deltaX * 0.006;
          state.targetRotationX = Math.max(
            -0.34,
            Math.min(0.3, state.targetRotationX + deltaY * 0.005),
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

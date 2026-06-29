"use client";

import { useEffect, useRef } from "react";

export function EyeModelLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const draw = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);

      const eyeWidth = Math.min(width * 0.52, 620);
      const eyeHeight = eyeWidth / 3.25;
      const centerX = width / 2;
      const centerY = height / 2;
      const leftX = centerX - eyeWidth / 2;
      const rightX = centerX + eyeWidth / 2;
      const upperY = centerY - eyeHeight * 0.52;
      const lowerY = centerY + eyeHeight * 0.34;
      const cornerY = centerY + eyeHeight * 0.02;

      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#050505";
      context.lineWidth = Math.max(2.5, eyeWidth * 0.012);

      context.beginPath();
      context.moveTo(leftX, cornerY);
      context.bezierCurveTo(
        centerX - eyeWidth * 0.31,
        upperY,
        centerX + eyeWidth * 0.31,
        upperY,
        rightX,
        cornerY,
      );
      context.bezierCurveTo(
        centerX + eyeWidth * 0.28,
        lowerY,
        centerX - eyeWidth * 0.28,
        lowerY,
        leftX,
        cornerY,
      );
      context.closePath();
      context.stroke();
    };

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    draw();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <main className="eye-model-lab" aria-label="Eye shape drawing workspace">
      <canvas ref={canvasRef} className="eye-model-lab__canvas" />
    </main>
  );
}

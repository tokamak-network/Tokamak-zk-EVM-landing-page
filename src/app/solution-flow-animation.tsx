"use client";

import { useEffect, useRef, useState } from "react";
import { createEthereumDiamondModel } from "./ethereum-diamond-model";
import { TonigmaNetworkLogo } from "./tonigma-network-logo";

type Disposable = {
  dispose: () => void;
};

const triangleRadius = 1.16;
const halfTriangleRadius = triangleRadius / 2;
const triangleHorizontalRadius = triangleRadius * Math.sqrt(3) / 2;

export function SolutionFlowAnimation() {
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
        const camera = new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.1, 100);
        camera.position.set(0, 0.28, 5.4);
        camera.lookAt(0, 0, 0);

        const disposableResources: Disposable[] = [];

        function track<T extends Disposable>(resource: T) {
          disposableResources.push(resource);
          return resource;
        }

        scene.add(new THREE.AmbientLight(0xd8e9ff, 1.7));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(3.4, 4.8, 5);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x58b7ff, 1.4);
        rimLight.position.set(-3.4, -1.4, 4.8);
        scene.add(rimLight);

        const root = new THREE.Group();
        scene.add(root);

        const ethereumPosition = new THREE.Vector3(0, triangleRadius, 0);
        const userPosition = new THREE.Vector3(-triangleHorizontalRadius, -halfTriangleRadius, 0);
        const tonigmaPosition = new THREE.Vector3(triangleHorizontalRadius, -halfTriangleRadius, 0);
        const userBaseScale = 0.943;

        const createUserNode = () => {
          const group = new THREE.Group();
          group.position.copy(userPosition);
          group.scale.setScalar(userBaseScale);

          const avatarMaterial = track(
            new THREE.MeshPhysicalMaterial({
              clearcoat: 1,
              clearcoatRoughness: 0.08,
              color: "#d9f8ff",
              emissive: "#1f6f92",
              emissiveIntensity: 0.06,
              metalness: 0.02,
              roughness: 0.24,
            }),
          );
          const reflectionMaterial = track(
            new THREE.MeshBasicMaterial({
              blending: THREE.AdditiveBlending,
              color: 0xffffff,
              depthWrite: false,
              opacity: 0.2,
              transparent: true,
            }),
          );
          const avatarShadeMaterial = track(
            new THREE.MeshBasicMaterial({
              blending: THREE.MultiplyBlending,
              color: 0x8adfff,
              depthWrite: false,
              opacity: 0.2,
              premultipliedAlpha: true,
              transparent: true,
            }),
          );
          const head = new THREE.Mesh(
            track(new THREE.SphereGeometry(0.2, 64, 32)),
            avatarMaterial,
          );
          head.position.set(0, 0.18, 0.04);
          head.scale.set(0.98, 1.02, 0.82);
          group.add(head);

          const headReflection = new THREE.Mesh(
            track(new THREE.SphereGeometry(0.07, 32, 16)),
            reflectionMaterial,
          );
          headReflection.position.set(-0.065, 0.255, 0.16);
          headReflection.scale.set(1, 0.48, 0.22);
          group.add(headReflection);

          const headShade = new THREE.Mesh(
            track(new THREE.SphereGeometry(0.205, 64, 32)),
            avatarShadeMaterial,
          );
          headShade.position.set(0.055, 0.105, 0.13);
          headShade.scale.set(0.9, 0.38, 0.18);
          group.add(headShade);

          const shoulderGeometry = track(new THREE.SphereGeometry(0.42, 64, 32));
          const torso = new THREE.Mesh(shoulderGeometry, avatarMaterial);
          torso.position.set(0, -0.27, 0.04);
          torso.scale.set(1.16, 0.56, 0.46);
          group.add(torso);

          const torsoShade = new THREE.Mesh(
            track(new THREE.SphereGeometry(0.42, 64, 32)),
            avatarShadeMaterial,
          );
          torsoShade.position.set(0.05, -0.35, 0.13);
          torsoShade.scale.set(1.05, 0.25, 0.18);
          group.add(torsoShade);

          const torsoReflection = new THREE.Mesh(
            track(new THREE.CircleGeometry(0.12, 48)),
            reflectionMaterial,
          );
          torsoReflection.position.set(-0.16, -0.17, 0.18);
          torsoReflection.scale.set(1.5, 0.32, 1);
          torsoReflection.rotation.z = -0.22;
          group.add(torsoReflection);

          return group;
        };

        const {
          group: ethereumNode,
          update: updateEthereumDiamond,
        } = createEthereumDiamondModel({
          THREE,
          camera,
          scale: 0.4715,
          track,
        });
        const ethereumViewGroup = new THREE.Group();
        ethereumViewGroup.position.copy(ethereumPosition);
        ethereumViewGroup.rotation.x = (31.5 * Math.PI) / 180;
        ethereumNode.rotation.y = 0.58;
        ethereumViewGroup.add(ethereumNode);
        const userNode = createUserNode();
        root.add(ethereumViewGroup, userNode);

        const lightTrailCanvas = document.createElement("canvas");
        lightTrailCanvas.width = 256;
        lightTrailCanvas.height = 80;
        const lightTrailContext = lightTrailCanvas.getContext("2d");

        if (lightTrailContext) {
          const horizontalGlow = lightTrailContext.createLinearGradient(
            0,
            0,
            lightTrailCanvas.width,
            0,
          );
          horizontalGlow.addColorStop(0, "rgba(255,255,255,0)");
          horizontalGlow.addColorStop(0.24, "rgba(150,232,255,0.18)");
          horizontalGlow.addColorStop(0.5, "rgba(255,255,255,1)");
          horizontalGlow.addColorStop(0.76, "rgba(150,232,255,0.18)");
          horizontalGlow.addColorStop(1, "rgba(255,255,255,0)");

          const verticalGlow = lightTrailContext.createRadialGradient(
            lightTrailCanvas.width / 2,
            lightTrailCanvas.height / 2,
            0,
            lightTrailCanvas.width / 2,
            lightTrailCanvas.height / 2,
            lightTrailCanvas.height / 2,
          );
          verticalGlow.addColorStop(0, "rgba(255,255,255,1)");
          verticalGlow.addColorStop(0.54, "rgba(190,246,255,0.74)");
          verticalGlow.addColorStop(1, "rgba(255,255,255,0)");

          lightTrailContext.fillStyle = horizontalGlow;
          lightTrailContext.fillRect(
            0,
            0,
            lightTrailCanvas.width,
            lightTrailCanvas.height,
          );
          lightTrailContext.globalCompositeOperation = "destination-in";
          lightTrailContext.fillStyle = verticalGlow;
          lightTrailContext.fillRect(
            0,
            0,
            lightTrailCanvas.width,
            lightTrailCanvas.height,
          );
        }

        const lightTrailTexture = track(new THREE.CanvasTexture(lightTrailCanvas));
        lightTrailTexture.colorSpace = THREE.SRGBColorSpace;
        const lightTrailGeometry = track(new THREE.PlaneGeometry(1, 1));
        const lightTrailGlowMaterial = track(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#4acfff",
            depthWrite: false,
            map: lightTrailTexture,
            opacity: 0.72,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
          }),
        );
        const lightTrailCoreMaterial = track(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#f4fdff",
            depthWrite: false,
            map: lightTrailTexture,
            opacity: 0.98,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
          }),
        );
        const lightTrailGlow = new THREE.Mesh(lightTrailGeometry, lightTrailGlowMaterial);
        const lightTrailCore = new THREE.Mesh(lightTrailGeometry, lightTrailCoreMaterial);
        lightTrailGlow.renderOrder = 8;
        lightTrailCore.renderOrder = 9;
        root.add(lightTrailGlow, lightTrailCore);

        const clock = new THREE.Clock();
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const ethereumSpinSpeed = 0.37;

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const width = Math.max(bounds.width, 1);
          const height = Math.max(bounds.height, 1);
          const aspect = width / height;
          const verticalSize = 4.15;

          renderer.setSize(width, height, false);
          camera.left = (-verticalSize * aspect) / 2;
          camera.right = (verticalSize * aspect) / 2;
          camera.top = verticalSize / 2;
          camera.bottom = -verticalSize / 2;
          camera.updateProjectionMatrix();
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        resize();

        const render = () => {
          const elapsed = clock.getElapsedTime();
          const time = reducedMotion.matches ? 0.35 : elapsed;
          const pulse = Math.sin(time * 2.2) * 0.5 + 0.5;

          if (!reducedMotion.matches) {
            ethereumNode.rotation.y = 0.58 + time * ethereumSpinSpeed;
          }
          updateEthereumDiamond(time);
          userNode.scale.setScalar(userBaseScale + pulse * 0.018);

          const orbitAngle = Math.PI / 2 - time * 1.15;
          const orbitX = Math.cos(orbitAngle) * triangleRadius;
          const orbitY = Math.sin(orbitAngle) * triangleRadius;
          const tangentAngle = orbitAngle - Math.PI / 2;
          const trailIntensity = 0.86 + Math.sin(time * 3.4) * 0.08;

          lightTrailGlow.position.set(orbitX, orbitY, 0.26);
          lightTrailCore.position.copy(lightTrailGlow.position);
          lightTrailGlow.rotation.z = tangentAngle;
          lightTrailCore.rotation.z = tangentAngle;
          lightTrailGlow.scale.set(1.04, 0.34, 1);
          lightTrailCore.scale.set(0.74, 0.13, 1);
          lightTrailGlowMaterial.opacity = trailIntensity * 0.86;
          lightTrailCoreMaterial.opacity = trailIntensity;

          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };

        render();

        disposeScene = () => {
          disposableResources.forEach((resource) => resource.dispose());
          renderer.dispose();
        };
      } catch (error) {
        console.error("Failed to render solution flow animation.", error);
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
    <div className="solution-flow" aria-hidden="true">
      <canvas ref={canvasRef} className="solution-flow__canvas" />
      <span className="solution-flow__capsule solution-flow__capsule--ethereum" />
      <span className="solution-flow__capsule solution-flow__capsule--user" />
      <span className="solution-flow__capsule solution-flow__capsule--tonigma" />
      <TonigmaNetworkLogo
        className="solution-flow__tonigma-logo"
        playback="final-flash"
      />
      {showFallback ? (
        <div className="solution-flow__fallback">
          <span className="solution-flow__fallback-node solution-flow__fallback-node--ethereum" />
          <span className="solution-flow__fallback-node solution-flow__fallback-node--user" />
        </div>
      ) : null}
    </div>
  );
}

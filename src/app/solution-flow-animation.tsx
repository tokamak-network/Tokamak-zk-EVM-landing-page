"use client";

import { useEffect, useRef, useState } from "react";
import { createEthereumDiamondModel } from "./ethereum-diamond-model";
import { TonigmaNetworkLogo } from "./tonigma-network-logo";

type Disposable = {
  dispose: () => void;
};

type FlowPath = {
  curve: import("three").QuadraticBezierCurve3;
  color: number;
  offsets: number[];
  speed: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function fadeAtEnds(progress: number) {
  return clamp(Math.min(progress / 0.12, (1 - progress) / 0.12));
}

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

        const ethereumPosition = new THREE.Vector3(-0.6333333333, 1.2366666667, 0);
        const userPosition = new THREE.Vector3(-0.6333333333, -1.2633333333, 0);
        const tonigmaPosition = new THREE.Vector3(1.2666666667, 0.0266666667, 0);
        const userBaseScale = 0.82;

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
          scale: 0.47,
          track,
        });
        const ethereumViewGroup = new THREE.Group();
        ethereumViewGroup.position.copy(ethereumPosition);
        ethereumViewGroup.rotation.x = (31.5 * Math.PI) / 180;
        ethereumNode.rotation.y = 0.58;
        ethereumViewGroup.add(ethereumNode);
        const userNode = createUserNode();
        root.add(ethereumViewGroup, userNode);

        const flowPaths: FlowPath[] = [
          {
            color: 0x60d7ff,
            curve: new THREE.QuadraticBezierCurve3(
              ethereumPosition,
              new THREE.Vector3(0.68, 1.28, 0.12),
              tonigmaPosition,
            ),
            offsets: [0, 0.38, 0.74],
            speed: 0.18,
          },
          {
            color: 0x8adfff,
            curve: new THREE.QuadraticBezierCurve3(
              tonigmaPosition,
              new THREE.Vector3(1.08, -0.94, 0.08),
              userPosition,
            ),
            offsets: [0.12, 0.52, 0.86],
            speed: 0.18,
          },
          {
            color: 0xd9f2ff,
            curve: new THREE.QuadraticBezierCurve3(
              userPosition,
              new THREE.Vector3(-0.78, -0.1, 0.04),
              ethereumPosition,
            ),
            offsets: [0.24, 0.62, 0.94],
            speed: 0.18,
          },
        ];

        const pulseMaterial = (color: number, opacity: number) =>
          track(
            new THREE.MeshBasicMaterial({
              blending: THREE.AdditiveBlending,
              color,
              depthWrite: false,
              opacity,
              transparent: true,
            }),
          );

        const pulseGeometry = track(new THREE.SphereGeometry(0.035, 16, 10));
        const pulseTailGeometry = track(new THREE.SphereGeometry(0.022, 12, 8));
        const pulses = flowPaths.flatMap((path) =>
          path.offsets.map((offset) => {
            const core = new THREE.Mesh(pulseGeometry, pulseMaterial(path.color, 0.95));
            const tail = [0.055, 0.11, 0.165].map((lag, index) => {
              const mesh = new THREE.Mesh(
                pulseTailGeometry,
                pulseMaterial(path.color, 0.4 - index * 0.1),
              );

              root.add(mesh);

              return { lag, mesh };
            });

            root.add(core);

            return { core, offset, path, tail };
          }),
        );

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

          pulses.forEach(({ core, offset, path, tail }) => {
            const progress = (time * path.speed + offset) % 1;
            const opacity = fadeAtEnds(progress);

            core.position.copy(path.curve.getPoint(progress));
            core.scale.setScalar(1 + opacity * 0.42);
            core.material.opacity = 0.92 * opacity;

            tail.forEach(({ lag, mesh }, index) => {
              const tailProgress = (progress - lag + 1) % 1;
              const tailOpacity = fadeAtEnds(tailProgress) * opacity * (0.44 - index * 0.09);

              mesh.position.copy(path.curve.getPoint(tailProgress));
              mesh.material.opacity = tailOpacity;
            });
          });

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

"use client";

import { useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type LogoNode = {
  id: string;
  point: Point;
  radius: number;
  shape: "circle" | "diamond" | "ring";
  turnOnAt: number;
};

type LogoEdge = {
  from: LogoNode;
  to: LogoNode;
  startAt: number;
  duration: number;
};

const CANVAS = 1254;
const CENTER = CANVAS / 2;
const LOGO_SCALE = 2;
const LINE_WIDTH = 15;
const VISIBLE_GAP = 12;
const ETHEREUM_RATIO = 834 / 512;
const CYCLE_SECONDS = 8.8;

const inputNodes: LogoNode[] = [
  {
    id: "input-upper",
    point: { x: 394, y: 514 },
    radius: 30,
    shape: "ring",
    turnOnAt: 0.25,
  },
  {
    id: "input-lower",
    point: { x: 394, y: 740 },
    radius: 30,
    shape: "ring",
    turnOnAt: 0.35,
  },
];

const compilerNodes: LogoNode[] = [
  {
    id: "compiler-upper",
    point: { x: 539, y: 401 },
    radius: 40,
    shape: "circle",
    turnOnAt: 1.85,
  },
  {
    id: "compiler-middle",
    point: { x: 539, y: 627 },
    radius: 40,
    shape: "circle",
    turnOnAt: 2.05,
  },
  {
    id: "compiler-lower",
    point: { x: 539, y: 853 },
    radius: 40,
    shape: "circle",
    turnOnAt: 2.25,
  },
];

const commitmentNodes: LogoNode[] = [
  {
    id: "commitment-upper",
    point: { x: 684, y: 514 },
    radius: 50,
    shape: "circle",
    turnOnAt: 3.8,
  },
  {
    id: "commitment-lower",
    point: { x: 684, y: 740 },
    radius: 50,
    shape: "circle",
    turnOnAt: 4.05,
  },
];

const outputNode: LogoNode = {
  id: "output",
  point: { x: 829, y: 627 },
  radius: 60,
  shape: "diamond",
  turnOnAt: 5.55,
};

const allNodes = [
  ...inputNodes,
  ...compilerNodes,
  ...commitmentNodes,
  outputNode,
];

const edges: LogoEdge[] = [
  {
    from: inputNodes[0],
    to: compilerNodes[0],
    startAt: 0.92,
    duration: 0.86,
  },
  {
    from: inputNodes[0],
    to: compilerNodes[1],
    startAt: 1.02,
    duration: 0.92,
  },
  {
    from: inputNodes[1],
    to: compilerNodes[1],
    startAt: 1.12,
    duration: 0.92,
  },
  {
    from: inputNodes[1],
    to: compilerNodes[2],
    startAt: 1.22,
    duration: 0.86,
  },
  {
    from: compilerNodes[0],
    to: commitmentNodes[0],
    startAt: 2.62,
    duration: 0.88,
  },
  {
    from: compilerNodes[1],
    to: commitmentNodes[0],
    startAt: 2.74,
    duration: 0.9,
  },
  {
    from: compilerNodes[1],
    to: commitmentNodes[1],
    startAt: 2.86,
    duration: 0.9,
  },
  {
    from: compilerNodes[2],
    to: commitmentNodes[1],
    startAt: 2.98,
    duration: 0.88,
  },
  {
    from: commitmentNodes[0],
    to: outputNode,
    startAt: 4.55,
    duration: 0.9,
  },
  {
    from: commitmentNodes[1],
    to: outputNode,
    startAt: 4.82,
    duration: 0.9,
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function scenePoint(point: Point) {
  const transformedX = CENTER + (point.x - CENTER) * LOGO_SCALE;
  const transformedY = CENTER + (point.y - CENTER) * LOGO_SCALE;

  return {
    x: ((transformedX - CENTER) / CENTER) * 1.82,
    y: -((transformedY - CENTER) / CENTER) * 1.82,
  };
}

function sceneLength(value: number) {
  return (value * LOGO_SCALE * 1.82) / CENTER;
}

function nodeBoundaryDistance(node: LogoNode, unitX: number, unitY: number) {
  if (node.shape !== "diamond") {
    return node.radius;
  }

  const halfWidth = node.radius;
  const halfHeight = node.radius * ETHEREUM_RATIO;

  return 1 / (Math.abs(unitX) / halfWidth + Math.abs(unitY) / halfHeight);
}

function edgeSegment(edge: LogoEdge) {
  const dx = edge.to.point.x - edge.from.point.x;
  const dy = edge.to.point.y - edge.from.point.y;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const unitX = dx / length;
  const unitY = dy / length;
  const fromOffset =
    nodeBoundaryDistance(edge.from, unitX, unitY) + VISIBLE_GAP + LINE_WIDTH / 2;
  const toOffset =
    nodeBoundaryDistance(edge.to, -unitX, -unitY) + VISIBLE_GAP + LINE_WIDTH / 2;

  return {
    from: scenePoint({
      x: edge.from.point.x + unitX * fromOffset,
      y: edge.from.point.y + unitY * fromOffset,
    }),
    to: scenePoint({
      x: edge.to.point.x - unitX * toOffset,
      y: edge.to.point.y - unitY * toOffset,
    }),
  };
}

export function TonigmaNetworkLogo() {
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
          preserveDrawingBuffer: true,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 10);
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        const root = new THREE.Group();
        root.rotation.z = -0.02;
        scene.add(root);

        const disposableGeometries: Array<{ dispose: () => void }> = [];
        const disposableMaterials: Array<{ dispose: () => void }> = [];
        const nodeRenders: Array<{
          active: { material: { opacity: number }; scale: { setScalar: (value: number) => void } };
          glow: {
            scale: { setScalar: (value: number) => void };
            setOpacity: (value: number) => void;
          };
          node: LogoNode;
        }> = [];
        const edgeRenders: Array<{
          active: ReturnType<typeof createCapsule>;
          edge: LogoEdge;
          pulse: { material: { opacity: number }; position: { set: (x: number, y: number, z: number) => void } };
          sparkle: { material: { opacity: number }; position: { set: (x: number, y: number, z: number) => void } };
        }> = [];

        function trackGeometry<T extends { dispose: () => void }>(geometry: T) {
          disposableGeometries.push(geometry);
          return geometry;
        }

        function trackMaterial<T extends { dispose: () => void }>(material: T) {
          disposableMaterials.push(material);
          return material;
        }

        function createCircleGeometry(radius: number, segments = 80) {
          return trackGeometry(new THREE.CircleGeometry(sceneLength(radius), segments));
        }

        function createDiamondGeometry(node: LogoNode) {
          const halfWidth = sceneLength(node.radius);
          const halfHeight = sceneLength(node.radius * ETHEREUM_RATIO);
          const shape = new THREE.Shape();
          shape.moveTo(0, halfHeight);
          shape.lineTo(halfWidth, 0);
          shape.lineTo(0, -halfHeight);
          shape.lineTo(-halfWidth, 0);
          shape.closePath();

          return trackGeometry(new THREE.ShapeGeometry(shape));
        }

        function createNodeMesh(
          node: LogoNode,
          color: number,
          opacity: number,
          z: number,
        ) {
          const material = trackMaterial(
            new THREE.MeshBasicMaterial({
              blending: THREE.AdditiveBlending,
              color,
              depthWrite: false,
              opacity,
              transparent: true,
            }),
          );
          const geometry =
            node.shape === "diamond"
              ? createDiamondGeometry(node)
              : node.shape === "ring"
                ? trackGeometry(
                    new THREE.TorusGeometry(
                      sceneLength(node.radius),
                      sceneLength(7.5),
                      20,
                      96,
                    ),
                  )
                : createCircleGeometry(node.radius);
          const mesh = new THREE.Mesh(geometry, material);
          const position = scenePoint(node.point);

          mesh.position.set(position.x, position.y, z);
          root.add(mesh);

          return mesh;
        }

        function createRadialGlowMaterial(color: number) {
          const material = trackMaterial(
            new THREE.ShaderMaterial({
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              transparent: true,
              uniforms: {
                uColor: { value: new THREE.Color(color) },
                uOpacity: { value: 0 },
              },
              vertexShader: `
                varying vec2 vUv;

                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform vec3 uColor;
                uniform float uOpacity;
                varying vec2 vUv;

                void main() {
                  float distanceFromCenter = distance(vUv, vec2(0.5));
                  float alpha = smoothstep(0.5, 0.08, distanceFromCenter) * uOpacity;
                  gl_FragColor = vec4(uColor, alpha);
                }
              `,
            }),
          );

          return material;
        }

        function createGlowMesh(node: LogoNode) {
          const material = createRadialGlowMaterial(0x66c7ff);
          const glowRadius =
            node.shape === "diamond"
              ? node.radius * 1.72
              : node.shape === "ring"
                ? node.radius * 2.15
                : node.radius * 1.9;
          const geometry =
            node.shape === "diamond"
              ? createDiamondGeometry({
                  ...node,
                  radius: node.radius * 1.45,
                })
              : createCircleGeometry(glowRadius, 96);
          const mesh = new THREE.Mesh(geometry, material);
          const position = scenePoint(node.point);

          mesh.position.set(position.x, position.y, -0.02);
          root.add(mesh);

          return {
            scale: mesh.scale,
            setOpacity: (opacity: number) => {
              material.uniforms.uOpacity.value = opacity;
            },
          };
        }

        function createCapsule(
          from: Point,
          to: Point,
          radius: number,
          material: InstanceType<typeof THREE.MeshBasicMaterial>,
          z: number,
        ) {
          const group = new THREE.Group();
          const bodyGeometry = trackGeometry(new THREE.PlaneGeometry(1, 1));
          const capGeometry = trackGeometry(new THREE.CircleGeometry(radius, 40));
          const body = new THREE.Mesh(bodyGeometry, material);
          const startCap = new THREE.Mesh(capGeometry, material);
          const endCap = new THREE.Mesh(capGeometry, material);

          group.add(body, startCap, endCap);
          root.add(group);

          const update = (progress: number) => {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const fullLength = Math.hypot(dx, dy);
            const length = Math.max(fullLength * clamp(progress), radius * 0.01);
            const angle = Math.atan2(dy, dx);
            const end = {
              x: from.x + Math.cos(angle) * length,
              y: from.y + Math.sin(angle) * length,
            };

            body.position.set((from.x + end.x) / 2, (from.y + end.y) / 2, z);
            body.rotation.z = angle;
            body.scale.set(length, radius * 2, 1);
            startCap.position.set(from.x, from.y, z);
            endCap.position.set(end.x, end.y, z);
          };

          update(1);

          return { group, material, update };
        }

        edges.forEach((edge) => {
          const { from, to } = edgeSegment(edge);
          const dimMaterial = trackMaterial(
            new THREE.MeshBasicMaterial({
              color: 0x243140,
              opacity: 0.36,
              transparent: true,
            }),
          );
          const activeMaterial = trackMaterial(
            new THREE.MeshBasicMaterial({
              blending: THREE.AdditiveBlending,
              color: 0xeaf8ff,
              depthWrite: false,
              opacity: 0,
              transparent: true,
            }),
          );
          const pulseMaterial = trackMaterial(
            new THREE.MeshBasicMaterial({
              blending: THREE.AdditiveBlending,
              color: 0x7fd8ff,
              depthWrite: false,
              opacity: 0,
              transparent: true,
            }),
          );
          const sparkleMaterial = trackMaterial(
            new THREE.MeshBasicMaterial({
              blending: THREE.AdditiveBlending,
              color: 0xffffff,
              depthWrite: false,
              opacity: 0,
              transparent: true,
            }),
          );

          createCapsule(from, to, sceneLength(LINE_WIDTH / 2), dimMaterial, 0);
          const active = createCapsule(
            from,
            to,
            sceneLength(LINE_WIDTH / 2),
            activeMaterial,
            0.02,
          );
          const pulse = new THREE.Mesh(
            createCircleGeometry(LINE_WIDTH * 1.9, 48),
            pulseMaterial,
          );
          const sparkle = new THREE.Mesh(
            createCircleGeometry(LINE_WIDTH * 0.8, 32),
            sparkleMaterial,
          );

          root.add(pulse, sparkle);
          edgeRenders.push({ active, edge, pulse, sparkle });
        });

        allNodes.forEach((node) => {
          createNodeMesh(node, 0x263442, 0.42, 0.01);
          const active = createNodeMesh(node, 0xffffff, 0, 0.04);
          const glow = createGlowMesh(node);

          nodeRenders.push({ active, glow, node });
        });

        const finalHaloMaterial = createRadialGlowMaterial(0x4fbfff);
        const finalHalo = new THREE.Mesh(
          createCircleGeometry(410, 128),
          finalHaloMaterial,
        );
        finalHalo.position.set(0.1, 0, -0.08);
        finalHalo.scale.set(1.34, 1.02, 1);
        root.add(finalHalo);

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.floor(bounds.width));
          const height = Math.max(1, Math.floor(bounds.height));
          const aspect = width / height;
          const verticalSize = 4.3;

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
          const absoluteTime = performance.now() * 0.001;
          const cycleTime = reducedMotion.matches
            ? 6.9
            : absoluteTime % CYCLE_SECONDS;
          const finalGlow = smoothstep((cycleTime - 6.1) / 0.85);
          const breathing = reducedMotion.matches
            ? 0
            : (Math.sin(absoluteTime * 2.6) + 1) / 2;

          nodeRenders.forEach(({ active, glow, node }) => {
            const activation = smoothstep((cycleTime - node.turnOnAt) / 0.48);
            const emphasize =
              smoothstep((cycleTime - node.turnOnAt) / 0.16) *
              (1 - smoothstep((cycleTime - node.turnOnAt - 0.58) / 0.5));
            const glowOpacity =
              activation * 0.055 + emphasize * 0.11 + finalGlow * (0.08 + breathing * 0.04);
            const scale = 1 + emphasize * 0.13 + finalGlow * (0.03 + breathing * 0.025);

            active.material.opacity = activation * (0.82 + finalGlow * 0.18);
            active.scale.setScalar(scale);
            glow.setOpacity(glowOpacity);
            glow.scale.setScalar(1 + emphasize * 0.18 + finalGlow * 0.12);
          });

          edgeRenders.forEach(({ active, edge, pulse, sparkle }) => {
            const rawProgress = (cycleTime - edge.startAt) / edge.duration;
            const progress = smoothstep(rawProgress);
            const inFlight = rawProgress > 0 && rawProgress < 1;
            const { from, to } = edgeSegment(edge);
            const head = {
              x: from.x + (to.x - from.x) * clamp(rawProgress),
              y: from.y + (to.y - from.y) * clamp(rawProgress),
            };

            active.update(progress);
            active.material.opacity = progress * (0.74 + finalGlow * 0.22);
            pulse.position.set(head.x, head.y, 0.07);
            sparkle.position.set(head.x, head.y, 0.08);
            pulse.material.opacity = inFlight ? 0.34 + breathing * 0.14 : 0;
            sparkle.material.opacity = inFlight ? 0.76 : 0;
          });

          finalHaloMaterial.uniforms.uOpacity.value =
            finalGlow * (0.055 + breathing * 0.018);
          root.scale.setScalar(1 + finalGlow * 0.012 + breathing * finalGlow * 0.006);
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
        console.error("Failed to render Tonigma network logo animation.", error);
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
    <div className="tonigma-network-logo" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="tonigma-network-logo__canvas"
        data-testid="tonigma-network-logo-canvas"
      />
      {showFallback ? (
        <img
          alt=""
          className="tonigma-network-logo__fallback"
          src="/brand/tonigma-square-logo.png"
        />
      ) : null}
    </div>
  );
}

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
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 10);
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        const root = new THREE.Group();
        root.rotation.z = -0.02;
        scene.add(root);

        const disposableGeometries: Array<{ dispose: () => void }> = [];
        const disposableMaterials: Array<{ dispose: () => void }> = [];
        type BasicMesh = InstanceType<typeof THREE.Mesh> & {
          material: InstanceType<typeof THREE.MeshBasicMaterial>;
        };
        const nodeRenders: Array<{
          active: BasicMesh;
          bloom: BasicMesh;
          rim: BasicMesh;
          node: LogoNode;
        }> = [];
        const edgeRenders: Array<{
          active: ReturnType<typeof createCapsule>;
          edge: LogoEdge;
          trail: ReturnType<typeof createTrail>;
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

        function createDiamondGeometry(radius: number) {
          const halfWidth = sceneLength(radius);
          const halfHeight = sceneLength(radius * ETHEREUM_RATIO);
          const shape = new THREE.Shape();
          shape.moveTo(0, halfHeight);
          shape.lineTo(halfWidth, 0);
          shape.lineTo(0, -halfHeight);
          shape.lineTo(-halfWidth, 0);
          shape.closePath();

          return trackGeometry(new THREE.ShapeGeometry(shape));
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

        function createNodeGeometry(node: LogoNode, radiusScale = 1) {
          const radius = node.radius * radiusScale;

          if (node.shape === "diamond") {
            return createDiamondGeometry(radius);
          }

          if (node.shape === "ring") {
            return trackGeometry(
              new THREE.TorusGeometry(
                sceneLength(radius),
                sceneLength(7.5 * radiusScale),
                20,
                112,
              ),
            );
          }

          return createCircleGeometry(radius, 112);
        }

        function createNodeMesh({
          blending,
          color,
          node,
          opacity,
          radiusScale = 1,
          z,
        }: {
          blending?: typeof THREE.AdditiveBlending;
          color: number;
          node: LogoNode;
          opacity: number;
          radiusScale?: number;
          z: number;
        }) {
          const material = trackMaterial(
            new THREE.MeshBasicMaterial({
              blending,
              color,
              depthWrite: false,
              opacity,
              transparent: true,
            }),
          );
          const mesh = new THREE.Mesh(createNodeGeometry(node, radiusScale), material);
          const position = scenePoint(node.point);

          mesh.position.set(position.x, position.y, z);
          root.add(mesh);

          return mesh as BasicMesh;
        }

        function createTrailMaterial() {
          return trackMaterial(
            new THREE.ShaderMaterial({
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              transparent: true,
              uniforms: {
                uOpacity: { value: 0 },
                uPrimary: { value: new THREE.Color(0xf6fbff) },
                uSecondary: { value: new THREE.Color(0x5fc8ff) },
              },
              vertexShader: `
                varying vec2 vUv;

                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform float uOpacity;
                uniform vec3 uPrimary;
                uniform vec3 uSecondary;
                varying vec2 vUv;

                void main() {
                  float center = 1.0 - smoothstep(0.16, 0.5, abs(vUv.y - 0.5));
                  float taperedTail = smoothstep(0.0, 0.22, vUv.x);
                  float hotHead = pow(vUv.x, 2.2);
                  float softEnd = 1.0 - smoothstep(0.97, 1.0, vUv.x);
                  float alpha = center * taperedTail * (0.2 + hotHead * 0.8) * softEnd * uOpacity;
                  vec3 color = mix(uSecondary, uPrimary, smoothstep(0.45, 1.0, vUv.x));

                  gl_FragColor = vec4(color, alpha);
                }
              `,
            }),
          );
        }

        function createTrail(from: Point, to: Point) {
          const material = createTrailMaterial();
          const mesh = new THREE.Mesh(trackGeometry(new THREE.PlaneGeometry(1, 1)), material);
          const fullDx = to.x - from.x;
          const fullDy = to.y - from.y;
          const fullLength = Math.max(Math.hypot(fullDx, fullDy), 0.001);
          const angle = Math.atan2(fullDy, fullDx);
          const maxTrailLength = Math.min(fullLength * 0.62, sceneLength(150));
          const width = sceneLength(LINE_WIDTH * 1.7);

          mesh.rotation.z = angle;
          mesh.position.set(from.x, from.y, 0.08);
          root.add(mesh);

          const update = (rawProgress: number, opacity: number) => {
            const headDistance = fullLength * clamp(rawProgress);
            const trailLength = Math.min(headDistance, maxTrailLength);
            const centerDistance = headDistance - trailLength / 2;

            mesh.position.set(
              from.x + Math.cos(angle) * centerDistance,
              from.y + Math.sin(angle) * centerDistance,
              0.08,
            );
            mesh.scale.set(Math.max(trailLength, 0.001), width, 1);
            material.uniforms.uOpacity.value = opacity;
          };

          update(0, 0);

          return { material, update };
        }

        edges.forEach((edge) => {
          const { from, to } = edgeSegment(edge);
          const dimMaterial = trackMaterial(
            new THREE.MeshBasicMaterial({
              color: 0x1b2530,
              opacity: 0.46,
              transparent: true,
            }),
          );
          const activeMaterial = trackMaterial(
            new THREE.MeshBasicMaterial({
              color: 0xf3fbff,
              depthWrite: false,
              opacity: 0,
              transparent: true,
            }),
          );

          createCapsule(from, to, sceneLength(LINE_WIDTH / 2), dimMaterial, 0);
          const active = createCapsule(
            from,
            to,
            sceneLength(LINE_WIDTH / 2.2),
            activeMaterial,
            0.02,
          );
          const trail = createTrail(from, to);

          edgeRenders.push({ active, edge, trail });
        });

        allNodes.forEach((node) => {
          createNodeMesh({
            color: 0x1d2834,
            node,
            opacity: node.shape === "ring" ? 0.6 : 0.48,
            z: 0.01,
          });
          const rim = createNodeMesh({
            blending: THREE.AdditiveBlending,
            color: 0x6fd1ff,
            node,
            opacity: 0,
            radiusScale: node.shape === "diamond" ? 1.035 : 1.08,
            z: 0.035,
          });
          const active = createNodeMesh({
            color: 0xf8fcff,
            node,
            opacity: 0,
            z: 0.05,
          });
          const bloom = createNodeMesh({
            blending: THREE.AdditiveBlending,
            color: 0xffffff,
            node,
            opacity: 0,
            radiusScale: 1.015,
            z: 0.06,
          });

          nodeRenders.push({ active, bloom, rim, node });
        });

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
        const startedAt = performance.now() * 0.001;

        const render = () => {
          const absoluteTime = performance.now() * 0.001;
          const cycleTime = reducedMotion.matches
            ? 6.9
            : (absoluteTime - startedAt) % CYCLE_SECONDS;
          const finalGlow = smoothstep((cycleTime - 6.1) / 0.85);
          const breathing = reducedMotion.matches
            ? 0
            : (Math.sin(absoluteTime * 2.6) + 1) / 2;

          nodeRenders.forEach(({ active, bloom, rim, node }) => {
            const activation = smoothstep((cycleTime - node.turnOnAt) / 0.48);
            const emphasize =
              smoothstep((cycleTime - node.turnOnAt) / 0.16) *
              (1 - smoothstep((cycleTime - node.turnOnAt - 0.58) / 0.5));
            const scale =
              1 + emphasize * 0.09 + finalGlow * (0.012 + breathing * 0.01);

            active.material.opacity = activation * (0.9 + finalGlow * 0.1);
            active.scale.setScalar(scale);
            bloom.material.opacity =
              activation * 0.11 + emphasize * 0.24 + finalGlow * (0.09 + breathing * 0.025);
            bloom.scale.setScalar(1 + emphasize * 0.035 + finalGlow * 0.012);
            rim.material.opacity =
              activation * 0.08 + emphasize * 0.14 + finalGlow * (0.055 + breathing * 0.018);
            rim.scale.setScalar(1 + emphasize * 0.025);
          });

          edgeRenders.forEach(({ active, edge, trail }) => {
            const rawProgress = (cycleTime - edge.startAt) / edge.duration;
            const progress = smoothstep(rawProgress);
            const inFlight = rawProgress > 0 && rawProgress < 1;
            const trailOpacity = inFlight
              ? 0.64 + breathing * 0.08
              : 0;

            active.update(progress);
            active.material.opacity = progress * (0.8 + finalGlow * 0.18);
            trail.update(rawProgress, trailOpacity);
          });

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

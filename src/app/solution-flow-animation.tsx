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

        const trailSegments = 96;
        const trailArc = 3.55;

        const createOrbitRibbonGeometry = () => {
          const geometry = track(new THREE.BufferGeometry());
          const positions = new Float32Array((trailSegments + 1) * 2 * 3);
          const trailProgress = new Float32Array((trailSegments + 1) * 2);
          const indices: number[] = [];

          for (let index = 0; index <= trailSegments; index += 1) {
            const progress = index / trailSegments;
            const left = index * 2;
            const right = left + 1;

            trailProgress[left] = progress;
            trailProgress[right] = progress;

            if (index < trailSegments) {
              const nextLeft = left + 2;
              const nextRight = left + 3;

              indices.push(left, right, nextRight, left, nextRight, nextLeft);
            }
          }

          geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute("trailProgress", new THREE.BufferAttribute(trailProgress, 1));
          geometry.setIndex(indices);

          return geometry;
        };

        const createOrbitRibbonMaterial = ({
          color,
          opacity,
          power,
        }: {
          color: number;
          opacity: number;
          power: number;
        }) =>
          track(
            new THREE.ShaderMaterial({
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              side: THREE.DoubleSide,
              toneMapped: false,
              transparent: true,
              uniforms: {
                uColor: { value: new THREE.Color(color) },
                uOpacity: { value: opacity },
                uPower: { value: power },
              },
              vertexShader: `
                attribute float trailProgress;
                varying float vTrailProgress;

                void main() {
                  vTrailProgress = trailProgress;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform vec3 uColor;
                uniform float uOpacity;
                uniform float uPower;
                varying float vTrailProgress;

                void main() {
                  float head = smoothstep(0.72, 1.0, vTrailProgress);
                  float body = pow(vTrailProgress, uPower);
                  float tailFade = smoothstep(0.0, 0.18, vTrailProgress);
                  float alpha = uOpacity * tailFade * (body * 0.54 + head * 0.72);
                  vec3 color = mix(uColor, vec3(1.0), head * 0.55);

                  if (alpha < 0.01) {
                    discard;
                  }

                  gl_FragColor = vec4(color, alpha);
                }
              `,
            }),
          );

        const updateOrbitRibbon = (
          geometry: InstanceType<typeof THREE.BufferGeometry>,
          headAngle: number,
          width: number,
          z: number,
        ) => {
          const positionAttribute = geometry.getAttribute(
            "position",
          ) as InstanceType<typeof THREE.BufferAttribute>;

          for (let index = 0; index <= trailSegments; index += 1) {
            const progress = index / trailSegments;
            const angle = headAngle + trailArc * (1 - progress);
            const radius = triangleRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const tangentX = Math.sin(angle);
            const tangentY = -Math.cos(angle);
            const normalX = Math.cos(angle);
            const normalY = Math.sin(angle);
            const headWeight = Math.pow(progress, 1.7);
            const localWidth = width * (0.28 + headWeight * 0.72);
            const leftIndex = index * 2;
            const rightIndex = leftIndex + 1;

            positionAttribute.setXYZ(
              leftIndex,
              x + normalX * localWidth * 0.5 + tangentX * localWidth * 0.08,
              y + normalY * localWidth * 0.5 + tangentY * localWidth * 0.08,
              z,
            );
            positionAttribute.setXYZ(
              rightIndex,
              x - normalX * localWidth * 0.5 - tangentX * localWidth * 0.08,
              y - normalY * localWidth * 0.5 - tangentY * localWidth * 0.08,
              z,
            );
          }

          positionAttribute.needsUpdate = true;
          geometry.computeBoundingSphere();
        };

        const glowRibbonGeometry = createOrbitRibbonGeometry();
        const coreRibbonGeometry = createOrbitRibbonGeometry();
        const glowRibbonMaterial = createOrbitRibbonMaterial({
          color: 0x37d7ff,
          opacity: 0.74,
          power: 1.85,
        });
        const coreRibbonMaterial = createOrbitRibbonMaterial({
          color: 0xeafcff,
          opacity: 0.98,
          power: 2.45,
        });
        const glowRibbon = new THREE.Mesh(glowRibbonGeometry, glowRibbonMaterial);
        const coreRibbon = new THREE.Mesh(coreRibbonGeometry, coreRibbonMaterial);
        glowRibbon.renderOrder = 8;
        coreRibbon.renderOrder = 9;
        root.add(glowRibbon, coreRibbon);

        const lightEmitter = new THREE.PointLight(0xbff6ff, 3.4, 1.55, 2.1);
        lightEmitter.position.set(0, triangleRadius, 0.5);
        root.add(lightEmitter);

        const emitterGlowGeometry = track(new THREE.SphereGeometry(1, 48, 24));
        const emitterGlowMaterial = track(
          new THREE.ShaderMaterial({
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
            uniforms: {
              uCameraLocalPosition: { value: new THREE.Vector3(0, 0, 4) },
              uColor: { value: new THREE.Color(0xf4fbff) },
              uOpacity: { value: 0.62 },
              uTime: { value: 0 },
            },
            vertexShader: `
              varying vec3 vLocalPosition;

              void main() {
                vLocalPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 uCameraLocalPosition;
              uniform vec3 uColor;
              uniform float uOpacity;
              uniform float uTime;
              varying vec3 vLocalPosition;

              float hash(vec3 p) {
                p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.23));
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
              }

              float noise(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);

                float n000 = hash(i + vec3(0.0, 0.0, 0.0));
                float n100 = hash(i + vec3(1.0, 0.0, 0.0));
                float n010 = hash(i + vec3(0.0, 1.0, 0.0));
                float n110 = hash(i + vec3(1.0, 1.0, 0.0));
                float n001 = hash(i + vec3(0.0, 0.0, 1.0));
                float n101 = hash(i + vec3(1.0, 0.0, 1.0));
                float n011 = hash(i + vec3(0.0, 1.0, 1.0));
                float n111 = hash(i + vec3(1.0, 1.0, 1.0));

                float nx00 = mix(n000, n100, f.x);
                float nx10 = mix(n010, n110, f.x);
                float nx01 = mix(n001, n101, f.x);
                float nx11 = mix(n011, n111, f.x);
                float nxy0 = mix(nx00, nx10, f.y);
                float nxy1 = mix(nx01, nx11, f.y);

                return mix(nxy0, nxy1, f.z);
              }

              vec2 intersectSphere(vec3 rayOrigin, vec3 rayDirection) {
                float b = dot(rayOrigin, rayDirection);
                float c = dot(rayOrigin, rayOrigin) - 1.0;
                float h = b * b - c;

                if (h < 0.0) {
                  return vec2(1.0, -1.0);
                }

                h = sqrt(h);

                return vec2(-b - h, -b + h);
              }

              void main() {
                vec3 rayOrigin = uCameraLocalPosition;
                vec3 rayDirection = normalize(vLocalPosition - rayOrigin);
                vec2 hit = intersectSphere(rayOrigin, rayDirection);
                float start = max(hit.x, 0.0);
                float end = hit.y;

                if (end <= start) {
                  discard;
                }

                const int STEPS = 34;
                float travel = end - start;
                float stepSize = travel / float(STEPS);
                float accumulatedDensity = 0.0;
                float accumulatedCore = 0.0;

                for (int i = 0; i < STEPS; i++) {
                  float t = start + (float(i) + 0.5) * stepSize;
                  vec3 p = rayOrigin + rayDirection * t;
                  float radius = length(p);
                  float centerDensity = exp(-radius * radius * 2.4);
                  float atmosphericFalloff = 1.0 - smoothstep(0.54, 1.0, radius);
                  float turbulence =
                    noise(p * 4.8 + vec3(0.0, uTime * 0.28, uTime * 0.12)) * 0.38 +
                    noise(p * 10.0 - vec3(uTime * 0.18, 0.0, uTime * 0.2)) * 0.16;
                  float density =
                    centerDensity *
                    atmosphericFalloff *
                    (0.9 + turbulence * 0.34);

                  accumulatedDensity += density * stepSize;
                  accumulatedCore += centerDensity * atmosphericFalloff * stepSize;
                }

                float alpha = 1.0 - exp(-accumulatedDensity * uOpacity * 1.92);
                vec3 color = uColor * (1.25 + accumulatedCore * 3.1);
                gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.95));
              }
            `,
          }),
        );
        const emitterGlow = new THREE.Mesh(emitterGlowGeometry, emitterGlowMaterial);
        emitterGlow.renderOrder = 10;
        root.add(emitterGlow);

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
          const trailIntensity = 0.88 + Math.sin(time * 3.4) * 0.08;

          updateOrbitRibbon(glowRibbonGeometry, orbitAngle, 0.28, 0.24);
          updateOrbitRibbon(coreRibbonGeometry, orbitAngle, 0.1, 0.28);
          glowRibbonMaterial.uniforms.uOpacity.value = trailIntensity * 0.74;
          coreRibbonMaterial.uniforms.uOpacity.value = trailIntensity;
          lightEmitter.position.set(orbitX, orbitY, 0.48);
          lightEmitter.intensity = 3.1 + trailIntensity * 1.2;
          emitterGlow.position.copy(lightEmitter.position);
          emitterGlow.scale.setScalar(0.36 + trailIntensity * 0.08);
          emitterGlow.updateWorldMatrix(true, false);
          emitterGlowMaterial.uniforms.uCameraLocalPosition.value.copy(
            emitterGlow.worldToLocal(camera.position.clone()),
          );
          emitterGlowMaterial.uniforms.uOpacity.value = 0.46 + trailIntensity * 0.22;
          emitterGlowMaterial.uniforms.uTime.value = time;

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

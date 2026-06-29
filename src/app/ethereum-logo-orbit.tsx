"use client";

import { useEffect, useRef, useState } from "react";
import worldLand from "../data/ne_110m_land.json";

type EthereumLogoOrbitProps = Readonly<{
  variant?: "strength" | "tradeoff";
}>;

type GeoJsonPosition = [number, number] | [number, number, number];
type GeoJsonPolygon = GeoJsonPosition[][];
type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: GeoJsonPolygon }
  | { type: "MultiPolygon"; coordinates: GeoJsonPolygon[] };
type GeoJsonFeatureCollection = {
  features: Array<{ geometry: GeoJsonGeometry }>;
};

export function EthereumLogoOrbit({
  variant = "tradeoff",
}: EthereumLogoOrbitProps) {
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
        const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
        camera.position.set(0, 0.28, 5.4);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.AmbientLight(0xd9e8ff, 1.8));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(3.6, 4.8, 5.2);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x58b7ff, 1.5);
        rimLight.position.set(-3.6, -1.2, 4.8);
        scene.add(rimLight);

        const viewGroup = new THREE.Group();
        scene.add(viewGroup);

        const storyGroup = new THREE.Group();
        viewGroup.add(storyGroup);

        const logoGroup = new THREE.Group();
        logoGroup.scale.setScalar(variant === "strength" ? 0.78 : 0.68);
        storyGroup.add(logoGroup);
        const disposableResources: Array<{ dispose: () => void }> = [];

        function trackDisposable<T extends { dispose: () => void }>(resource: T) {
          disposableResources.push(resource);
          return resource;
        }

        const top = new THREE.Vector3(0, 1.5041, 0);
        const bottom = new THREE.Vector3(0, -1.3241, 0);
        const upperY = 0.1722;
        const lowerY = 0.0078;
        const upperLeft = new THREE.Vector3(-0.74, upperY, 0);
        const upperRight = new THREE.Vector3(0.74, upperY, 0);
        const upperFront = new THREE.Vector3(0, upperY, 0.74);
        const upperBack = new THREE.Vector3(0, upperY, -0.74);
        const lowerLeft = new THREE.Vector3(-0.74, lowerY, 0);
        const lowerRight = new THREE.Vector3(0.74, lowerY, 0);
        const lowerFront = new THREE.Vector3(0, lowerY, 0.74);
        const lowerBack = new THREE.Vector3(0, lowerY, -0.74);

        const surfaces = [
          {
            points: [top, upperLeft, upperFront],
            color: "#8a92b2",
            opacity: 0.75,
          },
          {
            points: [top, upperFront, upperRight],
            color: "#62688f",
            opacity: 0.75,
          },
          {
            points: [top, upperRight, upperBack],
            color: "#454a75",
            opacity: 0.75,
          },
          {
            points: [top, upperBack, upperLeft],
            color: "#62688f",
            opacity: 0.75,
          },
          { points: [bottom, lowerFront, lowerLeft], color: "#8a92b2" },
          { points: [bottom, lowerRight, lowerFront], color: "#62688f" },
          { points: [bottom, lowerBack, lowerRight], color: "#454a75" },
          { points: [bottom, lowerLeft, lowerBack], color: "#62688f" },
          {
            points: [upperLeft, upperBack, upperRight, upperFront],
            color: "#62688f",
            index: [0, 1, 2, 0, 2, 3],
          },
          {
            points: [lowerLeft, lowerFront, lowerRight, lowerBack],
            color: "#8a92b2",
            index: [0, 1, 2, 0, 2, 3],
          },
        ];

        surfaces.forEach((surface, index) => {
          const geometry = trackDisposable(
            new THREE.BufferGeometry().setFromPoints([...surface.points]),
          );
          geometry.setIndex(surface.index ?? [0, 1, 2]);
          geometry.computeVertexNormals();

          const material = trackDisposable(
            new THREE.MeshStandardMaterial({
              color: surface.color,
              emissive: index % 4 === 0 ? "#12345c" : "#050a16",
              emissiveIntensity: index % 4 === 0 ? 0.18 : 0.08,
              metalness: 0.36,
              opacity: surface.opacity ?? 1,
              roughness: 0.42,
              side: THREE.DoubleSide,
              transparent: surface.opacity !== undefined,
            }),
          );

          logoGroup.add(new THREE.Mesh(geometry, material));
        });

        const updateGlowLayers: Array<(time: number) => void> = [];
        const gapCenterY = (upperY + lowerY) / 2;

        const addScatteringVolume = ({
          baseOpacity,
          baseScale,
          opacityPulse,
          phase,
          scalePulse,
          verticalScale,
        }: {
          baseOpacity: number;
          baseScale: number;
          opacityPulse: number;
          phase: number;
          scalePulse: number;
          verticalScale: number;
        }) => {
          const geometry = trackDisposable(new THREE.SphereGeometry(1, 48, 24));

          const material = trackDisposable(
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
                uOpacity: { value: baseOpacity },
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

                const int STEPS = 36;
                float travel = end - start;
                float stepSize = travel / float(STEPS);
                float accumulatedDensity = 0.0;
                float accumulatedCore = 0.0;

                for (int i = 0; i < STEPS; i++) {
                  float t = start + (float(i) + 0.5) * stepSize;
                  vec3 p = rayOrigin + rayDirection * t;
                  vec3 densityShape = vec3(p.x * 0.72, p.y * 2.25, p.z * 0.72);
                  vec3 ellipsoidShape = vec3(p.x * 1.08, p.y * 2.82, p.z * 1.08);
                  float densityRadius = length(densityShape);
                  float ellipsoidRadius = length(ellipsoidShape);
                  float centerDensity = exp(-densityRadius * densityRadius * 2.6);
                  float atmosphericFalloff = 1.0 - smoothstep(0.68, 0.98, ellipsoidRadius);
                  float turbulence =
                    noise(p * 3.6 + vec3(0.0, uTime * 0.2, uTime * 0.1)) * 0.45 +
                    noise(p * 8.0 - vec3(uTime * 0.12, 0.0, uTime * 0.16)) * 0.18;
                  float density =
                    centerDensity *
                    atmosphericFalloff *
                    (0.9 + turbulence * 0.36);

                  accumulatedDensity += density * stepSize;
                  accumulatedCore += centerDensity * atmosphericFalloff * stepSize;
                }

                float alpha = 1.0 - exp(-accumulatedDensity * uOpacity * 1.72);
                vec3 color = uColor * (1.2 + accumulatedCore * 2.8);
                gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.92));
              }
            `,
            }),
          );

          const volume = new THREE.Mesh(geometry, material);
          volume.position.set(0, gapCenterY, 0);
          volume.renderOrder = 3;
          volume.scale.set(baseScale, verticalScale, baseScale);
          logoGroup.add(volume);

          updateGlowLayers.push((time) => {
            const pulse = (Math.sin(time * 1.34 + phase) + 1) / 2;
            const easedPulse = pulse * pulse * (3 - 2 * pulse);
            const animatedScale = baseScale + easedPulse * scalePulse;

            volume.scale.set(animatedScale, verticalScale, animatedScale);
            volume.updateWorldMatrix(true, false);
            material.uniforms.uCameraLocalPosition.value.copy(
              volume.worldToLocal(camera.position.clone()),
            );
            material.uniforms.uOpacity.value =
              baseOpacity + easedPulse * opacityPulse;
            material.uniforms.uTime.value = time;
          });
        };

        const scatteringVolumes = [
          {
            baseOpacity: 0.34,
            baseScale: 0.66,
            opacityPulse: 0.018,
            phase: 0.1,
            scalePulse: 0.035,
            verticalScale: 0.052,
          },
          {
            baseOpacity: 0.16,
            baseScale: 1.16,
            opacityPulse: 0.01,
            phase: 1.45,
            scalePulse: 0.055,
            verticalScale: 0.062,
          },
          {
            baseOpacity: 0.07,
            baseScale: 1.72,
            opacityPulse: 0.006,
            phase: 2.5,
            scalePulse: 0.07,
            verticalScale: 0.07,
          },
          {
            baseOpacity: 0.032,
            baseScale: 2.14,
            opacityPulse: 0.003,
            phase: 0.7,
            scalePulse: 0.08,
            verticalScale: 0.076,
          },
        ];

        scatteringVolumes.forEach(addScatteringVolume);

        const updateStoryLayers: Array<(time: number) => void> = [];
        const centerPoint = new THREE.Vector3(0, gapCenterY, 0);

        const observerGroup = new THREE.Group();
        observerGroup.position.z = -0.14;

        const personHeadGeometry = trackDisposable(
          new THREE.SphereGeometry(0.056, 18, 12),
        );
        const personBodyGeometry = trackDisposable(
          new THREE.CylinderGeometry(0.052, 0.07, 0.16, 18, 1),
        );
        const validatorBaseGeometry = trackDisposable(
          new THREE.BoxGeometry(0.14, 0.24, 0.13),
        );
        const validatorFaceGeometry = trackDisposable(
          new THREE.BoxGeometry(0.11, 0.19, 0.012),
        );
        const validatorSlotGeometry = trackDisposable(
          new THREE.PlaneGeometry(0.058, 0.006),
        );
        const validatorLedGeometry = trackDisposable(
          new THREE.CircleGeometry(0.016, 16),
        );
        const validatorLedGlowGeometry = trackDisposable(
          new THREE.CircleGeometry(0.038, 20),
        );
        const personMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#dceaff",
            emissive: "#184c92",
            emissiveIntensity: 0.46,
            metalness: 0.08,
            opacity: 0.82,
            roughness: 0.54,
            transparent: true,
          }),
        );
        const distantPersonMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#8fbfff",
            emissive: "#0a2f63",
            emissiveIntensity: 0.32,
            metalness: 0.04,
            opacity: 0.52,
            roughness: 0.62,
            transparent: true,
          }),
        );
        const validatorShellMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#86a9d6",
            emissive: "#0e2c5a",
            emissiveIntensity: 0.36,
            metalness: 0.24,
            roughness: 0.42,
          }),
        );
        const validatorPanelMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#d7efff",
            emissive: "#1a5f9d",
            emissiveIntensity: 0.28,
            metalness: 0.1,
            roughness: 0.34,
          }),
        );
        const validatorSlotMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            color: "#9fb2c7",
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        );
        const ledPalette = [
          { off: new THREE.Color(0x4a0808), on: new THREE.Color(0xff3030) },
          { off: new THREE.Color(0x4a3806), on: new THREE.Color(0xffd43b) },
          { off: new THREE.Color(0x083f1a), on: new THREE.Color(0x32ff74) },
        ] as const;
        const verificationLineMaterial = trackDisposable(
          new THREE.LineBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#8fd7ff",
            depthWrite: false,
            opacity: 0.18,
            transparent: true,
          }),
        );
        const replayLineMaterial = trackDisposable(
          new THREE.LineBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#d7f3ff",
            depthWrite: false,
            opacity: 0.11,
            transparent: true,
          }),
        );
        const meshEdgeMaterial = trackDisposable(
          new THREE.LineBasicMaterial({
            color: "#203142",
            depthWrite: false,
            opacity: 0.34,
            transparent: true,
          }),
        );
        const lightTrailCanvas = document.createElement("canvas");
        lightTrailCanvas.width = 192;
        lightTrailCanvas.height = 48;
        const lightTrailContext = lightTrailCanvas.getContext("2d");

        if (lightTrailContext) {
          const horizontalGlow = lightTrailContext.createLinearGradient(
            0,
            0,
            lightTrailCanvas.width,
            0,
          );
          horizontalGlow.addColorStop(0, "rgba(255,255,255,0)");
          horizontalGlow.addColorStop(0.32, "rgba(255,255,255,0.16)");
          horizontalGlow.addColorStop(0.5, "rgba(255,255,255,1)");
          horizontalGlow.addColorStop(0.68, "rgba(255,255,255,0.16)");
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
          verticalGlow.addColorStop(0.72, "rgba(255,255,255,0.38)");
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

        const lightTrailTexture = trackDisposable(
          new THREE.CanvasTexture(lightTrailCanvas),
        );
        lightTrailTexture.colorSpace = THREE.SRGBColorSpace;
        const lightTrailGeometry = trackDisposable(
          new THREE.PlaneGeometry(1, 1),
        );
        const lightTrailBaseMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#8ee7ff",
            depthWrite: false,
            map: lightTrailTexture,
            opacity: 0.72,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
          }),
        );
        const lightTrailGlowBaseMaterial = trackDisposable(
          lightTrailBaseMaterial.clone(),
        );
        lightTrailGlowBaseMaterial.color.set("#48a8ff");
        lightTrailGlowBaseMaterial.opacity = 0.34;

        const createLightTrail = () => {
          const glowMaterial = trackDisposable(
            lightTrailGlowBaseMaterial.clone(),
          );
          const coreMaterial = trackDisposable(lightTrailBaseMaterial.clone());
          const glowLineGeometry = trackDisposable(new THREE.BufferGeometry());
          const coreLineGeometry = trackDisposable(new THREE.BufferGeometry());
          const glowLineMaterial = trackDisposable(
            new THREE.LineBasicMaterial({
              blending: THREE.AdditiveBlending,
              color: "#4aaeff",
              depthWrite: false,
              opacity: 0,
              transparent: true,
            }),
          );
          const coreLineMaterial = trackDisposable(
            new THREE.LineBasicMaterial({
              blending: THREE.AdditiveBlending,
              color: "#e8fbff",
              depthWrite: false,
              opacity: 0,
              transparent: true,
            }),
          );
          const glow = new THREE.Mesh(lightTrailGeometry, glowMaterial);
          const core = new THREE.Mesh(lightTrailGeometry, coreMaterial);
          const glowLine = new THREE.Line(glowLineGeometry, glowLineMaterial);
          const coreLine = new THREE.Line(coreLineGeometry, coreLineMaterial);

          glowLineGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(6), 3),
          );
          coreLineGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(6), 3),
          );

          glow.renderOrder = 2;
          core.renderOrder = 3;
          glowLine.renderOrder = 4;
          coreLine.renderOrder = 5;
          glow.visible = false;
          core.visible = false;
          glowLine.visible = false;
          coreLine.visible = false;
          observerGroup.add(glow, core, glowLine, coreLine);

          return {
            core,
            coreLine,
            coreLineMaterial,
            coreMaterial,
            glow,
            glowLine,
            glowLineMaterial,
            glowMaterial,
          };
        };

        const randomBetween = (min: number, max: number) =>
          min + Math.random() * (max - min);

        const observerAnimations: Array<{
          group: InstanceType<typeof THREE.Group>;
          home: InstanceType<typeof THREE.Vector3>;
          phase: number;
        }> = [];
        const meshPacketAnimations: Array<{
          activeStartedAt: number | null;
          duration: number;
          forward: boolean;
          from: InstanceType<typeof THREE.Vector3>;
          fromIndex: number;
          nextStartAt: number;
          to: InstanceType<typeof THREE.Vector3>;
          toIndex: number | null;
          trail: ReturnType<typeof createLightTrail>;
        }> = [];
        const packetEdgeKeys = new Set<string>();
        const packetTravelDurationRange = { max: 0.92, min: 0.58 };
        const packetIdleDelayRange = { max: 1.4, min: 0.18 };
        const addPacketEdgeAnimation = ({
          edgeKey,
          from,
          fromIndex,
          to,
          toIndex,
        }: {
          edgeKey: string;
          from: InstanceType<typeof THREE.Vector3>;
          fromIndex: number;
          to: InstanceType<typeof THREE.Vector3>;
          toIndex: number | null;
        }) => {
          if (packetEdgeKeys.has(edgeKey)) {
            return;
          }

          packetEdgeKeys.add(edgeKey);
          meshPacketAnimations.push({
            activeStartedAt: null,
            duration: randomBetween(
              packetTravelDurationRange.min,
              packetTravelDurationRange.max,
            ),
            forward: Math.random() >= 0.5,
            from,
            fromIndex,
            nextStartAt: randomBetween(0, 0.95),
            to,
            toIndex,
            trail: createLightTrail(),
          });
        };
        const getNodePairEdgeKey = (firstIndex: number, secondIndex: number) => {
          const lowIndex = Math.min(firstIndex, secondIndex);
          const highIndex = Math.max(firstIndex, secondIndex);

          return `${lowIndex}:${highIndex}`;
        };
        const nodeLedMaterials: Array<
          Array<InstanceType<typeof THREE.MeshBasicMaterial>>
        > = [];
        const nodeLedGlowMaterials: Array<
          Array<InstanceType<typeof THREE.MeshBasicMaterial>>
        > = [];

        const observerCount = 22;
        const strengthVerificationTarget = new THREE.Vector3(0, -1.34, 0.18);
        const tradeoffVerificationTarget = centerPoint;
        const strengthRadius = 1.38;
        const strengthHomes = Array.from({ length: observerCount }, (_, index) => {
          const angle = (index / observerCount) * Math.PI * 2;

          return new THREE.Vector3(
            strengthVerificationTarget.x + Math.cos(angle) * strengthRadius,
            strengthVerificationTarget.y,
            strengthVerificationTarget.z + Math.sin(angle) * strengthRadius,
          );
        });
        const getStrengthHome = (index: number) => {
          return strengthHomes[index].clone();
        };

        if (variant === "strength") {
          storyGroup.add(observerGroup);
        }

        for (let index = 0; index < observerCount; index++) {
          const angle = (index / observerCount) * Math.PI * 2;
          const radius = 1.66 + (index % 4) * 0.14;
          const strengthTargetIndex = (index * 7 + 5) % observerCount;
          const target =
            variant === "strength"
              ? getStrengthHome(strengthTargetIndex)
              : tradeoffVerificationTarget;
          const home =
            variant === "strength"
              ? getStrengthHome(index)
              : new THREE.Vector3(
                  Math.cos(angle) * radius,
                  Math.sin(angle) * 0.86,
                  Math.sin(angle) * 0.44,
                );
          const person = new THREE.Group();
          const isDistant = home.z < -0.08;
          const personScale = isDistant ? 0.78 : 0.94;

          person.position.copy(home);
          person.scale.setScalar(personScale);

          const personPartMaterial = isDistant
            ? distantPersonMaterial
            : personMaterial;

          if (variant === "strength") {
            const nodeRotation = -angle - Math.PI / 2;
            const heightOffset = 0;
            const ledMaterials = ledPalette.map(({ off }) =>
              trackDisposable(
                new THREE.MeshBasicMaterial({
                  color: off,
                  side: THREE.DoubleSide,
                  toneMapped: false,
                }),
              ),
            );
            const ledGlowMaterials = ledPalette.map(({ on }) =>
              trackDisposable(
                new THREE.MeshBasicMaterial({
                  blending: THREE.AdditiveBlending,
                  color: on,
                  depthWrite: false,
                  opacity: 0,
                  side: THREE.DoubleSide,
                  toneMapped: false,
                  transparent: true,
                }),
              ),
            );

            person.rotation.y = nodeRotation;
            nodeLedMaterials[index] = ledMaterials;
            nodeLedGlowMaterials[index] = ledGlowMaterials;

            const base = new THREE.Mesh(
              validatorBaseGeometry,
              validatorShellMaterial,
            );
            base.position.y = -0.016 + heightOffset;
            person.add(base);

            const face = new THREE.Mesh(
              validatorFaceGeometry,
              validatorPanelMaterial,
            );
            face.position.set(0, -0.016 + heightOffset, 0.072);
            person.add(face);

            for (let layerIndex = 0; layerIndex < 3; layerIndex++) {
              const clientSlot = new THREE.Mesh(
                validatorSlotGeometry,
                validatorSlotMaterial,
              );
              clientSlot.position.set(
                0.016,
                0.046 - layerIndex * 0.055 + heightOffset,
                0.079,
              );
              person.add(clientSlot);

              const ledGlow = new THREE.Mesh(
                validatorLedGlowGeometry,
                ledGlowMaterials[layerIndex],
              );
              ledGlow.position.set(
                -0.048,
                0.046 - layerIndex * 0.055 + heightOffset,
                0.080,
              );
              ledGlow.renderOrder = 4;
              person.add(ledGlow);

              const led = new THREE.Mesh(
                validatorLedGeometry,
                ledMaterials[layerIndex],
              );
              led.position.set(
                -0.048,
                0.046 - layerIndex * 0.055 + heightOffset,
                0.081,
              );
              led.renderOrder = 5;
              person.add(led);
            }
          } else {
            const body = new THREE.Mesh(personBodyGeometry, personPartMaterial);
            body.position.y = -0.078;
            person.add(body);

            const head = new THREE.Mesh(personHeadGeometry, personPartMaterial);
            head.position.y = 0.052;
            person.add(head);
          }

          const lineGeometry = trackDisposable(
            new THREE.BufferGeometry().setFromPoints([home, target]),
          );
          const verificationLine = new THREE.Line(
            lineGeometry,
            variant === "strength"
              ? meshEdgeMaterial
              : index % 2 === 0
                ? verificationLineMaterial
                : replayLineMaterial,
          );
          observerGroup.add(verificationLine);
          addPacketEdgeAnimation({
            edgeKey:
              variant === "strength"
                ? getNodePairEdgeKey(index, strengthTargetIndex)
                : `tradeoff:${index}`,
            from: home,
            fromIndex: index,
            to: target,
            toIndex: variant === "strength" ? strengthTargetIndex : null,
          });

          if (variant === "strength") {
            const connectionCount = 1 + ((index * 5 + 3) % 3);

            for (let edge = 0; edge < connectionCount; edge++) {
              const targetIndex =
                (index * (edge + 3) + edge * 7 + 5) % observerCount;

              if (targetIndex <= index) {
                continue;
              }

              const meshTarget = getStrengthHome(targetIndex);
              const meshLineGeometry = trackDisposable(
                new THREE.BufferGeometry().setFromPoints([home, meshTarget]),
              );

              observerGroup.add(new THREE.Line(meshLineGeometry, meshEdgeMaterial));

              addPacketEdgeAnimation({
                edgeKey: getNodePairEdgeKey(index, targetIndex),
                from: home,
                fromIndex: index,
                to: meshTarget,
                toIndex: targetIndex,
              });
            }
          }

          observerGroup.add(person);

          observerAnimations.push({
            group: person,
            home,
            phase: index * 0.43,
          });
        }

        const lightTrailPosition = new THREE.Vector3();
        const lightTrailDirection = new THREE.Vector3();
        const lightTrailNormal = new THREE.Vector3();
        const lightTrailSide = new THREE.Vector3();
        const lightTrailPlaneNormal = new THREE.Vector3();
        const lightTrailMatrix = new THREE.Matrix4();
        const cameraInObserverSpace = new THREE.Vector3();
        const lightTrailStart = new THREE.Vector3();
        const lightTrailEnd = new THREE.Vector3();
        let storyStartedAt: number | null = null;

        const updateLightTrail = (
          trail: ReturnType<typeof createLightTrail>,
          from: InstanceType<typeof THREE.Vector3>,
          to: InstanceType<typeof THREE.Vector3>,
          progress: number,
          intensity: number,
        ) => {
          const visible = intensity > 0.025;

          trail.core.visible = visible;
          trail.glow.visible = visible;
          trail.coreLine.visible = visible;
          trail.glowLine.visible = visible;

          if (!visible) {
            return;
          }

          lightTrailPosition.lerpVectors(from, to, progress);
          lightTrailDirection.subVectors(to, from);
          const distance = lightTrailDirection.length();

          if (distance <= 0.001) {
            trail.core.visible = false;
            trail.glow.visible = false;
            trail.coreLine.visible = false;
            trail.glowLine.visible = false;
            return;
          }

          lightTrailDirection.divideScalar(distance);
          lightTrailNormal
            .subVectors(cameraInObserverSpace, lightTrailPosition)
            .normalize();
          lightTrailSide.crossVectors(lightTrailNormal, lightTrailDirection);

          if (lightTrailSide.lengthSq() < 0.0001) {
            lightTrailSide.set(0, 1, 0);
          } else {
            lightTrailSide.normalize();
          }

          lightTrailPlaneNormal
            .crossVectors(lightTrailDirection, lightTrailSide)
            .normalize();
          lightTrailMatrix.makeBasis(
            lightTrailDirection,
            lightTrailSide,
            lightTrailPlaneNormal,
          );

          trail.core.position.copy(lightTrailPosition);
          trail.glow.position.copy(lightTrailPosition);
          trail.core.quaternion.setFromRotationMatrix(lightTrailMatrix);
          trail.glow.quaternion.copy(trail.core.quaternion);
          trail.core.scale.set(Math.min(distance * 0.32, 0.46), 0.03, 1);
          trail.glow.scale.set(Math.min(distance * 0.44, 0.62), 0.12, 1);
          trail.coreMaterial.opacity = 0.28 + intensity * 0.58;
          trail.glowMaterial.opacity = intensity * 0.42;

          const segmentOffset = Math.min(0.16, 0.18 / distance);
          const segmentStart = Math.max(0, progress - segmentOffset);
          const segmentEnd = Math.min(1, progress + segmentOffset);

          lightTrailStart.lerpVectors(from, to, segmentStart);
          lightTrailEnd.lerpVectors(from, to, segmentEnd);

          [trail.coreLine, trail.glowLine].forEach((line) => {
            const positionAttribute = line.geometry.getAttribute(
              "position",
            ) as InstanceType<typeof THREE.BufferAttribute>;

            positionAttribute.setXYZ(
              0,
              lightTrailStart.x,
              lightTrailStart.y,
              lightTrailStart.z,
            );
            positionAttribute.setXYZ(
              1,
              lightTrailEnd.x,
              lightTrailEnd.y,
              lightTrailEnd.z,
            );
            positionAttribute.needsUpdate = true;
          });
          trail.coreLineMaterial.opacity = 0.26 + intensity * 0.62;
          trail.glowLineMaterial.opacity = intensity * 0.32;
        };

        updateStoryLayers.push((time) => {
          storyStartedAt ??= time;
          const storyTime = time - storyStartedAt;

          observerGroup.updateWorldMatrix(true, false);
          cameraInObserverSpace.copy(camera.position);
          observerGroup.worldToLocal(cameraInObserverSpace);

          const ledActivity = Array.from({ length: observerCount }, () => [
            0,
            0,
            0,
          ]);
          const markNodeActivity = (
            nodeIndex: number | null,
            ledIndex: number,
            intensity: number,
          ) => {
            if (nodeIndex === null || !nodeLedMaterials[nodeIndex]) {
              return;
            }

            ledActivity[nodeIndex][ledIndex] = Math.max(
              ledActivity[nodeIndex][ledIndex],
              Math.min(1, intensity),
            );
          };

          meshPacketAnimations.forEach((animation) => {
            if (
              animation.activeStartedAt === null &&
              storyTime >= animation.nextStartAt
            ) {
              animation.activeStartedAt = storyTime;
              animation.duration = randomBetween(
                packetTravelDurationRange.min,
                packetTravelDurationRange.max,
              );
              animation.forward = Math.random() >= 0.5;
            }

            if (animation.activeStartedAt === null) {
              updateLightTrail(animation.trail, animation.from, animation.to, 0, 0);
              return;
            }

            const progress =
              (storyTime - animation.activeStartedAt) / animation.duration;

            if (progress >= 1) {
              animation.activeStartedAt = null;
              animation.nextStartAt =
                storyTime +
                randomBetween(packetIdleDelayRange.min, packetIdleDelayRange.max);
              updateLightTrail(animation.trail, animation.from, animation.to, 0, 0);
              return;
            }

            const from = animation.forward ? animation.from : animation.to;
            const to = animation.forward ? animation.to : animation.from;
            const fromIndex = animation.forward
              ? animation.fromIndex
              : animation.toIndex;
            const toIndex = animation.forward
              ? animation.toIndex
              : animation.fromIndex;
            const visibility = Math.sin(progress * Math.PI);

            updateLightTrail(animation.trail, from, to, progress, visibility);
            markNodeActivity(fromIndex, 0, 1 - Math.min(progress / 0.2, 1));
            markNodeActivity(toIndex, 2, Math.max((progress - 0.8) / 0.2, 0));
            markNodeActivity(fromIndex, 1, visibility * 0.22);
            markNodeActivity(toIndex, 1, visibility * 0.22);
          });

          observerAnimations.forEach(({ group, home, phase }) => {
            const bob = Math.sin(time * 1.8 + phase) * 0.026;
            group.position.set(home.x, home.y + bob, home.z);
          });

          nodeLedMaterials.forEach((materials, nodeIndex) => {
            materials.forEach((material, ledIndex) => {
              material.color.copy(ledPalette[ledIndex].off).lerp(
                ledPalette[ledIndex].on,
                ledActivity[nodeIndex][ledIndex],
              );
            });
          });
          nodeLedGlowMaterials.forEach((materials, nodeIndex) => {
            materials.forEach((material, ledIndex) => {
              material.opacity = ledActivity[nodeIndex][ledIndex] * 0.62;
            });
          });
        });

        if (variant === "tradeoff") {
          const faceEyeCanvas = document.createElement("canvas");
          faceEyeCanvas.width = 1024;
          faceEyeCanvas.height = 512;
          const faceEyeContext = faceEyeCanvas.getContext("2d");

          if (faceEyeContext) {
            const width = faceEyeCanvas.width;
            const height = faceEyeCanvas.height;
            const centerX = width / 2;
            const centerY = height / 2 + 8;

            faceEyeContext.clearRect(0, 0, width, height);
            faceEyeContext.save();
            faceEyeContext.beginPath();
            faceEyeContext.moveTo(112, centerY + 6);
            faceEyeContext.bezierCurveTo(255, 92, 725, 72, 912, centerY + 8);
            faceEyeContext.bezierCurveTo(722, 425, 284, 412, 112, centerY + 6);
            faceEyeContext.closePath();
            faceEyeContext.clip();

            const scleraGradient = faceEyeContext.createRadialGradient(
              centerX,
              centerY,
              72,
              centerX,
              centerY,
              430,
            );
            scleraGradient.addColorStop(0, "rgba(246, 253, 255, 0.96)");
            scleraGradient.addColorStop(0.48, "rgba(170, 229, 244, 0.82)");
            scleraGradient.addColorStop(1, "rgba(25, 77, 104, 0.18)");
            faceEyeContext.fillStyle = scleraGradient;
            faceEyeContext.fillRect(0, 0, width, height);

            const lidShadow = faceEyeContext.createLinearGradient(
              0,
              92,
              0,
              330,
            );
            lidShadow.addColorStop(0, "rgba(1, 8, 16, 0.76)");
            lidShadow.addColorStop(0.42, "rgba(7, 39, 61, 0.12)");
            lidShadow.addColorStop(1, "rgba(255, 255, 255, 0.04)");
            faceEyeContext.fillStyle = lidShadow;
            faceEyeContext.fillRect(0, 0, width, height);

            const irisRadius = 116;
            const irisGradient = faceEyeContext.createRadialGradient(
              centerX,
              centerY,
              18,
              centerX,
              centerY,
              irisRadius,
            );
            irisGradient.addColorStop(0, "rgba(187, 250, 255, 0.96)");
            irisGradient.addColorStop(0.34, "rgba(58, 196, 232, 0.88)");
            irisGradient.addColorStop(0.72, "rgba(10, 92, 143, 0.9)");
            irisGradient.addColorStop(1, "rgba(4, 29, 54, 0.98)");
            faceEyeContext.beginPath();
            faceEyeContext.arc(centerX, centerY, irisRadius, 0, Math.PI * 2);
            faceEyeContext.fillStyle = irisGradient;
            faceEyeContext.fill();

            for (let rayIndex = 0; rayIndex < 72; rayIndex++) {
              const angle = (rayIndex / 72) * Math.PI * 2;
              const innerRadius = 34 + (rayIndex % 5) * 4;
              const outerRadius = irisRadius - 8 - (rayIndex % 7) * 3;

              faceEyeContext.beginPath();
              faceEyeContext.moveTo(
                centerX + Math.cos(angle) * innerRadius,
                centerY + Math.sin(angle) * innerRadius,
              );
              faceEyeContext.lineTo(
                centerX + Math.cos(angle) * outerRadius,
                centerY + Math.sin(angle) * outerRadius,
              );
              faceEyeContext.strokeStyle =
                rayIndex % 3 === 0
                  ? "rgba(213, 255, 255, 0.42)"
                  : "rgba(0, 34, 62, 0.28)";
              faceEyeContext.lineWidth = rayIndex % 4 === 0 ? 3.8 : 2;
              faceEyeContext.stroke();
            }

            faceEyeContext.beginPath();
            faceEyeContext.arc(centerX, centerY, 126, 0, Math.PI * 2);
            faceEyeContext.strokeStyle = "rgba(175, 246, 255, 0.72)";
            faceEyeContext.lineWidth = 8;
            faceEyeContext.stroke();

            const pupilGradient = faceEyeContext.createRadialGradient(
              centerX - 10,
              centerY - 12,
              8,
              centerX,
              centerY,
              58,
            );
            pupilGradient.addColorStop(0, "rgba(17, 37, 53, 1)");
            pupilGradient.addColorStop(0.42, "rgba(0, 5, 12, 1)");
            pupilGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
            faceEyeContext.beginPath();
            faceEyeContext.arc(centerX, centerY, 58, 0, Math.PI * 2);
            faceEyeContext.fillStyle = pupilGradient;
            faceEyeContext.fill();

            faceEyeContext.beginPath();
            faceEyeContext.ellipse(centerX + 38, centerY - 48, 28, 17, -0.35, 0, Math.PI * 2);
            faceEyeContext.fillStyle = "rgba(255, 255, 255, 0.9)";
            faceEyeContext.fill();
            faceEyeContext.beginPath();
            faceEyeContext.ellipse(centerX - 30, centerY + 42, 18, 9, 0.2, 0, Math.PI * 2);
            faceEyeContext.fillStyle = "rgba(150, 238, 255, 0.38)";
            faceEyeContext.fill();
            faceEyeContext.restore();

            faceEyeContext.beginPath();
            faceEyeContext.moveTo(112, centerY + 6);
            faceEyeContext.bezierCurveTo(255, 92, 725, 72, 912, centerY + 8);
            faceEyeContext.bezierCurveTo(722, 425, 284, 412, 112, centerY + 6);
            faceEyeContext.closePath();
            faceEyeContext.strokeStyle = "rgba(232, 252, 255, 0.94)";
            faceEyeContext.lineWidth = 16;
            faceEyeContext.shadowColor = "rgba(89, 212, 255, 0.9)";
            faceEyeContext.shadowBlur = 24;
            faceEyeContext.stroke();

            faceEyeContext.beginPath();
            faceEyeContext.moveTo(138, centerY - 2);
            faceEyeContext.bezierCurveTo(286, 78, 714, 66, 890, centerY + 2);
            faceEyeContext.strokeStyle = "rgba(255, 255, 255, 0.56)";
            faceEyeContext.lineWidth = 7;
            faceEyeContext.shadowBlur = 10;
            faceEyeContext.stroke();
          }

          const faceEyeTexture = trackDisposable(
            new THREE.CanvasTexture(faceEyeCanvas),
          );
          faceEyeTexture.colorSpace = THREE.SRGBColorSpace;
          const faceEyeGeometry = trackDisposable(
            new THREE.PlaneGeometry(0.82, 0.4),
          );
          const faceEyeMaterial = trackDisposable(
            new THREE.MeshBasicMaterial({
              depthWrite: false,
              map: faceEyeTexture,
              opacity: 0.98,
              side: THREE.DoubleSide,
              toneMapped: false,
              transparent: true,
            }),
          );
          const lowerFaceTriples = [
            [bottom, lowerFront, lowerLeft],
            [bottom, lowerRight, lowerFront],
            [bottom, lowerBack, lowerRight],
            [bottom, lowerLeft, lowerBack],
          ] as const;

          lowerFaceTriples.forEach((facePoints) => {
            const centroid = facePoints
              .reduce(
                (sum, point) => sum.add(point),
                new THREE.Vector3(0, 0, 0),
              )
              .divideScalar(facePoints.length);
            const xAxis = new THREE.Vector3()
              .subVectors(facePoints[2], facePoints[1])
              .normalize();
            const normal = new THREE.Vector3()
              .crossVectors(
                new THREE.Vector3().subVectors(facePoints[1], facePoints[0]),
                new THREE.Vector3().subVectors(facePoints[2], facePoints[0]),
              )
              .normalize();
            const yAxis = new THREE.Vector3()
              .crossVectors(normal, xAxis)
              .normalize();
            const eyeBasis = new THREE.Matrix4().makeBasis(xAxis, yAxis, normal);
            const eyeGroup = new THREE.Group();

            eyeGroup.position.copy(centroid).addScaledVector(normal, 0.018);
            eyeGroup.quaternion.setFromRotationMatrix(eyeBasis);
            eyeGroup.scale.setScalar(1.12);

            const eye = new THREE.Mesh(faceEyeGeometry, faceEyeMaterial);
            eye.renderOrder = 10;
            eyeGroup.add(eye);

            logoGroup.add(eyeGroup);
          });

          const worldMapGroup = new THREE.Group();
          worldMapGroup.position.set(0, -1.68, 0.18);
          worldMapGroup.rotation.x = -0.18;
          worldMapGroup.scale.setScalar(1.08);
          storyGroup.add(worldMapGroup);

          const oceanPlateGeometry = trackDisposable(
            new THREE.BoxGeometry(3.34, 0.11, 1.62),
          );
          const oceanPlateMaterial = trackDisposable(
            new THREE.MeshStandardMaterial({
              color: "#050d15",
              emissive: "#061b2a",
              emissiveIntensity: 0.34,
              metalness: 0.28,
              opacity: 0.94,
              roughness: 0.4,
              transparent: true,
            }),
          );
          const oceanPlate = new THREE.Mesh(oceanPlateGeometry, oceanPlateMaterial);
          oceanPlate.position.y = -0.07;
          worldMapGroup.add(oceanPlate);

          const landMaterial = trackDisposable(
            new THREE.MeshStandardMaterial({
              color: "#1682a8",
              emissive: "#0c668d",
              emissiveIntensity: 0.62,
              metalness: 0.24,
              roughness: 0.34,
            }),
          );
          const landSideMaterial = trackDisposable(
            new THREE.MeshStandardMaterial({
              color: "#062338",
              emissive: "#03111c",
              emissiveIntensity: 0.18,
              metalness: 0.16,
              roughness: 0.56,
            }),
          );
          const projectedLandPoints: Array<{ x: number; y: number }> = [];
          const projectGeoPoint = ([longitude, latitude]: GeoJsonPosition) => {
            return new THREE.Vector2((longitude / 180) * 1.58, (latitude / 90) * 0.72);
          };
          const addProjectedSample = (point: GeoJsonPosition, sampleIndex: number) => {
            if (sampleIndex % 6 !== 0 || point[1] < -58) {
              return;
            }

            const projected = projectGeoPoint(point);
            projectedLandPoints.push({ x: projected.x, y: projected.y });
          };
          const addMapPolygon = (polygon: GeoJsonPolygon) => {
            const exterior = polygon[0]
              ?.filter((point, pointIndex) => pointIndex % 2 === 0)
              .map(projectGeoPoint);

            if (!exterior || exterior.length < 4) {
              return;
            }

            const landShape = new THREE.Shape(exterior);

            polygon.slice(1).forEach((hole) => {
              const holePoints = hole
                .filter((point, pointIndex) => pointIndex % 2 === 0)
                .map(projectGeoPoint);

              if (holePoints.length >= 4) {
                landShape.holes.push(new THREE.Path(holePoints));
              }
            });

            const landGeometry = trackDisposable(
              new THREE.ExtrudeGeometry(landShape, {
                bevelEnabled: true,
                bevelSegments: 2,
                bevelSize: 0.008,
                bevelThickness: 0.008,
                depth: 0.082,
              }),
            );
            landGeometry.rotateX(-Math.PI / 2);
            landGeometry.computeVertexNormals();

            const landMesh = new THREE.Mesh(landGeometry, [
              landMaterial,
              landSideMaterial,
            ]);
            landMesh.position.y = -0.006;
            worldMapGroup.add(landMesh);
          };

          (worldLand as unknown as GeoJsonFeatureCollection).features.forEach((feature) => {
            const { geometry } = feature;
            const polygons =
              geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

            polygons.forEach((polygon) => {
              polygon[0]?.forEach(addProjectedSample);
              addMapPolygon(polygon);
            });
          });

          const binaryGlyphGeometry = trackDisposable(
            new THREE.PlaneGeometry(0.102, 0.132),
          );
          const createBinaryGlyphTexture = (glyph: "0" | "1") => {
            const glyphCanvas = document.createElement("canvas");
            glyphCanvas.width = 96;
            glyphCanvas.height = 128;
            const context = glyphCanvas.getContext("2d");

            if (context) {
              context.clearRect(0, 0, glyphCanvas.width, glyphCanvas.height);
              context.font = "800 82px monospace";
              context.textAlign = "center";
              context.textBaseline = "middle";
              context.shadowColor = "rgba(135, 238, 255, 1)";
              context.shadowBlur = 18;
              context.fillStyle = "rgba(182, 247, 255, 0.94)";
              context.fillText(glyph, glyphCanvas.width / 2, glyphCanvas.height / 2);
            }

            const texture = trackDisposable(new THREE.CanvasTexture(glyphCanvas));
            texture.colorSpace = THREE.SRGBColorSpace;

            return texture;
          };
          const binaryGlyphTextures = {
            "0": createBinaryGlyphTexture("0"),
            "1": createBinaryGlyphTexture("1"),
          };
          const createBinaryGlyphMaterial = (glyph: "0" | "1") =>
            trackDisposable(
              new THREE.MeshBasicMaterial({
                blending: THREE.AdditiveBlending,
                color: "#a5f1ff",
                depthTest: false,
                depthWrite: false,
                map: binaryGlyphTextures[glyph],
                opacity: 0,
                side: THREE.DoubleSide,
                transparent: true,
              }),
            );
          const binaryStreams = Array.from({ length: 44 }, (_, streamIndex) => {
            const sample =
              projectedLandPoints[
                Math.floor(Math.random() * projectedLandPoints.length)
              ] ?? { x: 0, y: 0 };
            const glyphCount = 4 + (streamIndex % 3);
            const glyphs = Array.from({ length: glyphCount }, (_, glyphIndex) => {
              const glyph =
                (streamIndex * 17 + glyphIndex * 7) % 3 === 0 ? "0" : "1";
              const material = createBinaryGlyphMaterial(glyph);
              const mesh = new THREE.Mesh(binaryGlyphGeometry, material);

              mesh.position.set(sample.x, 0.09 + glyphIndex * 0.13, -sample.y);
              mesh.rotation.y = (Math.random() - 0.5) * 0.28;
              mesh.renderOrder = 12;
              mesh.visible = false;
              worldMapGroup.add(mesh);

              return {
                material,
                mesh,
                offset: glyphIndex / glyphCount,
              };
            });

            return {
              baseX: sample.x,
              baseZ: -sample.y,
              duration: randomBetween(0.9, 1.7),
              glyphs,
              nextStartAt: randomBetween(0, 1.8),
              startedAt: null as number | null,
            };
          });

          updateStoryLayers.push((time) => {
            storyStartedAt ??= time;
            const storyTime = time - storyStartedAt;
            const activeStreamLimit = 17;
            let activeStreamCount = binaryStreams.reduce(
              (count, streamState) =>
                streamState.startedAt === null ? count : count + 1,
              0,
            );

            binaryStreams.forEach((streamState) => {
              if (
                streamState.startedAt === null &&
                storyTime >= streamState.nextStartAt &&
                activeStreamCount < activeStreamLimit
              ) {
                streamState.startedAt = storyTime;
                streamState.duration = randomBetween(0.9, 1.7);
                activeStreamCount += 1;
              }

              if (streamState.startedAt === null) {
                streamState.glyphs.forEach(({ material, mesh }) => {
                  material.opacity = 0;
                  mesh.visible = false;
                });
                return;
              }

              const progress =
                (storyTime - streamState.startedAt) / streamState.duration;

              if (progress >= 1) {
                streamState.startedAt = null;
                streamState.nextStartAt = storyTime + randomBetween(0.08, 1.1);
                streamState.glyphs.forEach(({ material, mesh }) => {
                  material.opacity = 0;
                  mesh.visible = false;
                });
                return;
              }

              streamState.glyphs.forEach(({ material, mesh, offset }) => {
                const glyphProgress = Math.max(
                  0,
                  Math.min(1, progress * 1.32 - offset * 0.32),
                );
                const fadeIn = Math.min(glyphProgress / 0.18, 1);
                const fadeOut = Math.min((1 - glyphProgress) / 0.26, 1);
                const visibility = Math.min(fadeIn, fadeOut);

                mesh.visible = visibility > 0.01;
                mesh.position.set(
                  streamState.baseX,
                  0.105 + offset * 0.62 + progress * 0.2,
                  streamState.baseZ,
                );
                mesh.scale.setScalar(0.94 + visibility * 0.24);
                material.opacity = visibility * 0.96;
              });
            });
          });
        }

        const logoPitch = (31.5 * Math.PI) / 180;

        viewGroup.rotation.x = logoPitch;
        logoGroup.rotation.y = 0.58;

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.floor(bounds.width));
          const height = Math.max(1, Math.floor(bounds.height));
          const aspect = width / height;
          const hostHeight = canvas.parentElement?.getBoundingClientRect().height;
          const canvasScale = hostHeight && hostHeight > 0 ? height / hostHeight : 1.24;
          const verticalSize = 4.65 * canvasScale;

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
        const logoSpinSpeed = 0.37;

        const render = () => {
          const time = performance.now() * 0.001;

          if (!reducedMotion.matches) {
            logoGroup.rotation.y = 0.58 + time * logoSpinSpeed;

            if (variant === "strength") {
              observerGroup.rotation.y = Math.sin(time * 0.13) * 0.12;
            }
          }

          updateStoryLayers.forEach((updateStoryLayer) =>
            updateStoryLayer(time),
          );
          updateGlowLayers.forEach((updateGlowLayer) =>
            updateGlowLayer(time),
          );
          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };

        render();
        disposeScene = () => {
          disposableResources.forEach((resource) => resource.dispose());
          renderer.dispose();
        };
      } catch (error) {
        console.error("Failed to render Ethereum logo animation.", error);
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
  }, [variant]);

  return (
    <div className="ethereum-orbit" aria-hidden="true">
      <canvas ref={canvasRef} className="ethereum-orbit__canvas" />
      {showFallback ? <div className="ethereum-orbit__fallback" /> : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type EthereumLogoOrbitProps = Readonly<{
  variant?: "strength" | "tradeoff";
}>;

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
          new THREE.BoxGeometry(0.22, 0.07, 0.16),
        );
        const validatorDeckGeometry = trackDisposable(
          new THREE.BoxGeometry(0.16, 0.045, 0.12),
        );
        const validatorCoreGeometry = trackDisposable(
          new THREE.CylinderGeometry(0.038, 0.032, 0.07, 6, 1),
        );
        const validatorPortGeometry = trackDisposable(
          new THREE.BoxGeometry(0.026, 0.012, 0.01),
        );
        const validatorLightGeometry = trackDisposable(
          new THREE.SphereGeometry(0.014, 10, 8),
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
            color: "#7fa8d8",
            emissive: "#12386f",
            emissiveIntensity: 0.42,
            metalness: 0.18,
            opacity: 0.84,
            roughness: 0.46,
            transparent: true,
          }),
        );
        const validatorDeckMaterial = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: "#cde9ff",
            emissive: "#1b6bb5",
            emissiveIntensity: 0.34,
            metalness: 0.08,
            opacity: 0.78,
            roughness: 0.38,
            transparent: true,
          }),
        );
        const validatorCoreMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#dff7ff",
            depthWrite: false,
            opacity: 0.86,
            transparent: true,
          }),
        );
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
        const packetGeometry = trackDisposable(
          new THREE.SphereGeometry(0.022, 12, 8),
        );
        const observePacketMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#dff7ff",
            depthWrite: false,
            opacity: 0.78,
            transparent: true,
          }),
        );
        const replayPacketMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#5fb7ff",
            depthWrite: false,
            opacity: 0.72,
            transparent: true,
          }),
        );

        const observerAnimations: Array<{
          group: InstanceType<typeof THREE.Group>;
          home: InstanceType<typeof THREE.Vector3>;
          observePacket: InstanceType<typeof THREE.Mesh>;
          replayPacket: InstanceType<typeof THREE.Mesh>;
          phase: number;
          target: InstanceType<typeof THREE.Vector3>;
        }> = [];
        const meshPacketAnimations: Array<{
          from: InstanceType<typeof THREE.Vector3>;
          packet: InstanceType<typeof THREE.Mesh>;
          phase: number;
          speed: number;
          to: InstanceType<typeof THREE.Vector3>;
        }> = [];

        const observerCount = 22;
        const strengthVerificationTarget = new THREE.Vector3(0, -1.34, 0.18);
        const tradeoffVerificationTarget = centerPoint;
        const strengthHomes = Array.from({ length: observerCount }, (_, index) => {
          const angle = (index / observerCount) * Math.PI * 2;
          const strengthRadius = 1.28 + (index % 3) * 0.08;

          return new THREE.Vector3(
            strengthVerificationTarget.x + Math.cos(angle) * strengthRadius,
            strengthVerificationTarget.y,
            strengthVerificationTarget.z + Math.sin(angle) * strengthRadius,
          );
        });
        const getStrengthHome = (index: number) => {
          return strengthHomes[index].clone();
        };

        storyGroup.add(observerGroup);

        for (let index = 0; index < observerCount; index++) {
          const angle = (index / observerCount) * Math.PI * 2;
          const radius = 1.66 + (index % 4) * 0.14;
          const target =
            variant === "strength"
              ? getStrengthHome((index * 7 + 5) % observerCount)
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
            const nodeRotation = angle + Math.PI / 2;
            const heightOffset = (index % 4) * 0.012;

            person.rotation.y = nodeRotation;

            const base = new THREE.Mesh(
              validatorBaseGeometry,
              validatorShellMaterial,
            );
            base.position.y = -0.03 + heightOffset;
            base.scale.set(1 + (index % 3) * 0.05, 1, 1);
            person.add(base);

            const deck = new THREE.Mesh(
              validatorDeckGeometry,
              validatorDeckMaterial,
            );
            deck.position.y = 0.035 + heightOffset;
            person.add(deck);

            const core = new THREE.Mesh(
              validatorCoreGeometry,
              validatorCoreMaterial,
            );
            core.position.y = 0.106 + heightOffset;
            core.rotation.y = Math.PI / 6;
            person.add(core);

            for (let portIndex = 0; portIndex < 3; portIndex++) {
              const port = new THREE.Mesh(
                validatorPortGeometry,
                validatorDeckMaterial,
              );
              port.position.set(-0.058 + portIndex * 0.058, 0.038, 0.066);
              person.add(port);
            }

            for (let lightIndex = 0; lightIndex < 2; lightIndex++) {
              const light = new THREE.Mesh(
                validatorLightGeometry,
                validatorCoreMaterial,
              );
              light.position.set(
                lightIndex === 0 ? -0.064 : 0.064,
                0.086 + heightOffset,
                0.054,
              );
              person.add(light);
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
            index % 2 === 0 ? verificationLineMaterial : replayLineMaterial,
          );
          observerGroup.add(verificationLine);

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

              observerGroup.add(
                new THREE.Line(meshLineGeometry, replayLineMaterial),
              );

              const meshPacketMaterial = trackDisposable(
                (index % 2 === 0
                  ? replayPacketMaterial
                  : observePacketMaterial
                ).clone(),
              );
              meshPacketMaterial.opacity = 0.18;
              const meshPacket = new THREE.Mesh(
                packetGeometry,
                meshPacketMaterial,
              );
              observerGroup.add(meshPacket);

              meshPacketAnimations.push({
                from: home,
                packet: meshPacket,
                phase: ((index * 13 + edge * 17) % 29) / 29,
                speed: 0.08 + ((index * 7 + edge * 11) % 5) * 0.012,
                to: meshTarget,
              });
            }
          }

          const observePacket = new THREE.Mesh(
            packetGeometry,
            observePacketMaterial,
          );
          const replayPacket = new THREE.Mesh(packetGeometry, replayPacketMaterial);
          observerGroup.add(observePacket, replayPacket, person);

          observerAnimations.push({
            group: person,
            home,
            observePacket,
            phase: index * 0.43,
            replayPacket,
            target,
          });
        }

        updateStoryLayers.push((time) => {
          meshPacketAnimations.forEach(({ from, packet, phase, speed, to }) => {
            const progress = (time * speed + phase) % 1;
            const visibility = Math.sin(progress * Math.PI);

            packet.position.lerpVectors(from, to, progress);
            packet.scale.setScalar(0.72 + visibility * 0.32);
            (
              packet.material as InstanceType<typeof THREE.MeshBasicMaterial>
            ).opacity = 0.12 + visibility * 0.3;
          });

          observerAnimations.forEach(
            ({ group, home, observePacket, phase, replayPacket, target }) => {
              const bob = Math.sin(time * 1.8 + phase) * 0.026;
              group.position.set(home.x, home.y + bob, home.z);

              const observeProgress =
                (Math.sin(time * 0.86 + phase) + 1) / 2;
              const replayProgress =
                (Math.sin(time * 0.86 + phase + Math.PI) + 1) / 2;

              observePacket.position.lerpVectors(
                target,
                home,
                observeProgress,
              );
              replayPacket.position.lerpVectors(
                home,
                target,
                replayProgress,
              );
            },
          );
        });

        const privacyGroup = new THREE.Group();
        privacyGroup.position.set(1.58, -0.72, 0.2);
        privacyGroup.scale.setScalar(0.84);
        if (variant === "tradeoff") {
          storyGroup.add(privacyGroup);
        }

        const eyeMaterial = trackDisposable(
          new THREE.LineBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#ff9ac7",
            depthWrite: false,
            opacity: 0.72,
            transparent: true,
          }),
        );
        const upperEye = new THREE.EllipseCurve(0, 0, 0.32, 0.16, 0, Math.PI);
        const lowerEye = new THREE.EllipseCurve(
          0,
          0,
          0.32,
          0.16,
          Math.PI,
          Math.PI * 2,
        );
        const eyeGeometry = trackDisposable(
          new THREE.BufferGeometry().setFromPoints([
            ...upperEye.getPoints(36),
            ...lowerEye.getPoints(36),
          ].map((point) => new THREE.Vector3(point.x, point.y, 0.02))),
        );
        const eyeLine = new THREE.Line(eyeGeometry, eyeMaterial);
        privacyGroup.add(eyeLine);

        const pupilMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#ffd1e4",
            depthWrite: false,
            opacity: 0.54,
            transparent: true,
          }),
        );
        const pupil = new THREE.Mesh(
          trackDisposable(new THREE.SphereGeometry(0.055, 18, 12)),
          pupilMaterial,
        );
        pupil.position.z = 0.04;
        privacyGroup.add(pupil);

        const slashGeometry = trackDisposable(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.34, -0.23, 0.06),
            new THREE.Vector3(0.34, 0.23, 0.06),
          ]),
        );
        const slashMaterial = trackDisposable(
          new THREE.LineBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#ff5d97",
            depthWrite: false,
            opacity: 0.86,
            transparent: true,
          }),
        );
        const privacySlash = new THREE.Line(slashGeometry, slashMaterial);
        privacyGroup.add(privacySlash);

        if (variant === "tradeoff") {
          updateStoryLayers.push((time) => {
            const privacyPulse = (Math.sin(time * 1.86 + 1.2) + 1) / 2;

            privacyGroup.scale.setScalar(0.8 + privacyPulse * 0.08);
            eyeMaterial.opacity = 0.5 + privacyPulse * 0.32;
            slashMaterial.opacity = 0.72 + privacyPulse * 0.2;
            pupilMaterial.opacity = 0.38 + privacyPulse * 0.28;
          });
        }

        const pressureRingGeometry = trackDisposable(
          new THREE.TorusGeometry(1.36, 0.006, 8, 128),
        );
        const pressureRingMaterial = trackDisposable(
          new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            color: "#4bbaff",
            depthWrite: false,
            opacity: 0.22,
            transparent: true,
          }),
        );
        const pressureRing = new THREE.Mesh(
          pressureRingGeometry,
          pressureRingMaterial,
        );
        pressureRing.rotation.x = Math.PI / 2;
        pressureRing.scale.y = 0.58;
        if (variant === "tradeoff") {
          storyGroup.add(pressureRing);
        }

        updateStoryLayers.push((time) => {
          const ringPulse = (Math.sin(time * 1.28) + 1) / 2;

          pressureRingMaterial.opacity = 0.08 + ringPulse * 0.1;
        });

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
            pressureRing.rotation.z = time * 0.09;
            observerGroup.rotation.y = Math.sin(time * 0.13) * 0.12;
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

"use client";

import { useEffect, useRef, useState } from "react";

export function EthereumLogoOrbit() {
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

        const logoGroup = new THREE.Group();
        scene.add(logoGroup);
        const disposableGeometries: Array<{ dispose: () => void }> = [];
        const disposableMaterials: Array<{ dispose: () => void }> = [];

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
            color: "#e7f1ff",
            opacity: 0.75,
          },
          {
            points: [top, upperFront, upperRight],
            color: "#a8d4ff",
            opacity: 0.75,
          },
          {
            points: [top, upperRight, upperBack],
            color: "#5d9df0",
            opacity: 0.75,
          },
          {
            points: [top, upperBack, upperLeft],
            color: "#263d76",
            opacity: 0.75,
          },
          { points: [bottom, lowerFront, lowerLeft], color: "#d1e7ff" },
          { points: [bottom, lowerRight, lowerFront], color: "#84bdff" },
          { points: [bottom, lowerBack, lowerRight], color: "#3a75d1" },
          { points: [bottom, lowerLeft, lowerBack], color: "#15214b" },
          {
            points: [upperLeft, upperBack, upperRight, upperFront],
            color: "#4a9dff",
            index: [0, 1, 2, 0, 2, 3],
          },
          {
            points: [lowerLeft, lowerFront, lowerRight, lowerBack],
            color: "#326faa",
            index: [0, 1, 2, 0, 2, 3],
          },
        ];

        surfaces.forEach((surface, index) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            ...surface.points,
          ]);
          geometry.setIndex(surface.index ?? [0, 1, 2]);
          geometry.computeVertexNormals();
          disposableGeometries.push(geometry);

          const material = new THREE.MeshStandardMaterial({
            color: surface.color,
            emissive: index % 4 === 0 ? "#12345c" : "#050a16",
            emissiveIntensity: index % 4 === 0 ? 0.18 : 0.08,
            metalness: 0.36,
            opacity: surface.opacity ?? 1,
            roughness: 0.42,
            side: THREE.DoubleSide,
            transparent: surface.opacity !== undefined,
          });
          disposableMaterials.push(material);

          logoGroup.add(new THREE.Mesh(geometry, material));

          const edges = new THREE.EdgesGeometry(geometry);
          disposableGeometries.push(edges);
          const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0xd8ecff,
            transparent: true,
            opacity: 0.32,
          });
          disposableMaterials.push(edgeMaterial);
          const lines = new THREE.LineSegments(
            edges,
            edgeMaterial,
          );
          logoGroup.add(lines);
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
          const geometry = new THREE.BoxGeometry(2, 2, 2);
          disposableGeometries.push(geometry);

          const material = new THREE.ShaderMaterial({
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
              varying vec3 vWorldPosition;

              void main() {
                vLocalPosition = position;
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
              }
            `,
            fragmentShader: `
              uniform vec3 uCameraLocalPosition;
              uniform vec3 uColor;
              uniform float uOpacity;
              uniform float uTime;
              varying vec3 vLocalPosition;
              varying vec3 vWorldPosition;

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

              vec2 intersectBox(vec3 rayOrigin, vec3 rayDirection) {
                vec3 invDirection = 1.0 / rayDirection;
                vec3 t0 = (-vec3(1.0) - rayOrigin) * invDirection;
                vec3 t1 = (vec3(1.0) - rayOrigin) * invDirection;
                vec3 tMin = min(t0, t1);
                vec3 tMax = max(t0, t1);
                float nearT = max(max(tMin.x, tMin.y), tMin.z);
                float farT = min(min(tMax.x, tMax.y), tMax.z);

                return vec2(nearT, farT);
              }

              void main() {
                vec3 rayOrigin = uCameraLocalPosition;
                vec3 rayDirection = normalize(vLocalPosition - rayOrigin);
                vec2 hit = intersectBox(rayOrigin, rayDirection);
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
                  vec3 q = vec3(p.x * 0.72, p.y * 2.25, p.z * 0.72);
                  float radius = length(q);
                  float centerDensity = exp(-radius * radius * 2.6);
                  float boundaryFade =
                    smoothstep(1.0, 0.2, abs(p.x)) *
                    smoothstep(1.0, 0.2, abs(p.y)) *
                    smoothstep(1.0, 0.2, abs(p.z));
                  float turbulence =
                    noise(p * 3.6 + vec3(0.0, uTime * 0.2, uTime * 0.1)) * 0.45 +
                    noise(p * 8.0 - vec3(uTime * 0.12, 0.0, uTime * 0.16)) * 0.18;
                  float pulse = 0.9 + sin(uTime * 1.22) * 0.06;
                  float density =
                    centerDensity *
                    boundaryFade *
                    (0.86 + turbulence * 0.34) *
                    pulse;

                  accumulatedDensity += density * stepSize;
                  accumulatedCore += centerDensity * boundaryFade * stepSize;
                }

                float alpha = 1.0 - exp(-accumulatedDensity * uOpacity * 1.48);
                vec3 color = uColor * (1.12 + accumulatedCore * 2.38);
                gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.92));
              }
            `,
          });
          disposableMaterials.push(material);

          const volume = new THREE.Mesh(geometry, material);
          volume.position.set(0, gapCenterY, 0);
          volume.renderOrder = 3;
          volume.scale.set(baseScale, verticalScale, baseScale);
          logoGroup.add(volume);

          updateGlowLayers.push((time) => {
            const pulse = (Math.sin(time * 1.62 + phase) + 1) / 2;
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

        addScatteringVolume({
          baseOpacity: 0.48,
          baseScale: 0.66,
          opacityPulse: 0.1,
          phase: 0.1,
          scalePulse: 0.08,
          verticalScale: 0.052,
        });
        addScatteringVolume({
          baseOpacity: 0.3,
          baseScale: 1.16,
          opacityPulse: 0.07,
          phase: 1.45,
          scalePulse: 0.18,
          verticalScale: 0.062,
        });
        addScatteringVolume({
          baseOpacity: 0.15,
          baseScale: 1.86,
          opacityPulse: 0.04,
          phase: 2.5,
          scalePulse: 0.28,
          verticalScale: 0.07,
        });
        addScatteringVolume({
          baseOpacity: 0.07,
          baseScale: 2.55,
          opacityPulse: 0.025,
          phase: 0.7,
          scalePulse: 0.36,
          verticalScale: 0.076,
        });

        const addExpandingDiscPulse = ({
          duration,
          maxScale,
          opacity,
          phase,
        }: {
          duration: number;
          maxScale: number;
          opacity: number;
          phase: number;
        }) => {
          const geometry = new THREE.PlaneGeometry(2, 2, 96, 96);
          disposableGeometries.push(geometry);
          const spillGeometry = new THREE.PlaneGeometry(2, 2, 96, 96);
          disposableGeometries.push(spillGeometry);

          const spillMaterial = new THREE.ShaderMaterial({
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
            uniforms: {
              uOpacity: { value: opacity },
              uProgress: { value: 0 },
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
              uniform float uProgress;
              varying vec2 vUv;

              void main() {
                vec2 p = vUv * 2.0 - 1.0;
                float r = length(p);
                float radius = mix(0.16, 0.9, uProgress);
                float expandingGlow = exp(-pow(abs(r - radius), 2.0) / 0.075);
                float broadIllumination =
                  smoothstep(radius + 0.54, radius - 0.16, r) *
                  exp(-r * r * 0.9);
                float centerBurst = exp(-r * r * 3.2) * pow(1.0 - uProgress, 2.4);
                float fade =
                  smoothstep(1.0, 0.44, uProgress) *
                  (1.0 - smoothstep(0.96, 1.0, uProgress));
                float alpha =
                  (expandingGlow * 0.16 + broadIllumination * 0.2 + centerBurst * 0.06) *
                  fade *
                  uOpacity;
                vec3 color = vec3(0.82, 0.94, 1.0) * (0.9 + expandingGlow * 0.55);

                gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.28));
              }
            `,
          });
          disposableMaterials.push(spillMaterial);

          const material = new THREE.ShaderMaterial({
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
            uniforms: {
              uOpacity: { value: opacity },
              uProgress: { value: 0 },
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
              uniform float uProgress;
              varying vec2 vUv;

              void main() {
                vec2 p = vUv * 2.0 - 1.0;
                float r = length(p);
                float radius = mix(0.18, 0.94, uProgress);
                float ringDistance = abs(r - radius);
                float brightCore = exp(-(ringDistance * ringDistance) / 0.0012);
                float innerHalo = exp(-(ringDistance * ringDistance) / 0.018);
                float outerHalo = exp(-(ringDistance * ringDistance) / 0.095);
                float softBody =
                  smoothstep(radius, radius - 0.22, r) *
                  smoothstep(radius + 0.26, radius, r);
                float tail =
                  smoothstep(radius - 0.52, radius - 0.1, r) *
                  smoothstep(radius + 0.08, radius - 0.12, r);
                float centerIgnition = exp(-r * r * 9.0) * pow(1.0 - uProgress, 2.8);
                float fade =
                  smoothstep(1.0, 0.54, uProgress) *
                  (1.0 - smoothstep(0.94, 1.0, uProgress));
                float alpha =
                  (
                    brightCore * 0.9 +
                    innerHalo * 0.34 +
                    outerHalo * 0.18 +
                    softBody * 0.07 +
                    tail * 0.08 +
                    centerIgnition * 0.06
                  ) *
                  fade *
                  uOpacity;
                vec3 color =
                  vec3(0.9, 0.975, 1.0) *
                  (1.06 + brightCore * 7.2 + innerHalo * 2.45 + outerHalo * 0.95);

                gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.9));
              }
            `,
          });
          disposableMaterials.push(material);

          const spill = new THREE.Mesh(spillGeometry, spillMaterial);
          spill.position.set(0, gapCenterY, 0);
          spill.renderOrder = 2;
          spill.rotation.x = -Math.PI / 2;
          spill.scale.setScalar(maxScale * 1.16);
          logoGroup.add(spill);

          const pulse = new THREE.Mesh(geometry, material);
          pulse.position.set(0, gapCenterY, 0);
          pulse.renderOrder = 4;
          pulse.rotation.x = -Math.PI / 2;
          pulse.scale.setScalar(maxScale);
          logoGroup.add(pulse);

          updateGlowLayers.push((time) => {
            const progress = ((time + phase) % duration) / duration;

            spillMaterial.uniforms.uProgress.value = progress;
            material.uniforms.uProgress.value = progress;
          });
        };

        addExpandingDiscPulse({
          duration: 2.8,
          maxScale: 1.72,
          opacity: 0.6,
          phase: 0,
        });
        addExpandingDiscPulse({
          duration: 2.8,
          maxScale: 2.08,
          opacity: 0.34,
          phase: 1.4,
        });

        const logoPitch = (31.5 * Math.PI) / 180;

        logoGroup.rotation.x = logoPitch;
        logoGroup.rotation.y = 0.58;
        logoGroup.rotation.z = -0.08;

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.floor(bounds.width));
          const height = Math.max(1, Math.floor(bounds.height));
          const aspect = width / height;
          const verticalSize = 3.9;

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
        const axisOscillationSpeed = logoSpinSpeed * (2 / 7);

        const render = () => {
          const time = performance.now() * 0.001;

          if (!reducedMotion.matches) {
            logoGroup.rotation.y = 0.58 + time * logoSpinSpeed;
            logoGroup.rotation.x =
              logoPitch + Math.sin(time * axisOscillationSpeed) * 0.03;
          }

          updateGlowLayers.forEach((updateGlowLayer) =>
            updateGlowLayer(time),
          );
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
  }, []);

  return (
    <div className="ethereum-orbit" aria-hidden="true">
      <canvas ref={canvasRef} className="ethereum-orbit__canvas" />
      {showFallback ? <div className="ethereum-orbit__fallback" /> : null}
    </div>
  );
}

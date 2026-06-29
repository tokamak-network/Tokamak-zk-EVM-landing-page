"use client";

import { useEffect, useRef } from "react";

type DragState = {
  pointerId: number;
  x: number;
  y: number;
} | null;

export function WorldMapLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let animationFrame = 0;
    let disposed = false;
    let dragState: DragState = null;
    let resizeObserver: ResizeObserver | null = null;
    const disposableResources: Array<{ dispose: () => void }> = [];

    const buildScene = async () => {
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
      camera.position.set(0, 2.35, 3.8);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xdcecff, 1.35));

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(2.6, 4.2, 3.8);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x58c6ff, 1.2);
      rimLight.position.set(-3.4, 1.1, -2.2);
      scene.add(rimLight);

      const modelGroup = new THREE.Group();
      modelGroup.rotation.x = -0.12;
      scene.add(modelGroup);

      const trackDisposable = <T extends { dispose: () => void }>(resource: T) => {
        disposableResources.push(resource);
        return resource;
      };

      const textureLoader = new THREE.TextureLoader();
      const colorTexture = trackDisposable(
        await new Promise<InstanceType<typeof THREE.Texture>>(
          (resolve, reject) => {
            const texture = textureLoader.load(
              "/textures/maps/world-relief-color.jpg",
              () => resolve(texture),
              undefined,
              (error) => reject(error),
            );
          },
        ),
      );
      colorTexture.colorSpace = THREE.SRGBColorSpace;
      colorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const heightImageData = await new Promise<ImageData>((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
          const heightCanvas = document.createElement("canvas");
          heightCanvas.width = image.naturalWidth;
          heightCanvas.height = image.naturalHeight;
          const context = heightCanvas.getContext("2d");

          if (!context) {
            reject(new Error("Height map canvas context is unavailable."));
            return;
          }

          context.drawImage(image, 0, 0);
          resolve(
            context.getImageData(0, 0, heightCanvas.width, heightCanvas.height),
          );
        };
        image.onerror = () => {
          reject(new Error("Unable to load world map height texture."));
        };
        image.src = "/textures/maps/world-relief-height.png?v=finer-relief-patches";
      });
      const colorImageData = await new Promise<ImageData>((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
          const colorCanvas = document.createElement("canvas");
          colorCanvas.width = image.naturalWidth;
          colorCanvas.height = image.naturalHeight;
          const context = colorCanvas.getContext("2d");

          if (!context) {
            reject(new Error("Color map canvas context is unavailable."));
            return;
          }

          context.drawImage(image, 0, 0);
          resolve(
            context.getImageData(0, 0, colorCanvas.width, colorCanvas.height),
          );
        };
        image.onerror = () => {
          reject(new Error("Unable to load world map color texture."));
        };
        image.src = "/textures/maps/world-relief-color.jpg";
      });

      const mapRadiusX = 1.9;
      const mapRadiusZ = 0.88;
      const reliefHeight = 0.21;
      const mapSegmentsX = 192;
      const mapSegmentsZ = 96;
      const positions: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];
      const sampleColor = (u: number, v: number) => {
        const x = Math.max(
          0,
          Math.min(
            colorImageData.width - 1,
            Math.round(u * (colorImageData.width - 1)),
          ),
        );
        const y = Math.max(
          0,
          Math.min(
            colorImageData.height - 1,
            Math.round(v * (colorImageData.height - 1)),
          ),
        );
        const index = (y * colorImageData.width + x) * 4;

        return {
          b: colorImageData.data[index + 2],
          g: colorImageData.data[index + 1],
          r: colorImageData.data[index],
        };
      };
      const rgbToHsl = ({ b, g, r }: { b: number; g: number; r: number }) => {
        const red = r / 255;
        const green = g / 255;
        const blue = b / 255;
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const lightness = (max + min) / 2;
        let hue = 0;
        let saturation = 0;

        if (max !== min) {
          const delta = max - min;
          saturation =
            lightness > 0.5
              ? delta / (2 - max - min)
              : delta / (max + min);

          if (max === red) {
            hue = (green - blue) / delta + (green < blue ? 6 : 0);
          } else if (max === green) {
            hue = (blue - red) / delta + 2;
          } else {
            hue = (red - green) / delta + 4;
          }

          hue *= 60;
        }

        return { hue, lightness, saturation };
      };
      const classifyMapColor = (u: number, v: number) => {
        const color = sampleColor(u, v);
        const { hue, lightness, saturation } = rgbToHsl(color);
        const blue =
          color.b > 88 &&
          hue >= 165 &&
          hue <= 255 &&
          color.b >= color.r - 4 &&
          color.b >= color.g - 16 &&
          saturation >= 0.16;
        const white = lightness >= 0.72 && saturation <= 0.3;
        const green =
          hue >= 58 &&
          hue <= 174 &&
          color.g >= color.b - 30 &&
          lightness >= 0.28;
        const ochre =
          hue >= 20 &&
          hue < 82 &&
          color.r >= color.b - 4 &&
          color.g >= color.b - 8 &&
          lightness >= 0.3;
        const neutralLand =
          lightness >= 0.4 && saturation <= 0.32 && color.b < 210;

        return {
          blue,
          raised: !blue && (green || ochre || white || neutralLand),
        };
      };
      const landMaskCanvas = document.createElement("canvas");
      landMaskCanvas.width = 1024;
      landMaskCanvas.height = 512;
      const landMaskContext = landMaskCanvas.getContext("2d");

      if (!landMaskContext) {
        throw new Error("Land mask canvas context is unavailable.");
      }

      const landMaskImage = landMaskContext.createImageData(
        landMaskCanvas.width,
        landMaskCanvas.height,
      );

      for (let y = 0; y < landMaskCanvas.height; y += 1) {
        for (let x = 0; x < landMaskCanvas.width; x += 1) {
          const u = x / (landMaskCanvas.width - 1);
          const v = y / (landMaskCanvas.height - 1);
          const value = classifyMapColor(u, v).raised ? 255 : 0;
          const index = (y * landMaskCanvas.width + x) * 4;

          landMaskImage.data[index] = value;
          landMaskImage.data[index + 1] = value;
          landMaskImage.data[index + 2] = value;
          landMaskImage.data[index + 3] = 255;
        }
      }

      landMaskContext.putImageData(landMaskImage, 0, 0);
      const landMaskTexture = trackDisposable(
        new THREE.CanvasTexture(landMaskCanvas),
      );
      landMaskTexture.minFilter = THREE.LinearFilter;
      landMaskTexture.magFilter = THREE.LinearFilter;
      landMaskTexture.needsUpdate = true;

      const sampleRelief = (u: number, v: number) => {
        const x = Math.max(
          0,
          Math.min(
            heightImageData.width - 1,
            Math.round(u * (heightImageData.width - 1)),
          ),
        );
        const y = Math.max(
          0,
          Math.min(
            heightImageData.height - 1,
            Math.round(v * (heightImageData.height - 1)),
          ),
        );
        const index = (y * heightImageData.width + x) * 4;

        return heightImageData.data[index] / 255;
      };
      const reliefToHeight = (relief: number) =>
        Math.pow(relief, 1.12) * reliefHeight;
      const projectPoint = (u: number, v: number) => {
        const latitude = 1 - v * 2;
        const longitude = u * 2 - 1;
        const widthAtLatitude = Math.sqrt(Math.max(0.08, 1 - latitude * latitude));

        return {
          x: longitude * mapRadiusX * widthAtLatitude,
          z: latitude * mapRadiusZ,
        };
      };

      for (let zIndex = 0; zIndex <= mapSegmentsZ; zIndex += 1) {
        const v = zIndex / mapSegmentsZ;

        for (let xIndex = 0; xIndex <= mapSegmentsX; xIndex += 1) {
          const u = xIndex / mapSegmentsX;
          const point = projectPoint(u, v);
          const relief = sampleRelief(u, v);
          const height = relief > 0 ? reliefToHeight(relief) : 0;

          positions.push(point.x, height, point.z);
          uvs.push(u, v);
        }
      }

      const rowStride = mapSegmentsX + 1;

      for (let zIndex = 0; zIndex < mapSegmentsZ; zIndex += 1) {
        for (let xIndex = 0; xIndex < mapSegmentsX; xIndex += 1) {
          const a = zIndex * rowStride + xIndex;
          const b = a + 1;
          const c = a + rowStride;
          const d = c + 1;

          indices.push(a, c, b, b, c, d);
        }
      }

      const mapGeometry = trackDisposable(new THREE.BufferGeometry());
      mapGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      mapGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      mapGeometry.setIndex(indices);
      mapGeometry.computeVertexNormals();

      const flatPositions = positions.map((value, index) =>
        index % 3 === 1 ? 0 : value,
      );
      const flatGeometry = trackDisposable(new THREE.BufferGeometry());
      flatGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(flatPositions, 3),
      );
      flatGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      flatGeometry.setIndex(indices);
      flatGeometry.computeVertexNormals();

      const mapMaterial = trackDisposable(
        new THREE.MeshStandardMaterial({
          alphaMap: landMaskTexture,
          alphaTest: 0.45,
          color: "#d8e6e9",
          emissive: "#061923",
          emissiveIntensity: 0.08,
          map: colorTexture,
          metalness: 0.06,
          roughness: 0.58,
          side: THREE.DoubleSide,
        }),
      );
      const flatMaterial = trackDisposable(
        new THREE.MeshStandardMaterial({
          color: "#d8e6e9",
          emissive: "#061923",
          emissiveIntensity: 0.08,
          map: colorTexture,
          metalness: 0.06,
          roughness: 0.58,
          side: THREE.DoubleSide,
        }),
      );
      const flatMesh = new THREE.Mesh(flatGeometry, flatMaterial);
      flatMesh.renderOrder = 2;
      modelGroup.add(flatMesh);

      const mapMesh = new THREE.Mesh(mapGeometry, mapMaterial);
      mapMesh.renderOrder = 3;
      modelGroup.add(mapMesh);

      const baseGeometry = trackDisposable(
        new THREE.CylinderGeometry(1, 1, 0.12, 192, 1),
      );
      baseGeometry.scale(mapRadiusX * 1.025, 1, mapRadiusZ * 1.07);
      const baseMaterial = trackDisposable(
        new THREE.MeshStandardMaterial({
          color: "#061019",
          emissive: "#071c28",
          emissiveIntensity: 0.32,
          metalness: 0.2,
          roughness: 0.48,
        }),
      );
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.position.y = -0.082;
      baseMesh.renderOrder = 1;
      modelGroup.add(baseMesh);

      const rimGeometry = trackDisposable(new THREE.RingGeometry(0.985, 1, 224));
      rimGeometry.scale(mapRadiusX * 1.028, mapRadiusZ * 1.072, 1);
      rimGeometry.rotateX(-Math.PI / 2);
      const rimMaterial = trackDisposable(
        new THREE.MeshBasicMaterial({
          blending: THREE.AdditiveBlending,
          color: "#5edaff",
          depthWrite: false,
          opacity: 0.24,
          side: THREE.DoubleSide,
          transparent: true,
        }),
      );
      const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
      rimMesh.position.y = 0.012;
      rimMesh.renderOrder = 4;
      modelGroup.add(rimMesh);

      const resize = () => {
        const bounds = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.floor(bounds.width));
        const height = Math.max(1, Math.floor(bounds.height));
        const aspect = width / height;
        const viewSize = 3.35;

        camera.left = (-viewSize * aspect) / 2;
        camera.right = (viewSize * aspect) / 2;
        camera.top = viewSize / 2;
        camera.bottom = -viewSize / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      const onPointerDown = (event: PointerEvent) => {
        canvas.setPointerCapture(event.pointerId);
        dragState = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      };
      const onPointerMove = (event: PointerEvent) => {
        if (!dragState || dragState.pointerId !== event.pointerId) {
          return;
        }

        const deltaX = event.clientX - dragState.x;
        const deltaY = event.clientY - dragState.y;
        dragState = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
        modelGroup.rotation.y += deltaX * 0.008;
        modelGroup.rotation.x = Math.max(
          -0.92,
          Math.min(0.58, modelGroup.rotation.x + deltaY * 0.006),
        );
      };
      const onPointerUp = (event: PointerEvent) => {
        if (dragState?.pointerId === event.pointerId) {
          dragState = null;
        }
      };
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const nextZoom = camera.zoom * (event.deltaY > 0 ? 0.92 : 1.08);
        camera.zoom = Math.max(0.78, Math.min(2.3, nextZoom));
        camera.updateProjectionMatrix();
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });

      const render = () => {
        if (disposed) {
          return;
        }

        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(render);
      };

      render();

      return () => {
        resizeObserver?.disconnect();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("wheel", onWheel);
        renderer.dispose();
        disposableResources.forEach((resource) => resource.dispose());
      };
    };

    let disposeScene: (() => void) | undefined;

    buildScene()
      .then((dispose) => {
        disposeScene = dispose;
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      disposeScene?.();
    };
  }, []);

  return (
    <main className="world-map-lab" aria-label="World map model review workspace">
      <canvas ref={canvasRef} className="world-map-lab__canvas" />
    </main>
  );
}

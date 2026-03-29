"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { DragRotator } from "./DragRotator";
import { SingleCube } from "./SingleCube";
import { useCentralizedPhysics } from "./hooks/useCentralizedPhysics";
import { useCubeResources } from "./hooks/useCubeResources";
import { useGalleryTextures, GALLERY_IMAGE_COUNT } from "./hooks/useGalleryTextures";

const RubiksGrid: React.FC = () => {
  const spacing = 2.25;
  const gridSize = 1;

  const intensityRef = useRef(0);
  const textures = useCubeResources();
  const galleryTextures = useGalleryTextures();
  const cubesRefs = useRef<THREE.Group[]>([]);

  // --- 1. Grid Generation ---
  // Memoize positions to avoid recalculating on every render.
  // Creates a 3x3x3 grid centered at (0,0,0).
  const positions = useMemo(() => {
    const pos: [number, number, number][] = [];
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        for (let z = -gridSize; z <= gridSize; z++) {
          pos.push([x * spacing, y * spacing, z * spacing]);
        }
      }
    }
    return pos;
  }, [spacing]);

  // --- 2. Physics Engine ---
  // Connects the visual cubes (via refs) to the physics logic (position/scale updates).
  const { triggerPulse } = useCentralizedPhysics(
    cubesRefs,
    positions,
    intensityRef
  );

  const handlePulse = React.useCallback(
    (index: number) => {
      triggerPulse(index);
    },
    [triggerPulse]
  );

  return (
    <DragRotator intensityRef={intensityRef}>
      {positions.map((pos, i) => {
        // Derive grid coordinates from index (loop order: x → y → z, each -1..1)
        const gx = Math.floor(i / 9) - 1;
        const gy = Math.floor((i % 9) / 3) - 1;
        const gz = (i % 3) - 1;

        // Three.js BoxGeometry material slots: 0=+x, 1=-x, 2=+y, 3=-y, 4=+z, 5=-z
        const isOuter = [
          gx === 1,   // +x
          gx === -1,  // -x
          gy === 1,   // +y
          gy === -1,  // -y
          gz === 1,   // +z
          gz === -1,  // -z
        ];

        const faceTextures = [0, 1, 2, 3, 4, 5].map((faceIndex) =>
          isOuter[faceIndex]
            ? galleryTextures[(i * 6 + faceIndex) % GALLERY_IMAGE_COUNT]
            : null
        );

        return (
          <SingleCube
            key={`${pos[0]}-${pos[1]}-${pos[2]}`}
            textures={textures}
            faceTextures={faceTextures}
            onPulse={() => handlePulse(i)}
            cubeIndex={i}
            ref={(el) => {
              if (el) cubesRefs.current[i] = el;
            }}
          />
        );
      })}
    </DragRotator>
  );
};

export default React.memo(RubiksGrid);

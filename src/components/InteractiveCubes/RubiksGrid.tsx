"use client";

import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DragRotator } from "./DragRotator";
import { FaceExpansionOverlay } from "./FaceExpansionOverlay";
import { SingleCube } from "./SingleCube";
import { useCentralizedPhysics } from "./hooks/useCentralizedPhysics";
import { useCubeResources } from "./hooks/useCubeResources";
import { useGalleryTextures, GALLERY_IMAGE_COUNT } from "./hooks/useGalleryTextures";

export interface RubiksGridHandle {
  dismissAll: () => void;
}

interface ExpansionItem {
  id: number;
  faceIndex: number;
  texture: THREE.Texture;
  cubePosition: [number, number, number];
  dismissed: boolean;
}

const RubiksGridComponent = forwardRef<RubiksGridHandle, object>((_, ref) => {
  const spacing = 2.0;
  const gridSize = 1;

  const intensityRef = useRef(0);
  const textures = useCubeResources();
  const galleryTextures = useGalleryTextures();
  const cubesRefs = useRef<THREE.Group[]>([]);
  const [expansions, setExpansions] = useState<ExpansionItem[]>([]);
  const idCounter = useRef(0);

  // --- 1. Grid Generation ---
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
  const { triggerPulse } = useCentralizedPhysics(
    cubesRefs,
    positions,
    intensityRef
  );

  const handlePulse = useCallback(
    (index: number) => { triggerPulse(index); },
    [triggerPulse]
  );

  // Dismiss all open overlays (used when clicking outside the grid).
  const dismissAll = useCallback(() => {
    setExpansions(prev =>
      prev.length === 0 ? prev : prev.map(e => ({ ...e, dismissed: true }))
    );
  }, []);

  useImperativeHandle(ref, () => ({ dismissAll }), [dismissAll]);

  // Fired when a cube face with an image is clicked.
  // Marks any existing expansion as dismissed and opens the new face.
  const handleFaceClick = useCallback(
    (cubeIndex: number, faceIndex: number) => {
      const i = cubeIndex;
      const gx = Math.floor(i / 9) - 1;
      const gy = Math.floor((i % 9) / 3) - 1;
      const gz = (i % 3) - 1;
      const isOuter = [gx === 1, gx === -1, gy === 1, gy === -1, gz === 1, gz === -1];
      if (!isOuter[faceIndex]) return;
      const texture = galleryTextures[(i * 6 + faceIndex) % GALLERY_IMAGE_COUNT];
      const id = ++idCounter.current;
      setExpansions(prev => [
        ...prev.map(e => ({ ...e, dismissed: true })),
        { id, faceIndex, texture, cubePosition: positions[i], dismissed: false },
      ]);
    },
    [positions, galleryTextures]
  );

  const handleDismiss = useCallback((id: number) => {
    setExpansions(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    // Drag rotation is always enabled — never disabled by expansion state.
    <DragRotator intensityRef={intensityRef}>
      {positions.map((pos, i) => {
        const gx = Math.floor(i / 9) - 1;
        const gy = Math.floor((i % 9) / 3) - 1;
        const gz = (i % 3) - 1;

        const isOuter = [
          gx === 1,
          gx === -1,
          gy === 1,
          gy === -1,
          gz === 1,
          gz === -1,
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
            onFaceClick={handleFaceClick}
            ref={(el) => {
              if (el) {
                cubesRefs.current[i] = el;
                el.position.set(pos[0], pos[1], pos[2]);
              }
            }}
          />
        );
      })}

      {expansions.map(item => (
        <FaceExpansionOverlay
          key={item.id}
          faceIndex={item.faceIndex}
          texture={item.texture}
          cubePosition={item.cubePosition}
          dismissed={item.dismissed}
          onDismiss={() => handleDismiss(item.id)}
        />
      ))}
    </DragRotator>
  );
});

RubiksGridComponent.displayName = "RubiksGrid";

export default React.memo(RubiksGridComponent);

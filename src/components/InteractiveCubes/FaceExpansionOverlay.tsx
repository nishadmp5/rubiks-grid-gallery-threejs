"use client";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { FACE_IMAGE_SCALE } from "./config/constants";

// Single cube face = 2 (BoxGeometry 2×2×2)
// Full 3×3 rubik's face = (2.0 spacing × 2 + 2 half-widths) = 6.0
const CUBE_FACE_SIZE = 2;
const FULL_FACE_SIZE = 6.0;
// Slightly outside the outermost face edge (3.0 + epsilon) to avoid z-fighting
const FACE_NORMAL_OFFSET = 3.01;

// Per face-index: the rotation to orient a PlaneGeometry (default normal = +Z)
// to face outward, plus which component index (0=x,1=y,2=z) is the normal axis.
const FACE_CFG = [
  { rotation: [0,  Math.PI / 2, 0] as [number, number, number], axis: 0, sign:  1 }, // 0: +X
  { rotation: [0, -Math.PI / 2, 0] as [number, number, number], axis: 0, sign: -1 }, // 1: -X
  { rotation: [-Math.PI / 2, 0, 0] as [number, number, number], axis: 1, sign:  1 }, // 2: +Y
  { rotation: [ Math.PI / 2, 0, 0] as [number, number, number], axis: 1, sign: -1 }, // 3: -Y
  { rotation: [0, 0, 0]            as [number, number, number], axis: 2, sign:  1 }, // 4: +Z
  { rotation: [0, Math.PI, 0]      as [number, number, number], axis: 2, sign: -1 }, // 5: -Z
] as const;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface FaceExpansionOverlayProps {
  faceIndex: number;
  texture: THREE.Texture;
  cubePosition: [number, number, number];
  dismissed: boolean;
  onDismiss: () => void;
}

export const FaceExpansionOverlay: React.FC<FaceExpansionOverlayProps> = ({
  faceIndex,
  texture,
  cubePosition,
  dismissed,
  onDismiss,
}) => {
  const meshRef     = useRef<THREE.Mesh>(null);
  const matRef      = useRef<THREE.MeshBasicMaterial>(null);
  const progressRef = useRef(0);
  const closingRef  = useRef(false);
  const doneRef     = useRef(false);

  const cfg         = FACE_CFG[faceIndex];
  const normalValue = FACE_NORMAL_OFFSET * cfg.sign;

  // The face texture has 5% padding baked in (image occupies UV [0.025, 0.975]).
  // Clone and remap so the overlay shows the full image with no padding.
  const overlayTexture = useMemo(() => {
    const clone = texture.clone();
    const offset = (1 - FACE_IMAGE_SCALE) / 2;
    clone.repeat.set(FACE_IMAGE_SCALE, FACE_IMAGE_SCALE);
    clone.offset.set(offset, offset);
    clone.needsUpdate = true;
    return clone;
  }, [texture]);

  // Start position = the clicked cube face center (in DragRotator local space)
  const startPos = useMemo(() => {
    const v = new THREE.Vector3(...cubePosition);
    v.setComponent(cfg.axis, normalValue);
    return v;
  // Positions are fixed for the lifetime of this overlay instance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // End position = center of the full rubik's face
  const endPos = useMemo(() => {
    const v = new THREE.Vector3(0, 0, 0);
    v.setComponent(cfg.axis, normalValue);
    return v;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tempPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_state, delta) => {
    if (doneRef.current) return;
    const mesh = meshRef.current;
    const mat  = matRef.current;
    if (!mesh || !mat) return;

    // React to external dismissed signal (e.g. new face clicked, outside click)
    if (dismissed && !closingRef.current) {
      closingRef.current = true;
    }

    if (closingRef.current) {
      progressRef.current = Math.max(progressRef.current - delta * 4, 0);
      if (progressRef.current === 0) {
        doneRef.current = true;
        onDismiss();
        return;
      }
    } else {
      progressRef.current = Math.min(progressRef.current + delta * 3, 1);
    }

    const t = easeOut(progressRef.current);

    tempPos.lerpVectors(startPos, endPos, t);
    mesh.position.copy(tempPos);
    mesh.scale.setScalar(THREE.MathUtils.lerp(CUBE_FACE_SIZE, FULL_FACE_SIZE, t));
    mat.opacity = t;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    closingRef.current = true;
  };

  return (
    <mesh
      ref={meshRef}
      rotation={cfg.rotation}
      renderOrder={10}
      onClick={handleClick}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        map={overlayTexture}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

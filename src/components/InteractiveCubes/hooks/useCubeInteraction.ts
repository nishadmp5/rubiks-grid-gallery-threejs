import { useState, useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";

import { getInitialFaces } from "../config/patterns";

export const useCubeInteraction = (
  onPulse: () => void,
  cubeIndex: number,
  onFaceClick?: (cubeIndex: number, faceIndex: number) => void
) => {
  /**
   * State to track which face of the cube is currently being hovered.
   * Returns the material index (0-5) or null if not hovered.
   */
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  /**
   * State to track which faces have been clicked/activated.
   * Initialized deterministically based on the cube's index.
   * true = filled/active, false = empty/border-only.
   */
  const [clickedFaces, setClickedFaces] = useState<boolean[]>(() =>
    getInitialFaces(cubeIndex)
  );

  // --- Handlers ---

  /**
   * Handles pointer movement over the cube.
   * Updates the hoveredFace state based on the intersected face's material index.
   * Only interacts with the outer visual mesh (renderOrder 1).
   */
  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.object.renderOrder === 1 && e.face) {
      setHoveredFace(e.face.materialIndex);
    }
  }, []);

  /**
   * Handles pointer leaving the cube.
   * Resets the hoveredFace state to null.
   */
  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredFace(null);
  }, []);

  /**
   * Handles click events on the cube.
   * 1. Triggers the "pulse" physics animation via the callback.
   * 2. Toggles the clicked state of the specific face.
   */
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();

      // Trigger the "squash" animation effect
      onPulse();

      // Toggle the visual state of the clicked face
      if (e.object.renderOrder === 1 && e.face) {
        const index = e.face.materialIndex;
        setClickedFaces((prev) => {
          const newState = [...prev];
          newState[index] = !newState[index];
          return newState;
        });
        onFaceClick?.(cubeIndex, index);
      }
    },
    [onPulse, cubeIndex, onFaceClick]
  );

  return {
    hoveredFace,
    clickedFaces,
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerOut: handlePointerOut,
      onClick: handleClick,
    },
  };
};

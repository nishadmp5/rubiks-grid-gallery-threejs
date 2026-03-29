import { useRef } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { CONFIG } from "../config/constants";

export const useDragRotation = (intensityRef: React.RefObject<number>) => {
  const groupRef = useRef<THREE.Group>(null!);
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  // --- Event Handlers ---

  /**
   * Starts the drag interaction.
   * Captures pointer to ensure smooth dragging even if mouse leaves the element.
   */
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    previousPointer.current = { x: e.pointer.x, y: e.pointer.y };
  };

  /**
   * Ends the drag interaction.
   * Releases pointer capture.
   */
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  /**
   * Handles pointer movement during drag.
   * Calculates velocity based on pointer delta.
   */
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging.current) {
      e.stopPropagation();

      const deltaX = e.pointer.x - previousPointer.current.x;
      const deltaY = e.pointer.y - previousPointer.current.y;

      velocity.current.x += deltaX * CONFIG.INPUT_RESPONSIVENESS;
      velocity.current.y += deltaY * CONFIG.INPUT_RESPONSIVENESS;

      previousPointer.current = { x: e.pointer.x, y: e.pointer.y };
    }
  };

  // --- Animation Loop ---
  // Handles rotation physics, inertia, and auto-reset.
  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // 1. Apply Velocity (Inertia)
    // Continues rotation based on last known velocity
    groupRef.current.rotation.y +=
      velocity.current.x * delta * CONFIG.DEFAULT_ROTATION_SENSITIVITY;
    groupRef.current.rotation.x -=
      velocity.current.y * delta * CONFIG.DEFAULT_ROTATION_SENSITIVITY;

    // 2. Friction
    // Gradually reduces velocity to simulate friction
    velocity.current.x *= 0.95;
    velocity.current.y *= 0.95;

    // 3. Intensity Calculation
    // Calculates rotational speed to influence the "expansion" effect in the physics engine
    const speed = Math.hypot(velocity.current.x, velocity.current.y);
    intensityRef.current = THREE.MathUtils.lerp(
      intensityRef.current,
      speed * 20,
      0.1
    );
  });

  return {
    groupRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onPointerMove: handlePointerMove,
    },
  };
};

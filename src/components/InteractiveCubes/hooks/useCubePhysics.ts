import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../config/constants";

interface UseCubePhysicsProps {
  groupRef: React.RefObject<THREE.Group>;
  position: [number, number, number];
  intensityRef: React.RefObject<number>;
}

export const useCubePhysics = ({ groupRef, position, intensityRef }: UseCubePhysicsProps) => {
  const animationState = useRef({ startTime: -1, started: false });
  
  // Optimization: Pre-allocate reusable vector to avoid GC in useFrame
  const tempWorldPos = useMemo(() => new THREE.Vector3(), []);
  const currentPos = useMemo(() => new THREE.Vector3(), []);

  // Check if this is the center pivot cube
  const isCenter = useMemo(() => {
    return Math.abs(position[0]) < 0.1 && Math.abs(position[1]) < 0.1 && Math.abs(position[2]) < 0.1;
  }, [position]);

  // Pre-calculate immutable vectors
  const { targetPos, outwardVector, distanceFromCenter } = useMemo(() => {
    const target = new THREE.Vector3(...position);
    const dist = target.length();
    const dir = target.clone().normalize();
    if (dir.lengthSq() < 0.001) dir.set(0, 1, 0);
    return { targetPos: target, outwardVector: dir, distanceFromCenter: dist };
  }, [position]);

  // Initial placement
  useLayoutEffect(() => {
    if (groupRef.current) groupRef.current.position.copy(targetPos);
  }, [targetPos, groupRef]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Initialize animation timer
    if (!animationState.current.started) {
      animationState.current.startTime = state.clock.elapsedTime;
      animationState.current.started = true;
    }

    const elapsed = state.clock.elapsedTime - animationState.current.startTime;

    // Reset current calculation vector to the base target
    currentPos.copy(targetPos);

    if (!isCenter) {
      // --- A. DRAG EXPANSION ---
      const dragFactor = Math.min(intensityRef.current, 5);
      const expansionAmount = Math.min(dragFactor * CONFIG.DRAG_SENSITIVITY, CONFIG.DRAG_MAX_EXPANSION);

      if (expansionAmount > 0.01) {
        // Optimization: Use multiplyScalar and add, avoid cloning if possible 
        // (Here we clone outwardVector to not mutate the reference)
        currentPos.addScaledVector(outwardVector, expansionAmount);
      }

      // --- B. HOVER PROXIMITY ---
      let amplitude = CONFIG.IDLE_AMPLITUDE;
      groupRef.current.getWorldPosition(tempWorldPos);
      
      const distToRay = state.raycaster.ray.distanceToPoint(tempWorldPos);
      if (distToRay < CONFIG.HOVER_INFLUENCE_RADIUS) {
        const proximity = 1 - (distToRay / CONFIG.HOVER_INFLUENCE_RADIUS);
        const boost = proximity * proximity * CONFIG.HOVER_BOOST_INTENSITY;
        amplitude += boost;
      }

      // --- C. IDLE WAVE ---
      const idleTime = (state.clock.elapsedTime * CONFIG.IDLE_SPEED) + position[0];
      const idleOffset = Math.abs(Math.sin(idleTime)) * amplitude;
      currentPos.addScaledVector(outwardVector, idleOffset);
    }

    // --- D. INTRO WAVE ---
    const introTime = elapsed - (distanceFromCenter * CONFIG.INTRO_DELAY_FACTOR);
    const introRad = introTime * CONFIG.INTRO_SPEED;

    if (introRad > 0 && introRad < Math.PI) {
      const introPulse = Math.sin(introRad) * CONFIG.INTRO_AMPLITUDE;
      currentPos.addScaledVector(outwardVector, introPulse);
    }

    // Apply Soft Lerp
    groupRef.current.position.lerp(currentPos, 0.1);
  });
};
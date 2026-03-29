import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../config/constants";
import { useRef, useCallback } from "react";

export const useCentralizedPhysics = (
  cubesRefs: React.RefObject<THREE.Group[]>,
  positions: [number, number, number][],
  intensityRef: React.RefObject<number>
) => {
  // Reusable vectors
  const tempVec = new THREE.Vector3();
  const tempTarget = new THREE.Vector3();
  const tempOutward = new THREE.Vector3();

  const startTime = useRef<number | null>(null);
  const scalesRef = useRef<number[]>(new Array(positions.length).fill(1));

  const triggerPulse = useCallback((index: number) => {
    scalesRef.current[index] = CONFIG.PULSE_SQUASH_SCALE;
  }, []);

  // ---------------------------------------------------------
  //                   HELPERS (Each Is Simple)
  // ---------------------------------------------------------

  const applyDragForce = (
    vec: THREE.Vector3,
    outward: THREE.Vector3,
    expansion: number
  ) => {
    if (expansion > 0.01) vec.addScaledVector(outward, expansion);
  };


  const applyIdleWave = (
    vec: THREE.Vector3,
    outward: THREE.Vector3,
    x: number,
    amplitude: number,
    state: RootState
  ) => {
    const idleTime = state.clock.elapsedTime * CONFIG.IDLE_SPEED + x;
    const idleOffset = Math.abs(Math.sin(idleTime)) * amplitude;
    vec.addScaledVector(outward, idleOffset);
  };

  const applyIntroRipple = (
    vec: THREE.Vector3,
    outward: THREE.Vector3,
    elapsed: number,
    dist: number
  ) => {
    const introTime = elapsed - dist * CONFIG.INTRO_DELAY_FACTOR;
    const introRad = introTime * CONFIG.INTRO_SPEED;

    if (introRad > 0 && introRad < Math.PI) {
      vec.addScaledVector(outward, Math.sin(introRad) * CONFIG.INTRO_AMPLITUDE);
    }
  };

  const updateScale = (
    group: THREE.Group,
    index: number,
    delta: number
  ) => {
    let current = scalesRef.current[index];

    if (current < 0.999) {
      current = THREE.MathUtils.lerp(
        current,
        1,
        delta * CONFIG.PULSE_RECOVERY_SPEED
      );
      scalesRef.current[index] = current;
      group.scale.setScalar(current);
    } else if (current !== 1) {
      scalesRef.current[index] = 1;
      group.scale.setScalar(1);
    }
  };

  // ---------------------------------------------------------
  //                     MAIN PHYSICS LOOP
  // ---------------------------------------------------------

  useFrame((state, delta) => {
    startTime.current ??= state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;

    const dragFactor = Math.min(intensityRef.current, 5);
    const expansion = Math.min(
      dragFactor * CONFIG.DRAG_SENSITIVITY,
      CONFIG.DRAG_MAX_EXPANSION
    );

    for (let i = 0; i < cubesRefs.current.length; i++) {
      const group = cubesRefs.current[i];
      if (!group) continue;

      const [x, y, z] = positions[i];
      tempTarget.set(x, y, z);

      const isCenter = Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(z) < 0.1;
      const dist = tempTarget.length();

      tempOutward.copy(tempTarget).normalize();
      if (tempOutward.lengthSq() < 0.001) tempOutward.set(0, 1, 0);

      tempVec.set(0, 0, 0);


      applyIntroRipple(tempVec, tempOutward, elapsed, dist);

      tempTarget.add(tempVec);
      group.position.lerp(tempTarget, 0.1);

      updateScale(group, i, delta);
    }
  });

  return { triggerPulse };
};

import React from "react";
import { useDragRotation } from "./hooks/useDragRotation";
import {
  SHARED_PLANE_HIT_GEOMETRY,
  INITIAL_ROTATION,
} from "./config/constants";
import { useThree } from "@react-three/fiber";
import { useMinWidthLayout } from "@/hooks/useMinWidthLayout";

interface DragRotatorProps {
  children: React.ReactNode;
  intensityRef: React.RefObject<number>;
  disabled?: boolean;
}

export const DragRotator = ({ children, intensityRef, disabled = false }: DragRotatorProps) => {
  // Use the custom hook
  const { groupRef, handlers } = useDragRotation(intensityRef);
  const { viewport } = useThree();
  const { isAboveMinWidth: isDesktop } = useMinWidthLayout(1024);

  const parentGroupProps = React.useMemo(
    () => ({
      position: [0, 0, 0] as [number, number, number],
      scale: isDesktop ? viewport.width * 0.035 : viewport.width * 0.075,
    }),
    [isDesktop, viewport]
  );

  const contentGroupProps = React.useMemo(
    () => ({
      rotation: [
        INITIAL_ROTATION.x,
        INITIAL_ROTATION.y,
        INITIAL_ROTATION.z,
      ] as [number, number, number],
    }),
    []
  );

  const planeMeshProps = React.useMemo(
    () => ({
      geometry: SHARED_PLANE_HIT_GEOMETRY,
    }),
    []
  );

  const planeMaterialProps = React.useMemo(
    () => ({
      visible: false,
    }),
    []
  );

  return (
    <group {...parentGroupProps}>
      {/* Hit Plane */}
      {/* Invisible plane to capture pointer events for rotation. */}
      {/* Needs to be large enough to cover the interaction area. */}
      <mesh {...(!disabled ? handlers : {})} {...planeMeshProps}>
        <meshBasicMaterial {...planeMaterialProps} />
      </mesh>

      {/* Content Group */}
      {/* The actual content that gets rotated. */}
      {/* Positioned slightly offset as per design requirements. */}
      <group ref={groupRef} {...contentGroupProps}>
        {children}
      </group>
    </group>
  );
};

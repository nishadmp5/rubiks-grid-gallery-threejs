import React, { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { SHARED_BOX_GEOMETRY } from "./config/constants";
import { useCubeInteraction } from "./hooks/useCubeInteraction";
import { FACE_IDS } from "./config/patterns";


interface SingleCubeProps {
  // Note: Position is handled by parent physics loop
  textures: {
    borderTexture: THREE.CanvasTexture;
    maskTexture: THREE.CanvasTexture;
    gradientTexture: THREE.CanvasTexture;
  };
  faceTextures: (THREE.Texture | null)[];
  onPulse: () => void;
  cubeIndex: number;
}

// Forward Ref is crucial here to give the Parent Physics Engine access to the THREE.Group
// React.memo is used to prevent unnecessary re-renders when parent state changes but props don't.
const SingleCubeComponent = forwardRef<THREE.Group, SingleCubeProps>(
  ({ textures, faceTextures, onPulse, cubeIndex }, ref) => {
    const { handlers } = useCubeInteraction(
      onPulse,
      cubeIndex
    );

    const createInnerMtrlProps = (index: number) => {
      const tex = faceTextures[index];
      return tex
        ? { attach: `material-${index}`, map: tex, side: THREE.FrontSide }
        : { attach: `material-${index}`, color: "#111111", side: THREE.FrontSide };
    };

     const maskMeshProps = useMemo(() => ({
        scale: 0.99,
        geometry: SHARED_BOX_GEOMETRY,
      }), []);

      const innerMeshProps = useMemo(() => ({
        renderOrder: 1,
        geometry: SHARED_BOX_GEOMETRY,
      }), []);
    

    // Memoize mask materials since they never change
    const maskMaterials = useMemo(() => {
        const createMaskMtrlProps = (index: number) => ({
      attach: `material-${index}`,
      alphaMap: textures.maskTexture,
      colorWrite: false,
      depthWrite: true,
      side: THREE.DoubleSide,
    });

      return FACE_IDS.map((id, index) => (
        <meshBasicMaterial key={`mask-${id}`} {...createMaskMtrlProps(index)} />
      ));
    }, []);

    return (
      <group ref={ref}>
        {/* Inner Mask (Occlusion for transparent borders) */}
        {/* This mesh renders first and writes to the depth buffer but not color buffer. */}
        {/* It effectively "hides" the back faces of the transparent outer mesh. */}
        <mesh {...maskMeshProps}>
          {maskMaterials}
        </mesh>

        {/* Outer Visual Mesh */}
        {/* Renders the visible borders and faces. */}
        {/* renderOrder=1 ensures it renders after the mask. */}
        <mesh {...innerMeshProps} {...handlers}>
          {FACE_IDS.map((id, index) => {
            return (
              <meshBasicMaterial key={`face-${id}`} {...createInnerMtrlProps(index)} />
            );
          })}
        </mesh>
      </group>
    );
  }
);

SingleCubeComponent.displayName = "SingleCube";

export const SingleCube = React.memo(SingleCubeComponent);

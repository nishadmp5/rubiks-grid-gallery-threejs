"use client";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useRef } from "react";
import RubiksGrid, { RubiksGridHandle } from "./RubiksGrid";

interface InteractiveCubesSceneProps {
    isInView: boolean;
}

const InteractiveCubesScene: React.FC<InteractiveCubesSceneProps> = ({isInView}) => {
  const rubiksRef = useRef<RubiksGridHandle>(null);

  return (
    <Canvas
      camera={{
        position: [0, 0, 25],
        fov: 30,
      }}
      dpr={[1, 2]}
      gl={{ powerPreference: "high-performance" }}
      frameloop={isInView ? "always" : "never"}
      onPointerMissed={() => rubiksRef.current?.dismissAll()}
    >
      <Suspense fallback={null}>
        <RubiksGrid ref={rubiksRef} />
      </Suspense>
    </Canvas>
  );
};

export default InteractiveCubesScene;

"use client";
import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import RubiksGrid from "./RubiksGrid";

interface InteractiveCubesSceneProps {
    isInView: boolean;
}

const InteractiveCubesScene: React.FC<InteractiveCubesSceneProps> = ({isInView}) => {
  return (
    <Canvas
      camera={{
        position: [0, 0, 25],
        fov: 30,
      }}
      dpr={[1, 2]}
      gl={{ powerPreference: "high-performance" }}
      frameloop={isInView ? "always" : "never"}
    >
      <Suspense fallback={null}>
        <RubiksGrid />
      </Suspense>
    </Canvas>
  );
};

export default InteractiveCubesScene;

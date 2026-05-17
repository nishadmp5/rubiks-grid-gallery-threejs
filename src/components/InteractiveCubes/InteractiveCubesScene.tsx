"use client";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useRef } from "react";
import RubiksGrid, { RubiksGridHandle } from "./RubiksGrid";

interface InteractiveCubesSceneProps {
    isInView: boolean;
}

const InteractiveCubesScene: React.FC<InteractiveCubesSceneProps> = ({isInView}) => {
  const rubiksRef = useRef<RubiksGridHandle>(null);
  const canvasBackground = [
    "radial-gradient(circle at 18% 20%, rgba(58, 86, 173, 0.42) 0%, rgba(58, 86, 173, 0) 42%)",
    "radial-gradient(circle at 82% 12%, rgba(236, 92, 122, 0.28) 0%, rgba(236, 92, 122, 0) 38%)",
    "linear-gradient(155deg, #05070d 0%, #0c1328 46%, #1a243f 100%)",
  ].join(", ");

  return (
    <Canvas
      camera={{
        position: [0, 0, 25],
        fov: 30,
      }}
      dpr={[1, 2]}
      gl={{ powerPreference: "high-performance", alpha: true }}
      style={{ background: canvasBackground }}
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

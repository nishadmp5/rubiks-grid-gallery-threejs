"use client";
import { useInViewIO } from "@/hooks/useInViewIO";
import dynamic from "next/dynamic";
import React from "react";
// Patch THREE.DefaultLoadingManager synchronously — must be imported before any
// dynamic children mount so that no loading events are missed.
import "./loadingState";

const InteractiveCubesScene = dynamic(() => import("./InteractiveCubesScene"), {
  ssr: false,
});

const LoadingScreen = dynamic(() => import("./LoadingScreen"), {
  ssr: false,
});

const InteractiveCubes: React.FC = () => {

   const { triggerRef, isInView } = useInViewIO();

  return (
    <div ref={triggerRef} className="w-full h-full relative">
      <LoadingScreen />
      <InteractiveCubesScene isInView={isInView}/>
    </div>
  );
};

export default InteractiveCubes;

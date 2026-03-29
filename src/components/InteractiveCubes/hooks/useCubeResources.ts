import { useMemo } from "react";
import * as THREE from "three";

export const useCubeResources = () => {
  return useMemo(() => {
    const size = 512;
    const borderThickness = 7.5;
    const innerSize = size - borderThickness * 2;

    /**
     * Helper to draw a square texture with a border.
     * Used for creating the "empty" and "mask" textures.
     */
    const drawSquare = (bgColor: string, rectColor: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = rectColor;
      ctx.fillRect(borderThickness, borderThickness, innerSize, innerSize);
      return new THREE.CanvasTexture(canvas);
    };

    return {
      // Texture for the wireframe/border look
      borderTexture: drawSquare("white", "black"),

      // Alpha mask for transparency (black = transparent, white = opaque)
      maskTexture: drawSquare("black", "white"),

      // Gradient texture for the filled state
      // Generated once here to avoid expensive re-creation in the render loop
      gradientTexture: (() => {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d")!;
        const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
        gradient.addColorStop(0, "#40A3FF");
        gradient.addColorStop(1, "#D72436");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
      })(),
    };
  }, []);
};

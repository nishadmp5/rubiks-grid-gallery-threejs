import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { FACE_IMAGE_SCALE } from "../config/constants";

const IMAGE_PATHS = [
  "/cubic-gallery-images/christian-lue-YelA9YJAPq8-unsplash.jpg",
  "/cubic-gallery-images/dante-candal-Qjt_eQpTeMw-unsplash.jpg",
  "/cubic-gallery-images/de-an-sun-7b42RzQ9Ck4-unsplash.jpg",
  "/cubic-gallery-images/doncoombez-iOuoOnwp_no-unsplash.jpg",
  "/cubic-gallery-images/eduard-pretsi-HC3kZgzI7F0-unsplash.jpg",
  "/cubic-gallery-images/jason-don-XMYFTIEL8_U-unsplash.jpg",
  "/cubic-gallery-images/jon-tyson-IhnV68HufN4-unsplash.jpg",
  "/cubic-gallery-images/karwin-luo-pqmy90uUxuc-unsplash.jpg",
  "/cubic-gallery-images/llxvisuals-eSLJG0y5S4U-unsplash.jpg",
  "/cubic-gallery-images/lorin-both-2ScC2nkYYDk-unsplash.jpg",
  "/cubic-gallery-images/nadine-e-zxidfnbjoTc-unsplash.jpg",
  "/cubic-gallery-images/natalie-kinnear-O_cB7v_jT7k-unsplash.jpg",
  "/cubic-gallery-images/ngoc-nguyen-phuong-r9yDB4Rk4vE-unsplash.jpg",
  "/cubic-gallery-images/opentab-gexDVNEWdJM-unsplash.jpg",
  "/cubic-gallery-images/praise-judah-P4BYzznXED8-unsplash.jpg",
  "/cubic-gallery-images/severin-demchuk-jllQYsBvFnA-unsplash.jpg",
];

export const GALLERY_IMAGE_COUNT = IMAGE_PATHS.length;

function applyCoverTransform(texture: THREE.Texture) {
  // TextureLoader may store HTMLImageElement or ImageBitmap depending on browser/version
  const img = texture.image as HTMLImageElement | ImageBitmap;
  const imgW: number = (img as HTMLImageElement).naturalWidth ?? (img as ImageBitmap).width;
  const imgH: number = (img as HTMLImageElement).naturalHeight ?? (img as ImageBitmap).height;

  if (!imgW || !imgH) return;

  const aspect = imgW / imgH;

  const CANVAS_SIZE = 512;
  const padding = ((1 - FACE_IMAGE_SCALE) / 2) * CANVAS_SIZE;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;

  // Fill background with the cube's base color
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Compute cover crop: largest square region centered in the source image
  let srcX: number, srcY: number, srcSize: number;
  if (aspect > 1) {
    // Landscape: crop sides
    srcSize = imgH;
    srcX = (imgW - srcSize) / 2;
    srcY = 0;
  } else if (aspect < 1) {
    // Portrait: crop top/bottom
    srcSize = imgW;
    srcX = 0;
    srcY = (imgH - srcSize) / 2;
  } else {
    // Square
    srcSize = imgW;
    srcX = 0;
    srcY = 0;
  }

  // Draw image at 95% size, centered
  ctx.drawImage(
    img as CanvasImageSource,
    srcX, srcY, srcSize, srcSize,
    padding, padding, CANVAS_SIZE * FACE_IMAGE_SCALE, CANVAS_SIZE * FACE_IMAGE_SCALE
  );

  texture.image = canvas;
  texture.needsUpdate = true;
}

export const useGalleryTextures = (): THREE.Texture[] => {
  const textures = useLoader(THREE.TextureLoader, IMAGE_PATHS);

  useMemo(() => {
    (textures as THREE.Texture[]).forEach(applyCoverTransform);
  }, [textures]);

  return textures as THREE.Texture[];
};

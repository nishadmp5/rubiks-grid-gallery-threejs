import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

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
  const img = texture.image as HTMLImageElement;
  const aspect = img.naturalWidth / img.naturalHeight;
  if (aspect > 1) {
    // Landscape: shrink U range to crop horizontal excess
    texture.repeat.set(1 / aspect, 1);
    texture.offset.set((1 - 1 / aspect) / 2, 0);
  } else if (aspect < 1) {
    // Portrait: shrink V range to crop vertical excess
    texture.repeat.set(1, aspect);
    texture.offset.set(0, (1 - aspect) / 2);
  }
  texture.needsUpdate = true;
}

export const useGalleryTextures = (): THREE.Texture[] => {
  const textures = useLoader(THREE.TextureLoader, IMAGE_PATHS);

  useMemo(() => {
    (textures as THREE.Texture[]).forEach(applyCoverTransform);
  }, [textures]);

  return textures as THREE.Texture[];
};

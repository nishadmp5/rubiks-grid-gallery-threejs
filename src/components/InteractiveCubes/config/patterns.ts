/**
 * Deterministic pattern generator for cube faces.
 * Ensures that the same faces are filled every time the page loads.
 */

// A simple deterministic pseudo-random number generator
export const FACE_IDS = ["front", "back", "left", "right", "top", "bottom"] as const;


const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const getInitialFaces = (cubeIndex: number): boolean[] => {
  // Use the cube index as a seed to ensure consistency
  // We generate 6 booleans for the 6 faces
  return FACE_IDS.map((_, faceIndex) => {
      // Create a unique seed for each face of each cube
      const seed = cubeIndex * 12 + faceIndex;
      const randomValue = seededRandom(seed);

      // ~20% chance for a face to be filled
      return randomValue < 0.15;
    });
};

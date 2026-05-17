import * as THREE from "three";

export const CONFIG = {
  // IDLE FLOAT (Breathing when still)
  IDLE_AMPLITUDE: 0.2,
  IDLE_SPEED: 0.5,

  // HOVER INTERACTION
  HOVER_INFLUENCE_RADIUS: 4,
  HOVER_BOOST_INTENSITY: 1.25,

  // DRAG FLOAT
  DRAG_SENSITIVITY: 1.5,
  DRAG_MAX_EXPANSION: 0.75,

  // ROTATION PHYSICS
  DEFAULT_ROTATION_SENSITIVITY: 10,
  INPUT_RESPONSIVENESS: 2,

  // PULSE (Click Feedback)
  PULSE_SQUASH_SCALE: 0.95,
  PULSE_RECOVERY_SPEED: 10,

  // INTRO WAVE (Staggered entrance)
  INTRO_DELAY_FACTOR: 0.12,
  INTRO_SPEED: 4,
  INTRO_AMPLITUDE: 0.35,

  // GRID DISPLAY SIZE
  // Scale of the entire Rubiks grid relative to viewport width.
  // Increase to make the grid larger on screen.
  GRID_SCALE_DESKTOP: 0.03,
  GRID_SCALE_MOBILE: 0.075,
};

// FACE IMAGE PADDING
// Fraction of each cube face occupied by the image (0–1).
// 1.0 = image fills the entire face, 0.9 = 10% padding around the image.
export const FACE_IMAGE_SCALE = 0.95;
export const INITIAL_ROTATION = new THREE.Euler(0.5, 0.8, -0.1);
// Optimization: Singletons for Geometry
export const SHARED_BOX_GEOMETRY = new THREE.BoxGeometry(2, 2, 2);
export const SHARED_PLANE_HIT_GEOMETRY = new THREE.PlaneGeometry(15, 15);

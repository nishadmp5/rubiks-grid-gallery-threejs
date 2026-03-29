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
  
  // INTRO ANIMATION (Wave Pulse)
  INTRO_AMPLITUDE: 0.8,
  INTRO_SPEED: 4,
  INTRO_DELAY_FACTOR: 0.2,

  // ROTATION PHYSICS
  DEFAULT_ROTATION_SENSITIVITY: 10, 
  INPUT_RESPONSIVENESS: 2,

  // AUTO-RESET (New)
  RESET_DELAY: 0.05,       // Seconds to wait before resetting
  RESET_LERP_FACTOR: 0.02, // How fast it smooths back (Lower = Slower/Smoother)

  // PULSE (Click Feedback)
  PULSE_SQUASH_SCALE: 0.95,
  PULSE_RECOVERY_SPEED: 10
};
export const INITIAL_ROTATION = new THREE.Euler(0.5, 0.8, -0.1);
// Optimization: Singletons for Geometry
export const SHARED_BOX_GEOMETRY = new THREE.BoxGeometry(2, 2, 2);
export const SHARED_PLANE_HIT_GEOMETRY = new THREE.PlaneGeometry(15, 15);
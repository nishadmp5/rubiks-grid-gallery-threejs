/**
 * Patches THREE.DefaultLoadingManager once at module-evaluation time so that
 * progress events are captured regardless of when consumers subscribe.
 *
 * This module is imported synchronously by InteractiveCubes.tsx (the non-dynamic
 * parent), which guarantees the patch is in place before any dynamic child
 * components mount and start loading textures.
 */
import * as THREE from "three";

type LoadingListener = (progress: number, done: boolean) => void;

const listeners = new Set<LoadingListener>();
let currentProgress = 0;
let isDone = false;

const manager = THREE.DefaultLoadingManager;
const _prevOnProgress = manager.onProgress;
const _prevOnLoad = manager.onLoad;

manager.onProgress = (url: string, loaded: number, total: number) => {
  currentProgress = Math.round((loaded / total) * 100);
  isDone = false;
  listeners.forEach((l) => l(currentProgress, false));
  _prevOnProgress?.(url, loaded, total);
};

manager.onLoad = () => {
  currentProgress = 100;
  isDone = true;
  listeners.forEach((l) => l(100, true));
  _prevOnLoad?.();
};

/** Subscribe to loading progress. Immediately invoked with current state. */
export function subscribeToLoading(listener: LoadingListener): () => void {
  listeners.add(listener);
  listener(currentProgress, isDone); // replay current state for late subscribers
  return () => {
    listeners.delete(listener);
  };
}

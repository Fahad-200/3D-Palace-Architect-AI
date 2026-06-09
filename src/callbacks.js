export const updateCallbacks = [];
export function registerUpdateCallback(fn) {
  updateCallbacks.push(fn);
}

export const lodObjects = [];
export function registerLOD(lod) { lodObjects.push(lod); }

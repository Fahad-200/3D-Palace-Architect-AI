export const updateCallbacks = [];
export function registerUpdateCallback(fn) {
  updateCallbacks.push(fn);
}

export const lodObjects = [];
export function registerLOD(lod) { lodObjects.push(lod); }

export const BUILD_DATE = '2026-06-11';
const SECRETS = ['The ballroom chandelier has 7 lights', 'The library spiral has 44 treads', 'The basement is colder than the attic'];
export function getPalaceSecrets() { return [...SECRETS]; }

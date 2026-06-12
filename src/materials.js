import * as THREE from 'three';

const limestone_ashlar = new THREE.MeshStandardMaterial({
  color: 0xdcb86a, roughness: 0.7, emissive: 0x0a0804, emissiveIntensity: 0.02
});

const plaster_aged = new THREE.MeshStandardMaterial({
  color: 0xf0e0c4, roughness: 0.65, emissive: 0x0a0804, emissiveIntensity: 0.02
});

const dark_walnut = new THREE.MeshStandardMaterial({
  color: 0x9c6e48, roughness: 0.4, emissive: 0x060402, emissiveIntensity: 0.01
});

const terracotta_cracked = new THREE.MeshStandardMaterial({
  color: 0xdc7838, roughness: 0.7
});

const marble_checkerboard = new THREE.MeshStandardMaterial({
  color: 0xf0e6d4, roughness: 0.12, metalness: 0.08
});

const stone_flags = new THREE.MeshStandardMaterial({
  color: 0xccbca0, roughness: 0.78, emissive: 0x060402, emissiveIntensity: 0.01
});

const persian_carpet_faded = new THREE.MeshStandardMaterial({
  color: 0xcc5050, roughness: 0.88
});

const iron_rusted = new THREE.MeshStandardMaterial({
  color: 0x8a6a58, roughness: 0.85, metalness: 0.4
});

const dark_wood_furniture = new THREE.MeshStandardMaterial({
  color: 0x7a5030, roughness: 0.55
});

const velvet_crimson_aged = new THREE.MeshStandardMaterial({
  color: 0xaa2848, roughness: 0.88
});

const stone_ceiling_vault = new THREE.MeshStandardMaterial({
  color: 0xaaa098, roughness: 0.78, emissive: 0x060402, emissiveIntensity: 0.01
});

const bare_earth = new THREE.MeshStandardMaterial({
  color: 0x8c6b44, roughness: 0.95
});

console.log('Materials loaded:', {
  limestone_ashlar: '#dcb86a',
  plaster_aged: '#f0e0c4',
  dark_walnut: '#9c6e48',
  terracotta_cracked: '#dc7838',
  marble_checkerboard: '#f0e6d4',
  stone_flags: '#ccbca0',
  persian_carpet_faded: '#cc5050',
  iron_rusted: '#8a6a58',
  dark_wood_furniture: '#7a5030',
  velvet_crimson_aged: '#aa2848',
  stone_ceiling_vault: '#aaa098',
  bare_earth: '#8c6b44',
});

export const materials = {
  limestone_ashlar,
  plaster_aged,
  dark_walnut,
  terracotta_cracked,
  marble_checkerboard,
  stone_flags,
  persian_carpet_faded,
  iron_rusted,
  dark_wood_furniture,
  velvet_crimson_aged,
  stone_ceiling_vault,
  bare_earth
};

export function init() {}

export function getMaterialCount() { return Object.keys(materials).length; }

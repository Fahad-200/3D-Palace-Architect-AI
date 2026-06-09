import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { addWall, addFloor } from '../geometry.js?v=2';
import { materials } from '../materials.js?v=2';

const M_WALL = materials.limestone_ashlar;
const M_PLASTER = materials.plaster_aged;
const M_FLOOR = materials.stone_flags;
const M_EARTH = materials.bare_earth;
const M_CEILING = materials.stone_ceiling_vault;
const M_ROOF = new THREE.MeshStandardMaterial({ color: 0x6b6259, roughness: 0.95 });
const M_TIMBER = new THREE.MeshStandardMaterial({ color: 0x4a3f35, roughness: 0.9 });

export function init(sc) {
  // ── BASEMENT OUTER WALLS (Y: -3.5 to 0) ──
  addWall(0, -3.5, -12.2, 40, 3.5, 0.6, M_WALL, 'stone');
  addWall(0, -3.5, +12.2, 40, 3.5, 0.6, M_WALL, 'stone');
  addWall(+19.7, -3.5, 0, 0.6, 3.5, 25, M_WALL, 'stone');
  addWall(-19.7, -3.5, 0, 0.6, 3.5, 25, M_WALL, 'stone');

  // ── FLOOR 1 OUTER WALLS (Y: 0 to 4.5) ──
  // South wall with main entrance opening (3m gap X: -1.5 to +1.5)
  addWall(-10.75, 0, +12.2, 18.5, 4.5, 0.6, M_WALL, 'stone');
  addWall(+10.75, 0, +12.2, 18.5, 4.5, 0.6, M_WALL, 'stone');
  // North, East, West
  addWall(0, 0, -12.2, 40, 4.5, 0.6, M_WALL, 'stone');
  addWall(+19.7, 0, 0, 0.6, 4.5, 25, M_WALL, 'stone');
  addWall(-19.7, 0, 0, 0.6, 4.5, 25, M_WALL, 'stone');

  // ── FLOOR 2 OUTER WALLS (Y: 4.5 to 9.0) ──
  addWall(0, 4.5, -12.2, 40, 4.5, 0.6, M_WALL, 'stone');
  addWall(0, 4.5, +12.2, 40, 4.5, 0.6, M_WALL, 'stone');
  addWall(+19.7, 4.5, 0, 0.6, 4.5, 25, M_WALL, 'stone');
  addWall(-19.7, 4.5, 0, 0.6, 4.5, 25, M_WALL, 'stone');

  // ── FLOOR 3 OUTER WALLS (Y: 9.0 to 13.5) ──
  addWall(0, 9.0, -12.2, 40, 4.5, 0.6, M_WALL, 'stone');
  addWall(0, 9.0, +12.2, 40, 4.5, 0.6, M_WALL, 'stone');
  addWall(+19.7, 9.0, 0, 0.6, 4.5, 25, M_WALL, 'stone');
  addWall(-19.7, 9.0, 0, 0.6, 4.5, 25, M_WALL, 'stone');

  // ── FLOOR 4 / ATTIC OUTER WALLS (Y: 13.5 to 17.5) ──
  addWall(0, 13.5, -12.2, 40, 4.0, 0.6, M_WALL, 'stone');
  addWall(0, 13.5, +12.2, 40, 4.0, 0.6, M_WALL, 'stone');
  addWall(+19.7, 13.5, 0, 0.6, 4.0, 25, M_WALL, 'stone');
  addWall(-19.7, 13.5, 0, 0.6, 4.0, 25, M_WALL, 'stone');

  // ── FLOOR PLATES ──
  addFloor(0, -3.75, 0, 39.4, 24.4, M_EARTH, 'earth');  // Basement floor

  // F1 floor with trapdoor gap (X -12.6 to -11.4, Z 1.5 to 2.5)
  const f1FloorMesh = new THREE.Mesh(new THREE.BoxGeometry(39.4, 0.25, 24.4), M_FLOOR);
  f1FloorMesh.position.set(0, -0.125, 0);
  f1FloorMesh.receiveShadow = true;
  scene.add(f1FloorMesh);
  collisionWorld.addBox(-19.7, -0.25, -12.2, -12.6, 0, 12.2, 'stone', 0);
  collisionWorld.addBox(-11.4, -0.25, -12.2, 19.7, 0, 12.2, 'stone', 0);
  collisionWorld.addBox(-12.6, -0.25, -12.2, -11.4, 0, 1.5, 'stone', 0);
  collisionWorld.addBox(-12.6, -0.25, 2.5, -11.4, 0, 12.2, 'stone', 0);

  // F2 floor (split with 1.8m stairwell gap at X=-0.9 to +0.9)
  addFloor(-9.35, 4.25, 0, 16.9, 24.4, M_FLOOR, 'stone');   // left half X -17.8 to -0.9
  addFloor(+8.25, 4.25, 0, 14.7, 24.4, M_FLOOR, 'stone');   // right half X +0.9 to +15.6
  addFloor(+18.25, 4.25, +2, 3.5, 20.4, M_FLOOR, 'stone');  // east fill south of tower
  addFloor(+18.25, 4.25, -10.25, 3.5, 5.0, M_FLOOR, 'stone');  // east fill north of tower

  // F3 floor (same pattern with stairwell gap)
  addFloor(-9.35, 8.75, 0, 16.9, 24.4, M_FLOOR, 'stone');   // left half X -17.8 to -0.9
  addFloor(+8.25, 8.75, 0, 14.7, 24.4, M_FLOOR, 'stone');   // right half X +0.9 to +15.6
  addFloor(+18.25, 8.75, +2, 3.5, 20.4, M_FLOOR, 'stone');
  addFloor(+18.25, 8.75, -10.25, 3.5, 5.0, M_FLOOR, 'stone');

  // F4 floor / attic base (split with stairwell gap)
  addFloor(-10.3, 13.25, 0, 18.8, 24.4, M_FLOOR, 'stone');  // left half X -19.7 to -0.9
  addFloor(+10.3, 13.25, 0, 18.8, 24.4, M_FLOOR, 'stone');  // right half X +0.9 to +19.7

  // Stairwell enclosure walls are now in stairs.js (full-height, floor-to-ceiling)

  // ── F4/ATTIC CEILING (underside of roof) ──
  addFloor(0, 17.5, 0, 39.4, 24.4, M_CEILING, 'stone');

  // ── ROOF STRUCTURE ──
  const slopeLen = 13.12;
  const slopeAngle = THREE.MathUtils.degToRad(17.7);

  // South slope
  const southSlope = new THREE.Mesh(
    new THREE.BoxGeometry(40, 0.15, slopeLen),
    M_ROOF
  );
  southSlope.position.set(0, 19.5, +6.25);
  southSlope.rotation.x = -slopeAngle;
  southSlope.castShadow = true;
  southSlope.receiveShadow = true;
  scene.add(southSlope);

  // North slope
  const northSlope = new THREE.Mesh(
    new THREE.BoxGeometry(40, 0.15, slopeLen),
    M_ROOF
  );
  northSlope.position.set(0, 19.5, -6.25);
  northSlope.rotation.x = slopeAngle;
  northSlope.castShadow = true;
  northSlope.receiveShadow = true;
  scene.add(northSlope);

  // East hip
  const eastHip = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, slopeLen, 25),
    M_ROOF
  );
  eastHip.position.set(+15.5, 19.5, 0);
  eastHip.rotation.z = THREE.MathUtils.degToRad(20);
  eastHip.castShadow = true;
  eastHip.receiveShadow = true;
  scene.add(eastHip);

  // West hip
  const westHip = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, slopeLen, 25),
    M_ROOF
  );
  westHip.position.set(-15.5, 19.5, 0);
  westHip.rotation.z = THREE.MathUtils.degToRad(-20);
  westHip.castShadow = true;
  westHip.receiveShadow = true;
  scene.add(westHip);

  // Ridge beam
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(39.4, 0.3, 0.3),
    M_TIMBER
  );
  ridge.position.set(0, 21.5, 0);
  ridge.castShadow = true;
  ridge.receiveShadow = true;
  scene.add(ridge);

  // ── FLOOR 1 INTERNAL WALLS (plaster finish) ──

  // FOYER / GREAT HALL DIVIDER (Z = -2.0, X -6 to +6)
  // Opening: 1.8m wide × 2.8m tall centered at X=0
  addWall(-3.45, 0, -2.0, 5.1, 4.5, 0.6, M_PLASTER, 'stone');  // X -6 to -0.9
  addWall(+3.45, 0, -2.0, 5.1, 4.5, 0.6, M_PLASTER, 'stone');  // X +0.9 to +6
  // Lintel removed — allows staircase at X=0 through full height

  // GREAT HALL EAST WALL (X = +6.5, Z -12.2 to -2.0)
  // Opening for gallery door at Z=-3.5, 1.0m wide × 2.4m tall
  addWall(+6.5, 0, -8.1, 0.6, 4.5, 8.2, M_PLASTER, 'stone');  // Z -12.2 to -4.0
  addWall(+6.5, 0, -2.5, 0.6, 4.5, 1.0, M_PLASTER, 'stone');  // Z -3.0 to -2.0
  addWall(+6.5, 2.4, -3.5, 0.6, 2.1, 1.0, M_PLASTER, 'stone');  // Lintel Y: 2.4 to 4.5

  // KITCHEN WEST PARTITION (X = -6.5, Z -12.2 to +4.0)
  // Opening at Z=+1.0, 1.5m wide × 2.4m tall (Z +0.25 to +1.75)
  addWall(-6.5, 0, -5.975, 0.6, 4.5, 12.45, M_PLASTER, 'stone');  // Z -12.2 to +0.25
  addWall(-6.5, 0, +2.875, 0.6, 4.5, 2.25, M_PLASTER, 'stone');  // Z +1.75 to +4.0
  addWall(-6.5, 2.4, +1.0, 0.6, 2.1, 1.5, M_PLASTER, 'stone');  // Lintel Y: 2.4 to 4.5

  // EAST WING GALLERY inner corridor wall (X = +10.0, Z -12.0 to +8.0)
  addWall(+10.0, 0, -2.0, 0.6, 4.5, 20, M_PLASTER, 'stone');

  // ── FLOOR 2 PRIMARY DIVIDERS (plaster finish) ──

  // Ballroom north wall at Z=-3.0 with centered door 2m wide × 3m tall
  addWall(-10.5, 4.5, -3.0, 19, 4.5, 0.6, M_PLASTER, 'stone');  // X -20 to -1.0
  addWall(+10.5, 4.5, -3.0, 19, 4.5, 0.6, M_PLASTER, 'stone');  // X +1.0 to +20
  // Lintel removed — allows staircase at X=0 to pass through

  // Ballroom south wall at Z=+7.5 with centered door 2m wide × 3m tall
  addWall(-10.5, 4.5, +7.5, 19, 4.5, 0.6, M_PLASTER, 'stone');  // X -20 to -1.0
  addWall(+10.5, 4.5, +7.5, 19, 4.5, 0.6, M_PLASTER, 'stone');  // X +1.0 to +20
  addWall(0, 7.5, +7.5, 2.0, 1.5, 0.6, M_PLASTER, 'stone');  // Lintel Y: 7.5 to 9.0

  // ── FLOOR 3 PRIMARY DIVIDER (plaster finish) ──

  // Master bedroom vs guest corridor at Z=-1.0, X -9 to +9
  // Centered door 2m wide × 3m tall
  addWall(-5.0, 9.0, -1.0, 8, 4.5, 0.6, M_PLASTER, 'stone');  // X -9 to -1
  addWall(+5.0, 9.0, -1.0, 8, 4.5, 0.6, M_PLASTER, 'stone');  // X +1 to +9
  addWall(0, 12.0, -1.0, 2.0, 1.5, 0.6, M_PLASTER, 'stone');  // Lintel Y: 12.0 to 13.5
}

export const collidables = [];

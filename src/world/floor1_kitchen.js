import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { addWall } from '../geometry.js?v=2';
import { materials } from '../materials.js?v=2';

const M_STONE = materials.limestone_ashlar;
const M_PLASTER = materials.plaster_aged;
const M_STONE_FLAGS = materials.stone_flags;
const M_WALNUT = materials.dark_walnut;
const M_IRON = materials.iron_rusted;
const M_M_WALNUT = materials.dark_walnut;

const M_SOOT = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.95 });
const M_ASH = new THREE.MeshStandardMaterial({ color: 0x4a4440, roughness: 0.95 });
const M_LOG = new THREE.MeshStandardMaterial({ color: 0x2a1e10, roughness: 0.9 });
const M_BURNT = new THREE.MeshStandardMaterial({ color: 0x1a0e08, roughness: 0.95 });
const M_CLAY = new THREE.MeshStandardMaterial({ color: 0x8a6040, roughness: 0.85 });
const M_CLAY_DARK = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.85 });
const M_SACK = new THREE.MeshStandardMaterial({ color: 0x6a5e50, roughness: 1.0 });
const M_SHELF = new THREE.MeshStandardMaterial({ color: 0x8a7e70, roughness: 0.85 });
const M_SINK_INNER = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.9 });

function addVisualPlane(x, y, z, width, height, rotY, mat) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  scene.add(mesh);
  return mesh;
}

function addShelf(x, y, z, width, mat) {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.35), mat);
  shelf.position.set(x, y, z);
  shelf.receiveShadow = true;
  scene.add(shelf);
}

export const collidables = [];

export function init(sc) {
  // ═════════════════════════════════════════════
  // SECTION 5: KITCHEN WALLS AND FLOOR
  // ═════════════════════════════════════════════

  const floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.04, 8), M_STONE_FLAGS);
  floor.position.set(-12, 0.02, 2);
  floor.receiveShadow = true;
  scene.add(floor);

  // Wall panels: plaster lower (0-1.5m), limestone upper (1.5-4.0m)
  const wallDefs = [
    // North wall (Z=-2), faces south
    { x: -12, yPlaster: 0.75, yStone: 2.75, z: -1.98, w: 10, hP: 1.5, hS: 2.5, rotY: 0 },
    // South wall (Z=+6), faces north
    { x: -12, yPlaster: 0.75, yStone: 2.75, z: 5.98, w: 10, hP: 1.5, hS: 2.5, rotY: Math.PI },
    // West wall (X=-17), faces east
    { x: -16.98, yPlaster: 0.75, yStone: 2.75, z: 2, w: 8, hP: 1.5, hS: 2.5, rotY: Math.PI / 2 },
    // East wall (X=-7), faces west
    { x: -7.02, yPlaster: 0.75, yStone: 2.75, z: 2, w: 8, hP: 1.5, hS: 2.5, rotY: -Math.PI / 2 }
  ];

  for (const wd of wallDefs) {
    addVisualPlane(wd.x, wd.yPlaster, wd.z, wd.w, wd.hP, wd.rotY, M_PLASTER);
    addVisualPlane(wd.x, wd.yStone, wd.z, wd.w, wd.hS, wd.rotY, M_STONE);
  }

  // Kitchen ceiling plane
  const kitchenCeiling = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.04, 7.8), materials.stone_ceiling_vault);
  kitchenCeiling.position.set(-12, 3.98, 2);
  scene.add(kitchenCeiling);

  // ═════════════════════════════════════════════
  // SECTION 6: GREAT KITCHEN HEARTH
  // ═════════════════════════════════════════════

  // Firebox surround (centered at -12, 0, -1.8)
  addWall(-13.5, 0, -1.85, 0.4, 2.0, 0.6, M_STONE, 'stone');
  addWall(-10.5, 0, -1.85, 0.4, 2.0, 0.6, M_STONE, 'stone');
  addWall(-12, 2.0, -1.85, 3.0, 0.3, 0.6, M_STONE, 'stone');

  // Fireback (dark soot-stained)
  const fireback = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 0.3), M_SOOT);
  fireback.position.set(-12, 0.75, -2.1);
  scene.add(fireback);

  // Ash bed
  const ashBed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.04, 0.5), M_ASH);
  ashBed.position.set(-12, 0.02, -1.92);
  scene.add(ashBed);

  // Log remnants
  const logData = [
    { len: 1.2, y: 0.05, z: -1.9, burnt: false, rotZ: 0.05 },
    { len: 0.8, y: 0.04, z: -1.95, burnt: true, rotZ: -0.08 },
    { len: 0.6, y: 0.06, z: -1.88, burnt: false, rotZ: 0.1 },
    { len: 1.0, y: 0.045, z: -1.93, burnt: true, rotZ: -0.04 }
  ];
  for (const log of logData) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, log.len, 6),
      log.burnt ? M_BURNT : M_LOG
    );
    mesh.position.set(-12 + (Math.random() - 0.5) * 0.5, log.y, log.z);
    mesh.rotation.x = Math.PI / 2;
    mesh.rotation.z = log.rotZ + (Math.random() - 0.5) * 0.05;
    scene.add(mesh);
  }

  // Iron spit assembly
  for (const sx of [-13.2, -10.8]) {
    // Y-shaped support: 3 cylinders
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.7, 5), M_IRON);
    post.position.set(sx, 0.35, -2.0);
    scene.add(post);
    const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), M_IRON);
    forkL.position.set(sx - 0.05, 0.7, -2.0);
    forkL.rotation.z = 0.3;
    scene.add(forkL);
    const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), M_IRON);
    forkR.position.set(sx + 0.05, 0.7, -2.0);
    forkR.rotation.z = -0.3;
    scene.add(forkR);
  }

  // Main spit rod
  const spitRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.6, 6), M_IRON);
  spitRod.position.set(-11.9, 0.71, -2.0);
  spitRod.rotation.z = Math.PI / 2;
  scene.add(spitRod);

  // Pot hook chain from lintel center
  for (let l = 0; l < 4; l++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.006, 6, 8), M_IRON);
    ring.position.set(-12, 2.1 - l * 0.08, -1.85);
    scene.add(ring);
  }
  // Large iron hook
  const hookV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), M_IRON);
  hookV.position.set(-12, 1.8, -1.85);
  scene.add(hookV);
  const hookH = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.08), M_IRON);
  hookH.position.set(-12, 1.74, -1.81);
  scene.add(hookH);

  // ═════════════════════════════════════════════
  // SECTION 7: REFECTORY TABLE
  // ═════════════════════════════════════════════

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 1.3), M_WALNUT);
  tableTop.position.set(-11.5, 0.85, 2.5);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  scene.add(tableTop);

  for (const tx of [-1.65, 1.65]) {
    for (const tz of [-0.6, 0.6]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.12), M_WALNUT);
      leg.position.set(-11.5 + tx, 0.425, 2.5 + tz);
      scene.add(leg);
    }
  }

  collisionWorld.addBox(-13.25, 0, 1.85, -9.75, 0.95, 3.15, 'wood', 0.95);

  // Props on table surface
  const crockPositions = [[-11.3, 2.3], [-11.7, 2.7], [-11.0, 2.5]];
  for (let ci = 0; ci < 3; ci++) {
    const [cx, cz] = crockPositions[ci];
    const crock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.05, 0.1, 8),
      ci === 0 ? M_CLAY : M_CLAY_DARK
    );
    crock.position.set(cx, 0.9, cz);
    scene.add(crock);
    if (ci === 2) {
      const crack = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.003, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 1.0 }));
      crack.position.set(cx + 0.02, 0.92, cz);
      crack.rotation.y = 0.3;
      scene.add(crack);
    }
  }

  const board = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.025, 0.3), M_WALNUT);
  board.position.set(-11.8, 0.913, 2.2);
  scene.add(board);

  const cleaver = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.12), M_IRON);
  cleaver.position.set(-11.7, 0.918, 2.3);
  cleaver.rotation.y = 0.25;
  scene.add(cleaver);

  // ═════════════════════════════════════════════
  // SECTION 8: HANGING POT RACK AND SCULLERY
  // ═════════════════════════════════════════════

  // Hanging pot rack
  const rack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 0.8), M_IRON);
  rack.position.set(-11.5, 3.75, 2.5);
  scene.add(rack);

  // Suspension chains from ceiling to rack corners
  const cornerOffsets = [[-1.55, -0.35], [1.55, -0.35], [-1.55, 0.35], [1.55, 0.35]];
  for (const [cx, cz] of cornerOffsets) {
    for (let l = 0; l < 3; l++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 5, 6), M_IRON);
      ring.position.set(-11.5 + cx, 3.95 + l * 0.08, 2.5 + cz);
      scene.add(ring);
    }
  }

  // Pot hooks
  const hookZ = [-2.5, -2.2, -1.9, -1.6, -1.3, -1.0, -0.7, -0.4, -0.1, 0.2];
  for (let hi = 0; hi < 10; hi++) {
    const hookLen = 0.1 + Math.random() * 0.12;
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, hookLen, 4), M_IRON);
    hook.position.set(-11.5 + hi * 0.32 - 1.44, 3.73 - hookLen / 2, 2.5 + hookZ[Math.min(hi, hookZ.length - 1)]);
    scene.add(hook);
  }

  // 3 hanging iron pots
  const potIndices = [1, 4, 7];
  for (const pi of potIndices) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14 + Math.random() * 0.02, 0.16 + Math.random() * 0.02, 0.18 + Math.random() * 0.04, 8),
      M_IRON
    );
    pot.position.set(-11.5 + pi * 0.32 - 1.44, 3.55, 2.5 + -1.5 + Math.random() * 3);
    scene.add(pot);
  }

  // Scullery ceiling (lower, 3.0m)
  const sculleryCeiling = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 2.8), materials.stone_ceiling_vault);
  sculleryCeiling.position.set(-16.25, 2.98, -0.5);
  scene.add(sculleryCeiling);

  // Scullery stone sink
  const sinkOuter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.55), M_STONE_FLAGS);
  sinkOuter.position.set(-16.25, 0.425, -1.0);
  sinkOuter.castShadow = true;
  scene.add(sinkOuter);
  collisionWorld.addBox(-16.65, 0, -1.275, -15.85, 0.8, -0.725, 'stone', 0.8);

  const sinkInner = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.45), M_SINK_INNER);
  sinkInner.position.set(-16.25, 0.43, -1.0);
  scene.add(sinkInner);

  // Drain hole
  const drain = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0a0808, side: THREE.DoubleSide }));
  drain.position.set(-16.25, 0.435, -1.0);
  drain.rotation.x = Math.PI / 2;
  scene.add(drain);

  // Cold Store ceiling (2.5m)
  const coldCeiling = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.04, 2.8), materials.stone_ceiling_vault);
  coldCeiling.position.set(-15.5, 2.48, 0);
  scene.add(coldCeiling);

  // Cold Store shelves on 3 walls
  const shelfY = [0.8, 1.4, 2.0];
  for (const sy of shelfY) {
    addShelf(-15.5, sy, -1.48, 2.8, M_SHELF);     // North wall
    addShelf(-15.5, sy, 1.48, 2.8, M_SHELF);        // South wall
    addShelf(-16.98, sy, 0, 2.8, M_SHELF);           // West wall
  }

  // Shelf objects
  for (let si = 0; si < 3; si++) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 6),
      si === 1 ? M_CLAY : M_CLAY_DARK);
    jar.position.set(-15.5 + (Math.random() - 0.5) * 1.5, 0.86, -1.45);
    scene.add(jar);
  }
  const amphora = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, 0.25, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.85 })
  );
  amphora.position.set(-15.2, 0.86, 1.45);
  amphora.rotation.z = 0.15;
  scene.add(amphora);
  const canister = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.15, 6),
    M_IRON
  );
  canister.position.set(-16.0, 0.86, 1.43);
  scene.add(canister);

  // Broken meat hook on north wall at Y=2.0
  const hookHoriz = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4), M_IRON);
  hookHoriz.position.set(-15.5, 2.0, -1.48);
  hookHoriz.rotation.x = Math.PI / 2;
  scene.add(hookHoriz);
  const hookBend = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.15, 4), M_IRON);
  hookBend.position.set(-15.5, 1.9, -1.48);
  hookBend.rotation.z = 1.3;
  hookBend.rotation.x = 0.2;
  scene.add(hookBend);
  const wallRing = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 5, 6), M_IRON);
  wallRing.position.set(-15.5, 2.0, -1.49);
  scene.add(wallRing);

  // ═════════════════════════════════════════════
  // SECTION 9: CUPBOARDS AND MISC
  // ═════════════════════════════════════════════

  function addCupboard(x, y, z, facingEast) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.9, 0.42), M_M_WALNUT);
    body.position.set(x, y, z);
    body.castShadow = true;
    scene.add(body);
    collisionWorld.addBox(x - 0.425, y - 0.95, z - 0.21, x + 0.425, y + 0.95, z + 0.21, 'wood', 1.9);

    // Open door (half-height, pivoted open 80°)
    const doorGroup = new THREE.Group();
    const hingeSide = facingEast ? -0.425 : 0.425;
    doorGroup.position.set(x + hingeSide, y - 0.45, z + (facingEast ? 0.21 : -0.21));
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.9, 0.035), M_M_WALNUT);
    door.position.set(-hingeSide, 0, 0);
    doorGroup.add(door);
    doorGroup.rotation.y = facingEast ? -1.4 : 1.4;
    scene.add(doorGroup);

    // Iron hinge strips
    for (const hy of [-0.35, 0.35]) {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.005), M_IRON);
      hinge.position.set(hingeSide, hy, z + (facingEast ? 0.21 : -0.21));
      scene.add(hinge);
    }

    // Interior props
    const clayPot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.12, 6), M_CLAY);
    clayPot.position.set(x + (facingEast ? -0.1 : 0.1), y - 0.7, z + (facingEast ? 0.1 : -0.1));
    scene.add(clayPot);

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.85 }));
    box.position.set(x + (facingEast ? 0.1 : -0.1), y - 0.72, z + (facingEast ? -0.05 : 0.05));
    scene.add(box);

    const sack = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.15), M_SACK);
    sack.position.set(x + (facingEast ? -0.05 : 0.05), y - 0.71, z + (facingEast ? -0.12 : 0.12));
    sack.scale.y = 1.1;
    scene.add(sack);
  }

  // Cupboard on east wall (X=-7), facing west, at Z=0
  addCupboard(-6.8, 0.95, -4, false);

  // Cupboard on south wall (Z=+6), facing north, at X=-10
  addCupboard(-10, 0.95, 5.8, true);
}

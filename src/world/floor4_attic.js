import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture } from '../geometry.js?v=2';

const M_WALNUT = materials.dark_walnut;
const M_IRON = materials.iron_rusted;
const M_DARK_WOOD = materials.dark_wood_furniture;

function buildPart1() {

/* SECTION 6: ATTIC FLOOR */

const floor = new THREE.Mesh(new THREE.BoxGeometry(39.0, 0.04, 24.0), M_WALNUT);
floor.position.set(0, 13.54, 0);
floor.receiveShadow = true;
scene.add(floor);

for (let x = -19.5; x < 19.5; x += 0.22) {
  const gap = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.002, 24),
    new THREE.MeshStandardMaterial({ color: 0x0a0806 }));
  gap.position.set(x, 13.56, 0);
  scene.add(gap);
}

[[-15, -8], [5, 4], [-6, -2]].forEach(([gx, gz]) => {
  const missing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x050505 }));
  missing.position.set(gx, 13.52, gz);
  scene.add(missing);
});

/* SECTION 7: EXPOSED ROOF STRUCTURE — TIMBER TRUSSES */

function makeTimberTex() {
  return makeTexture(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#2a1a0e'; ctx.fillRect(0, 0, w, h);
    for (let g = 0; g < 8; g++) {
      ctx.strokeStyle = `rgba(${50 + g * 3},${32 + g * 2},${18 + g},0.5)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, g * 8); ctx.lineTo(w, g * 8 + Math.random() * 4 - 2); ctx.stroke();
    }
  });
}

const timberMat = new THREE.MeshStandardMaterial({ map: makeTimberTex(), roughness: 0.9 });
const ridgeH = 21.5, eaveH = 15.0, halfSpan = 19.75;
const slopeAngle = Math.atan2(ridgeH - eaveH, halfSpan);
const slopeLen = Math.sqrt(halfSpan * halfSpan + (ridgeH - eaveH) * (ridgeH - eaveH));

function createTruss(z) {
  const botChord = new THREE.Mesh(new THREE.BoxGeometry(39.5, 0.22, 0.2), timberMat);
  botChord.position.set(0, 13.61, z);
  scene.add(botChord);
  collisionWorld.addBox(-19.75, 13.5, z - 0.12, 19.75, 13.83, z + 0.12, 'wood', 0.33);

  const leftRafter = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.2, 0.18), timberMat);
  leftRafter.position.set(-halfSpan / 2, (eaveH + ridgeH) / 2, z);
  leftRafter.rotation.z = slopeAngle;
  scene.add(leftRafter);

  const rightRafter = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.2, 0.18), timberMat);
  rightRafter.position.set(+halfSpan / 2, (eaveH + ridgeH) / 2, z);
  rightRafter.rotation.z = -slopeAngle;
  scene.add(rightRafter);

  const kingPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, ridgeH - 13.5, 0.2), timberMat);
  kingPost.position.set(0, (ridgeH + 13.5) / 2, z);
  scene.add(kingPost);
  collisionWorld.addBox(-0.12, 13.5, z - 0.12, 0.12, ridgeH, z + 0.12, 'wood', ridgeH - 13.5);

  [-9.0, 9.0].forEach(ox => {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.16, 0.15), timberMat);
    strut.position.set(ox, 15.8, z);
    strut.rotation.z = ox < 0 ? 0.42 : -0.42;
    scene.add(strut);
  });
}

for (const z of [-10.5, -7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5]) createTruss(z);

[[-7.5, 19.5, 0], [-14.0, 16.5, 0], [-18.5, 14.8, 0]].forEach(([px, py]) => {
  const purlin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 24, 6), timberMat);
  purlin.position.set(px, py, 0);
  purlin.rotation.z = slopeAngle;
  scene.add(purlin);
  const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 24, 6), timberMat);
  mirror.position.set(-px, py, 0);
  mirror.rotation.z = -slopeAngle;
  scene.add(mirror);
  collisionWorld.addBox(px - 0.12, py - 0.12, -12.5, px + 0.12, py + 0.12, 12.5, 'wood', 0);
});

const tileMat = new THREE.MeshStandardMaterial({ color: 0x6b5a4a, roughness: 0.9 });
const bayZ = [-9.0, -6.0, -3.0, 0, 3.0, 6.0, 9.0];
const skipped = new Set([2, 5, 11, 17, 23, 29]);

let tileIdx = 0;
for (const bz of bayZ) {
  for (let side = 0; side < 2; side++) {
    for (let s = 0; s < 3; s++) {
      const sx = side === 0 ? -(1.5 + s * 6) : (1.5 + s * 6);
      const sy = eaveH + s * ((ridgeH - eaveH) / 3);
      if (skipped.has(tileIdx)) { tileIdx++; continue; }
      const tilePanel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.04, 3.5), tileMat);
      tilePanel.position.set(sx, sy, bz);
      tilePanel.rotation.z = side === 0 ? slopeAngle : -slopeAngle;
      scene.add(tilePanel);
      tileIdx++;
    }
  }
}
}

export const crouchZones = [
  { minX: -20.5, maxX: -16.5, minZ: -13.0, maxZ: 13.0, label: 'west_eave' },
  { minX: 16.5, maxX: 20.5, minZ: -13.0, maxZ: 13.0, label: 'east_eave' }
];

function buildPart2() {

/* SECTION 9: DORMITORY BEDS AND FURNISHINGS */

function createDormBed(cx, z) {
  const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.75, 0.05), M_IRON);
  headboard.position.set(cx, 13.5 + 0.7, z - 0.5);
  scene.add(headboard);
  collisionWorld.addBox(cx - 0.52, 13.5, z - 0.55, cx + 0.52, 13.5 + 0.75 + 0.7, z - 0.45, 'metal', 1.45);

  const footboard = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.05), M_IRON);
  footboard.position.set(cx, 13.5 + 0.5, z + 0.95);
  scene.add(footboard);

  [-0.47, 0.47].forEach(ox => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 1.45), M_IRON);
    rail.position.set(cx + ox, 13.5 + 0.62, z + 0.225);
    scene.add(rail);
  });

  const mattress = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 1.35),
    new THREE.MeshStandardMaterial({ color: 0x1e1e1a, roughness: 0.98 }));
  mattress.position.set(cx, 13.5 + 0.72, z + 0.225);
  scene.add(mattress);
  collisionWorld.addBox(cx - 0.47, 13.5, z - 0.46, cx + 0.47, 13.5 + 0.66 + 0.14, z + 0.91, 'metal', 0);

  const drip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x6a3010, transparent: true, opacity: 0.55, roughness: 1.0 }));
  drip.position.set(cx - 0.3 + Math.random() * 0.6, 13.5 + 0.45, z - 0.48);
  scene.add(drip);
}

const bedPositions = [[-1.5, -9], [-1.5, -6.5], [-1.5, -4], [-1.5, -1.5], [-1.5, 1], [-1.5, 3.5],
  [1.5, -9], [1.5, -6.5], [1.5, -4], [1.5, -1.5], [1.5, 1], [1.5, 3.5]];
bedPositions.forEach(([x, z]) => createDormBed(x, z));

/* TRUNKS */

[[-8, -6], [-8, 6], [8, -6], [8, 6]].forEach(([tx, tz], i) => {
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.52, 0.5), M_WALNUT);
  trunk.position.set(tx, 13.5 + 0.26, tz);
  scene.add(trunk);
  collisionWorld.addBox(tx - 0.44, 13.5, tz - 0.26, tx + 0.44, 13.5 + 0.52, tz + 0.26, 'wood', 0.52);
  if (i === 0) {
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.83, 0.04, 0.48), M_WALNUT);
    lid.position.set(tx, 13.5 + 0.52, tz);
    lid.rotation.x = 0.3;
    scene.add(lid);
  }
  for (let c = 0; c < 4; c++) {
    const corner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.06), M_IRON);
    const sx = (c < 2 ? -1 : 1) * 0.4;
    const sz = (c % 2 === 0 ? -1 : 1) * 0.24;
    corner.position.set(tx + sx, 13.5 + (i === 0 ? 0.28 : 0.01), tz + sz);
    scene.add(corner);
  }
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.04), M_IRON);
  latch.position.set(tx, 13.5 + 0.28, tz + 0.24);
  scene.add(latch);
});

/* STACKED CRATES */

for (let r = 0; r < 2; r++) {
  for (let c = 0; c < 2; c++) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.45), M_WALNUT);
    crate.position.set(-18 + c * 0.6, 13.5 + 0.25 + r * 0.5, -8);
    scene.add(crate);
    if (r === 1 && c === 1) {
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.03, 0.43), M_WALNUT);
      lid.position.set(-18 + c * 0.6, 13.5 + 0.75, -8);
      lid.rotation.x = 0.5;
      scene.add(lid);
    }
  }
}
collisionWorld.addBox(-18.4, 13.5, -8.3, -17.2, 14.5, -7.7, 'wood', 1.0);

/* CHILD'S CRADLE */

const cradle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.38), M_WALNUT);
cradle.position.set(18, 13.5 + 0.225, -10.5);
scene.add(cradle);
collisionWorld.addBox(17.65, 13.5, -10.69, 18.35, 13.95, -10.31, 'wood', 0.45);

const cRocker = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 4, 8, Math.PI),
  new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: 0.8 }));
cRocker.position.set(18, 13.5 + 0.025, -10.5);
cRocker.rotation.y = Math.PI / 2;
scene.add(cRocker);

const hood = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.4, 0.3), M_WALNUT);
hood.position.set(18.3, 13.5 + 0.45, -10.5);
hood.rotation.z = 0.15;
scene.add(hood);

const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3),
  new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.95, side: THREE.DoubleSide }));
cloth.position.set(17.95, 13.5 + 0.25, -10.5);
cloth.rotation.x = 0.2;
cloth.rotation.z = 0.3;
scene.add(cloth);

/* CHIMNEY STACKS */

const brickTex = makeTexture(64, 64, (ctx, w, h) => {
  ctx.fillStyle = '#7a4a30'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#5a3220'; ctx.lineWidth = 0.5;
  for (let r = 0; r < 6; r++) {
    const y = r * 10;
    for (let c = 0; c < 4; c++) {
      const x = c * 16 + (r % 2) * 8;
      ctx.strokeRect(x, y, 15, 9);
    }
  }
});
const M_BRICK = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95 });

[[-9, -4], [-9, 4], [9, -4], [9, 4]].forEach(([cx, cz]) => {
  const stack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 8, 0.85), M_BRICK);
  stack.position.set(cx, 13.5 + 4, cz);
  scene.add(stack);
  collisionWorld.addBox(cx - 0.44, 13.5, cz - 0.44, cx + 0.44, 21.5, cz + 0.44, 'stone', 8);
});

/* SECTION 10: TILE GAP LIGHT BEAMS */

const gapPositions = [
  { x: -12, z: -6, y: 16.2 }, { x: 8, z: 3, y: 15.8 }, { x: -4, z: 7, y: 16.5 },
  { x: 14, z: -8, y: 15.6 }, { x: -7, z: 0, y: 16.1 }, { x: 3, z: -4, y: 16.4 }
];
gapPositions.forEach(g => {
  const shaftLight = new THREE.SpotLight(0xc8d0d8, 0.35);
  shaftLight.position.set(g.x, g.y + 3, g.z);
  shaftLight.target.position.set(g.x, 13.5, g.z);
  shaftLight.angle = 0.06;
  shaftLight.penumbra = 0.4;
  shaftLight.decay = 1.5;
  shaftLight.distance = 8;
  shaftLight.castShadow = false;
  scene.add(shaftLight);
  scene.add(shaftLight.target);

  const shaftMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, g.y - 13.5, 8, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xd0d8e0, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide })
  );
  shaftMesh.position.set(g.x, (g.y + 13.5) / 2, g.z);
  scene.add(shaftMesh);
});
}

export function init(scene) {
  buildPart1();
  buildPart2();
}

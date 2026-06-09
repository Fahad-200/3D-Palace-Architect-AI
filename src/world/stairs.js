import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { makeTexture, addWall, addFloor, addStep } from '../geometry.js?v=2';
import { materials } from '../materials.js?v=2';

const M_STONE = materials.limestone_ashlar;
const M_WALNUT = materials.dark_walnut;
const M_IRON = materials.iron_rusted;
const M_CEILING = materials.stone_ceiling_vault;

function makeRopeTex() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5c3d1e';
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = '#4a2e14';
  ctx.lineWidth = 1;
  for (let s = 0; s < 8; s++) {
    ctx.beginPath();
    ctx.moveTo(0, s * 8);
    for (let x = 0; x < 64; x += 4) ctx.lineTo(x, s * 8 + Math.sin(x * 0.1 + s) * 2);
    ctx.stroke();
  }
  const data = ctx.getImageData(0, 0, 64, 64);
  const t = new THREE.DataTexture(data.data, 64, 64, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const M_ROPE = new THREE.MeshStandardMaterial({ map: makeRopeTex(), roughness: 0.95 });
const M_STONE_FLOOR = materials.stone_flags;

function buildCurvedFlight(cx, cz, r, startAngle, endAngle, steps, startY, endY, stepW, stepD) {
  for (let i = 0; i < steps; i++) {
    const t = steps > 1 ? i / (steps - 1) : 0;
    const angle = startAngle + t * (endAngle - startAngle);
    const x = cx + r * Math.cos(angle);
    const z = cz + r * Math.sin(angle);
    const y = startY + t * (endY - startY);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(stepW, 0.2, stepD), M_STONE);
    mesh.position.set(x, y + 0.1, z);
    mesh.rotation.y = -angle;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const halfW = stepW / 2;
    const halfD = stepD / 2;
    const ca = Math.abs(Math.cos(angle));
    const sa = Math.abs(Math.sin(angle));
    const dX = halfW * ca + halfD * sa;
    const dZ = halfW * sa + halfD * ca;
    collisionWorld.addBox(x - dX, y, z - dZ, x + dX, y + 0.2, z + dZ, 'stone', 0.2);
  }
}

function buildStraightFlight(startZ, startY, endY, steps, stepD, stepW) {
  const rise = (endY - startY) / steps;
  const halfW = stepW / 2;
  for (let i = 0; i < steps; i++) {
    const z = startZ - i * stepD;
    const y = startY + i * rise;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(stepW, 0.2, stepD), M_STONE);
    mesh.position.set(0, y + 0.1, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    collisionWorld.addBox(-halfW, y, z - stepD / 2, halfW, y + 0.2, z + stepD / 2, 'stone', 0.2);
  }
}



export function init(sc) {
  // ════════════════════════════════════════════════════════════
  // SECTION A: FULLY CURVED GRAND STAIRCASE — F1 THROUGH F4
  // Each flight is a sweeping half-circle (π/2 → -π/2) centered on X=0,
  // curving eastward to X=3.08 at the midpoint, then returning to X=0.
  // F1→F2 is split into two sub-flights with a mezzanine at the east apex.
  // F2→F3 and F3→F4 are single half-circle flights.
  // Enclosed by full-height stairwell walls and capped with a ceiling.
  // ════════════════════════════════════════════════════════════

  const stepW = 1.8;
  const stepD = 0.38;
  const r = 3.08;

  // ═══ F1 → F2 (single continuous curved flight, no mezzanine) ═══
  const cz1 = 4.92;
  buildCurvedFlight(0, cz1, r, Math.PI / 2, -Math.PI / 2, 24, 0, 4.25, stepW, stepD);

  const f2LandingZ = cz1 - r;
  addFloor(0, 4.25, f2LandingZ, stepW, 1.2, M_STONE_FLOOR, 'stone');

  // ═══ F2 → F3 (single curved flight, full half-circle) ═══
  const cz2 = -1.24;
  buildCurvedFlight(0, cz2, r, Math.PI / 2, -Math.PI / 2, 22, 4.25, 8.75, stepW, stepD);

  const f3LandingZ = cz2 - r;
  addFloor(0, 8.75, f3LandingZ, stepW, 1.2, M_STONE_FLOOR, 'stone');

  // ═══ F3 → F4 (single curved flight, full half-circle) ═══
  const cz3 = -7.40;
  buildCurvedFlight(0, cz3, r, Math.PI / 2, -Math.PI / 2, 22, 8.75, 13.25, stepW, stepD);

  const f4LandingZ = cz3 - r;
  addFloor(0, 13.25, f4LandingZ, stepW, 1.5, M_STONE_FLOOR, 'stone');

  // ── STAIRWELL ENCLOSURE WALLS (floor-to-ceiling height at X=±1.2) ──
  // Walls split at each floor's landing position to allow player exit.
  // F2 level: floor at Y=4.25, ceiling at Y=9.0.
  addWall(-1.2, 4.25, -1.83, 0.2, 4.75, 6.34, M_STONE, 'stone');
  addWall(+1.2, 4.25, -1.83, 0.2, 4.75, 6.34, M_STONE, 'stone');

  // F3 level: floor at Y=8.75, ceiling at Y=13.25.
  addWall(-1.2, 8.75, -7.41, 0.2, 4.5, 7.18, M_STONE, 'stone');
  addWall(+1.2, 8.75, -7.41, 0.2, 4.5, 7.18, M_STONE, 'stone');

  // F4 level: floor at Y=13.25, ceiling at Y=17.5.
  addWall(-1.2, 13.25, -7.49, 0.2, 4.25, 4.98, M_STONE, 'stone');
  addWall(+1.2, 13.25, -7.49, 0.2, 4.25, 4.98, M_STONE, 'stone');

  // ── STAIRWELL CEILING (blocks roof structure view above F4 level) ──
  // Covers the full width and length of the curved staircase path
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(7.0, 0.12, 17.0),
    M_CEILING
  );
  ceiling.position.set(1.5, 17.44, -3.3);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  // ═════════════════════════════════════════════
  // SECTION B: EAST TOWER SPIRAL STAIRCASE
  // ═════════════════════════════════════════════

  const towerCX = 17.5;
  const towerCZ = -10.0;
  const towerR = 2.5;
  const towerPanels = 12;

  for (let i = 0; i < towerPanels; i++) {
    const angle = (i / towerPanels) * Math.PI * 2;
    const px = towerCX + Math.cos(angle) * towerR;
    const pz = towerCZ + Math.sin(angle) * towerR;

    if (i % 3 === 0) {
      const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(1.28, 2.0, 0.4),
        M_STONE
      );
      bottom.position.set(px, 1.0, pz);
      bottom.rotation.y = angle;
      bottom.castShadow = true;
      bottom.receiveShadow = true;
      scene.add(bottom);

      const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.28, 19.2, 0.4),
        M_STONE
      );
      top.position.set(px, 2.8 + 19.2 / 2, pz);
      top.rotation.y = angle;
      top.castShadow = true;
      top.receiveShadow = true;
      scene.add(top);

      const boxB = new THREE.Box3().setFromObject(bottom);
      collisionWorld.addBox(boxB.min.x, boxB.min.y, boxB.min.z, boxB.max.x, boxB.max.y, boxB.max.z, 'stone', 20);

      const arrowslit = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.8, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x5c5246, roughness: 0.9 })
      );
      arrowslit.position.set(px, 2.4, pz);
      arrowslit.rotation.y = angle;
      scene.add(arrowslit);
    } else {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(1.28, 22, 0.4),
        M_STONE
      );
      panel.position.set(px, 11.0, pz);
      panel.rotation.y = angle;
      panel.castShadow = true;
      panel.receiveShadow = true;
      scene.add(panel);

      const box = new THREE.Box3().setFromObject(panel);
      collisionWorld.addBox(box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z, 'stone', 22);
    }
  }

  const newelPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 22, 8),
    M_STONE
  );
  newelPost.position.set(towerCX, 11.0, towerCZ);
  newelPost.castShadow = true;
  scene.add(newelPost);
  collisionWorld.addBox(
    towerCX - 0.28, -3.5, towerCZ - 0.28,
    towerCX + 0.28, 18.5, towerCZ + 0.28,
    'stone', 22
  );

  const numSpiralSteps = 56;
  const risePerStep = 18.0 / numSpiralSteps;
  const stepRadius = 1.5;

  for (let i = 0; i < numSpiralSteps; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const stepY = i * risePerStep;
    const px = towerCX + Math.cos(angle) * stepRadius;
    const pz = towerCZ + Math.sin(angle) * stepRadius;

    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.18, 0.85),
      M_STONE
    );
    stepMesh.position.set(px, stepY + risePerStep / 2, pz);
    stepMesh.rotation.y = angle + Math.PI / 2;
    stepMesh.castShadow = true;
    stepMesh.receiveShadow = true;
    scene.add(stepMesh);

    const rotAngle = angle + Math.PI / 2;
    const ca = Math.abs(Math.cos(rotAngle));
    const sa = Math.abs(Math.sin(rotAngle));
    const dX = 0.45 * ca + 0.425 * sa;
    const dZ = 0.45 * sa + 0.425 * ca;
    const meshY = stepY + risePerStep / 2;
    collisionWorld.addBox(px - dX, meshY - 0.09, pz - dZ, px + dX, meshY + 0.09, pz + dZ, 'stone', 0.18);
  }

  // ═════════════════════════════════════════════
  // SECTION C: WEST WING SERVICE STAIRCASE
  // ═════════════════════════════════════════════

  const serviceX = -15;

  for (let i = 0; i < 12; i++) {
    addStep(serviceX, i * 0.375, -1 - i * 0.3, 2.0, 0.375, 0.3, M_STONE);
  }
  addFloor(serviceX, 4.5, -5.0, 2.0, 1.5, M_STONE_FLOOR, 'stone');

  for (let i = 0; i < 12; i++) {
    addStep(serviceX, 4.5 + i * 0.375, -5.5 - i * 0.3, 2.0, 0.375, 0.3, M_STONE);
  }
  addFloor(serviceX, 9.0, -9.5, 2.0, 1.5, M_STONE_FLOOR, 'stone');

  for (let i = 0; i < 12; i++) {
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.375, 2.0),
      M_STONE
    );
    const sx = -15 + i * 0.3;
    const sy = 9.0 + i * 0.375;
    stepMesh.position.set(sx + 0.15, sy + 0.375 / 2, -11.5);
    stepMesh.castShadow = true;
    stepMesh.receiveShadow = true;
    scene.add(stepMesh);
    collisionWorld.addBox(sx, sy, -12.5, sx + 0.3, sy + 0.375, -10.5, 'stone', 0.375);
  }

  function buildRopeGuide(start, end) {
    const curve = new THREE.CatmullRomCurve3([start, end]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 6, 0.015, 4, false),
      M_ROPE
    );
    scene.add(tube);
  }

  buildRopeGuide(
    new THREE.Vector3(serviceX + 0.5, 0.9, -1),
    new THREE.Vector3(serviceX + 0.5, 4.5 + 0.9, -4.6),
  );
  buildRopeGuide(
    new THREE.Vector3(-14.8, 9.0 + 0.9, -11.5),
    new THREE.Vector3(-11.2, 13.5 + 0.9, -11.5),
  );

  for (let fp = 0; fp < 4; fp++) {
    const t = fp / 3;
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.12, 4),
      M_IRON
    );
    pin.position.set(serviceX + 0.5, 0.9 + t * 4.5, -1 - t * 3.6);
    scene.add(pin);
  }
  for (let fp = 0; fp < 4; fp++) {
    const t = fp / 3;
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.12, 4),
      M_IRON
    );
    pin.position.set(-14.8 + t * 3.6, 9.0 + 0.9 + t * 4.5, -11.5);
    scene.add(pin);
  }

  // ═════════════════════════════════════════════
  // SECTION D: BASEMENT TRAPDOOR AND DESCENT
  // ═════════════════════════════════════════════

  collisionWorld.addBox(-17, -0.25, -2, -12.6, 0, 6, 'stone', 0);
  collisionWorld.addBox(-11.4, -0.25, -2, -7, 0, 6, 'stone', 0);
  collisionWorld.addBox(-12.6, -0.25, -2, -11.4, 0, 1.5, 'stone', 0);
  collisionWorld.addBox(-12.6, -0.25, 2.5, -11.4, 0, 6, 'stone', 0);
  collisionWorld.addBox(-12.6, -0.25, 1.78, -11.4, 0, 2.5, 'stone', 0);

  const trapdoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.06, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x2d1f0e, roughness: 0.9 })
  );
  trapdoor.position.set(-12, 0.03, 2.5);
  trapdoor.rotation.x = -1.22;
  const hingeZ = 0.5 * Math.sin(1.22);
  trapdoor.position.z += hingeZ;
  scene.add(trapdoor);

  const ringGeo = new THREE.TorusGeometry(0.07, 0.01, 6, 12);
  const ring = new THREE.Mesh(ringGeo, M_IRON);
  ring.position.set(-12, 0.06, 2.5 + hingeZ);
  ring.rotation.x = Math.PI / 2;
  trapdoor.add(ring);

  for (let i = 0; i < 10; i++) {
    addStep(-12, -0.35 * i - 0.35, 1.5 + i * 0.28, 2.0, 0.35, 0.28, M_STONE);
  }

  addFloor(-12, -3.75, -1.5, 2.0, 2.5, M_STONE_FLOOR, 'stone');
}

export const collidables = [];

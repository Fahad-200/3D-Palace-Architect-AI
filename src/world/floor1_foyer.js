import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';

const M_MARBLE = materials.marble_checkerboard;
const M_PLASTER = materials.plaster_aged;
const M_STONE_CEILING = materials.stone_ceiling_vault;
const M_BRASS = new THREE.MeshStandardMaterial({ color: 0x8b7040, roughness: 0.55, metalness: 0.5 });
const M_CRYSTAL = new THREE.MeshStandardMaterial({ color: 0xdde8ff, transparent: true, opacity: 0.65, roughness: 0.08, metalness: 0.1 });
const M_PILASTER = new THREE.MeshStandardMaterial({ color: 0xa89e90, roughness: 0.85 });
const M_CAPITAL = new THREE.MeshStandardMaterial({ color: 0xb0a698, roughness: 0.8 });
const M_CORNICE = new THREE.MeshStandardMaterial({ color: 0xc0b8a8, roughness: 0.8 });
const M_MEDALLION = new THREE.MeshStandardMaterial({ color: 0xa09080, roughness: 0.8 });
const M_CRACK = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 1.0 });
const M_GILT = new THREE.MeshStandardMaterial({ color: 0xa08820, roughness: 0.4, metalness: 0.35 });
const M_COBWEB = new THREE.MeshStandardMaterial({ color: 0xd0c8b8, transparent: true, opacity: 0.2, roughness: 1.0, side: THREE.DoubleSide });
const M_PEDESTAL = new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.25, metalness: 0.05 });
const M_BUST = new THREE.MeshStandardMaterial({ color: 0xc0b8a8, roughness: 0.7 });
const M_FRAG = new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.8 });
const M_FRAG2 = new THREE.MeshStandardMaterial({ color: 0xc0b0a0, roughness: 0.75 });
const leafColors = [0x6b4a1f, 0x5a3d18, 0x7a5228, 0x4a3010, 0x8a5a20];

function addCobweb(x, y, z, rx, ry, rz, scaleX, scaleY, phase) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(scaleX, scaleY, 3, 3), M_COBWEB);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.userData.isCobweb = true;
  mesh.userData.phase = phase;
  scene.add(mesh);
}

function createPainting(x, y, z, rotY, condition) {
  // Top rail
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.07, 0.06), M_GILT);
  topRail.position.set(x, y + 1.15, z);
  topRail.rotation.y = rotY;
  scene.add(topRail);

  // Bottom rail
  const botRail = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.07, 0.06), M_GILT);
  botRail.position.set(x, y - 1.15, z);
  botRail.rotation.y = rotY;
  scene.add(botRail);

  // Left stile — offset in local X (perpendicular to Z after rotY)
  const localX = 0.965;
  const lOff = new THREE.Vector3(-localX, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  const leftStile = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.3, 0.06), M_GILT);
  leftStile.position.set(x + lOff.x, y, z + lOff.z);
  leftStile.rotation.y = rotY;
  scene.add(leftStile);

  const rOff = new THREE.Vector3(localX, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  const rightStile = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.3, 0.06), M_GILT);
  rightStile.position.set(x + rOff.x, y, z + rOff.z);
  rightStile.rotation.y = rotY;
  scene.add(rightStile);

  // Canvas
  const canvasMat = new THREE.MeshStandardMaterial({
    color: condition === 'slashed' ? 0x2a2020 : 0x1e2418,
    roughness: 0.95
  });
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 2.16), canvasMat);
  const fwd = new THREE.Vector3(0, 0, 0.04).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  canvas.position.set(x + fwd.x, y, z + fwd.z);
  canvas.rotation.y = rotY;
  scene.add(canvas);

  if (condition === 'slashed') {
    const slash = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.0, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x100808, roughness: 1.0 }));
    const sfwd = new THREE.Vector3(0, 0, 0.06).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    slash.position.set(x + sfwd.x, y, z + sfwd.z);
    slash.rotation.y = rotY;
    slash.rotation.z = 0.6;
    scene.add(slash);
  }

  if (condition === 'molded') {
    for (let m = 0; m < 8; m++) {
      const mold = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.2, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x1a2010, transparent: true, opacity: 0.75 }));
      mold.scale.z = 0.15;
      const mfwd = new THREE.Vector3(0, 0, 0.07).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      const mside = new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      mold.position.set(x + mside.x + mfwd.x, y + (Math.random() - 0.5) * 1.8, z + mside.z + mfwd.z);
      mold.rotation.y = rotY;
      scene.add(mold);
    }
  }

  // Collision: thin wall-mounted box
  const colDepth = 0.1;
  const cFwd = new THREE.Vector3(0, 0, colDepth / 2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  collisionWorld.addBox(
    Math.min(x - 1.0, x + cFwd.x), y - 1.15, Math.min(z - 1.0, z + cFwd.z),
    Math.max(x + 1.0, x + cFwd.x), y + 1.15, Math.max(z + 1.0, z + cFwd.z),
    'stone', 2.3
  );
}

export const collidables = [];

export function init(sc) {
  // ═════════════════════════════════════════════
  // SECTION A: FLOOR
  // ═════════════════════════════════════════════

  // Marble checkerboard overlay on structural floor
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(12, 0.04, 12), M_MARBLE);
  floorMesh.position.set(0, 0.02, 4);
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);
  // No collision — sits atop structural floor

  // Heaved floor sections
  const heaveData = [
    { x: -2.5, z: 6.5, rz: 0.08 },
    { x: 3.2, z: 2.8, rz: -0.08 },
    { x: -4.0, z: 4.5, rz: 0.06 }
  ];
  for (const hv of heaveData) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.3), M_MARBLE);
    tile.position.set(hv.x, 0.03, hv.z);
    tile.rotation.x = 0.14;
    tile.rotation.z = hv.rz;
    tile.receiveShadow = true;
    scene.add(tile);
    collisionWorld.addBox(
      hv.x - 0.7, 0, hv.z - 0.65,
      hv.x + 0.7, 0.1, hv.z + 0.65,
      'marble', 0.1
    );
  }

  // ═════════════════════════════════════════════
  // SECTION B: FALLEN CHANDELIER
  // ═════════════════════════════════════════════

  // Central hub
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.2, 12), M_BRASS);
  hub.position.set(0, 0.25, 4);
  hub.rotation.z = 0.15;
  scene.add(hub);
  collisionWorld.addBox(-0.3, 0, 3.7, 0.3, 0.4, 4.3, 'metal', 0.4);

  // 8 chandelier arms
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const armLength = 1.1 + Math.random() * 0.2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.038, armLength), M_BRASS);
    arm.position.set(
      Math.cos(angle) * armLength * 0.5,
      0.2 + Math.random() * 0.12,
      4 + Math.sin(angle) * armLength * 0.5
    );
    arm.rotation.y = -angle;
    arm.rotation.x = (Math.random() - 0.5) * 0.4;
    scene.add(arm);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), M_BRASS);
    tip.position.set(
      Math.cos(angle) * armLength,
      0.2 + Math.random() * 0.12,
      4 + Math.sin(angle) * armLength
    );
    scene.add(tip);
  }

  // Fallen chain — 5 buckled segments from hub upward
  let chainPos = new THREE.Vector3(0, 0.35, 4);
  for (let s = 0; s < 5; s++) {
    const segLen = 0.4 + Math.random() * 0.8;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, segLen, 5),
      new THREE.MeshStandardMaterial({ color: 0x6a5030, roughness: 0.6, metalness: 0.4 }));
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 0.6,
      0.3 + Math.random() * 0.5,
      (Math.random() - 0.5) * 0.6
    ).normalize();
    chainPos.add(dir.clone().multiplyScalar(segLen * 0.5));
    seg.position.copy(chainPos);
    seg.rotation.x = (Math.random() - 0.5) * 0.6;
    seg.rotation.z = (Math.random() - 0.5) * 0.6;
    scene.add(seg);
    chainPos.add(dir.clone().multiplyScalar(segLen * 0.5));
  }

  // ~60 crystal drops scattered on floor
  for (let i = 0; i < 60; i++) {
    const r = Math.random() * 4.0;
    const a = Math.random() * Math.PI * 2;
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.04 + Math.random() * 0.03), M_CRYSTAL);
    crystal.position.set(Math.cos(a) * r, 0.02 + Math.random() * 0.06, 4 + Math.sin(a) * r);
    crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(crystal);
  }
  collisionWorld.addBox(-4, 0, 0, 4, 0.08, 8, 'rubble', 0.08);

  // ═════════════════════════════════════════════
  // SECTION C: INTERIOR WALL DECORATIONS — PILASTERS
  // ═════════════════════════════════════════════

  for (let i = 0; i < 6; i++) {
    const z = 0 + i * 2.0;

    // West wall pilaster
    const pilW = new THREE.Mesh(new THREE.BoxGeometry(0.18, 7.5, 0.14), M_PILASTER);
    pilW.position.set(-5.75, 3.75, z);
    scene.add(pilW);
    const capW = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.24), M_CAPITAL);
    capW.position.set(-5.72, 7.6, z);
    scene.add(capW);

    // East wall pilaster (mirror)
    const pilE = new THREE.Mesh(new THREE.BoxGeometry(0.18, 7.5, 0.14), M_PILASTER);
    pilE.position.set(5.75, 3.75, z);
    scene.add(pilE);
    const capE = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.24), M_CAPITAL);
    capE.position.set(5.72, 7.6, z);
    scene.add(capE);
  }

  // Painted plaster panels between pilasters
  for (let i = 0; i < 5; i++) {
    const z = 1 + i * 2.0;

    // West wall panel
    const panelW = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), M_PLASTER);
    panelW.position.set(-5.78, 3.5, z);
    panelW.rotation.y = Math.PI / 2;
    scene.add(panelW);

    // East wall panel
    const panelE = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), M_PLASTER);
    panelE.position.set(5.78, 3.5, z);
    panelE.rotation.y = -Math.PI / 2;
    scene.add(panelE);
  }

  // ═════════════════════════════════════════════
  // SECTION D: OIL PAINTINGS
  // ═════════════════════════════════════════════

  // Left: west wall, slashed
  createPainting(-5.8, 3.2, 4.0, Math.PI / 2, 'slashed');
  // Right: east wall, molded
  createPainting(5.8, 3.2, 4.0, -Math.PI / 2, 'molded');

  // ═════════════════════════════════════════════
  // SECTION E: MARBLE PEDESTAL AND BUST FRAGMENTS
  // ═════════════════════════════════════════════

  // Pedestal
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.1, 12), M_PEDESTAL);
  pedestal.position.set(-4.5, 0.55, 7.5);
  pedestal.castShadow = true;
  scene.add(pedestal);
  collisionWorld.addBox(-4.75, 0, 7.25, -4.25, 1.1, 7.75, 'marble', 1.1);

  // Bust head fragment (largest, lying on side)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 7, 7), M_BUST);
  head.scale.set(0.9, 1.1, 0.85);
  head.position.set(-4.1, 0.2, 7.4);
  head.rotation.set(0.9, 0.5, 0.7);
  head.castShadow = true;
  scene.add(head);
  collisionWorld.addBox(-4.3, 0, 7.2, -3.9, 0.38, 7.6, 'marble', 0.38);

  // Fragment 1
  const frag1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), M_FRAG);
  frag1.position.set(-3.9, 0.1, 7.15);
  frag1.rotation.set(Math.random(), Math.random(), Math.random());
  scene.add(frag1);
  collisionWorld.addBox(-4.0, 0, 7.05, -3.8, 0.18, 7.25, 'marble', 0.18);

  // Fragment 2
  const frag2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), M_FRAG2);
  frag2.position.set(-4.35, 0.07, 7.6);
  frag2.rotation.set(Math.random(), Math.random(), Math.random());
  scene.add(frag2);

  // ═════════════════════════════════════════════
  // SECTION F: COBWEBS
  // ═════════════════════════════════════════════

  addCobweb(-5.7, 7.5, 0, 0, 0, 0.78, 0.8, 0.6, 0);        // NW upper corner
  addCobweb(5.7, 7.5, 0, 0, Math.PI, -0.78, 0.8, 0.6, 1);  // NE upper corner
  addCobweb(-5.7, 7.5, 8, 0, 0, -0.78, 0.9, 0.7, 2);
  addCobweb(5.7, 7.5, 8, 0, 0, 0.78, 0.7, 0.6, 3);
  addCobweb(0, 7.7, -1.7, -1.1, 0, 0, 1.2, 0.5, 4);         // above north door archway
  addCobweb(-3, 7.2, 9.8, 0, 0, 0.5, 0.6, 0.5, 5);
  addCobweb(2, 7.4, 9.4, 0, 0, -0.4, 0.55, 0.45, 6);
  addCobweb(-5.65, 5.0, 4, 0, Math.PI / 2, 0.3, 0.6, 0.4, 7); // over left painting

  // ═════════════════════════════════════════════
  // SECTION G: CEILING DETAIL
  // ═════════════════════════════════════════════

  // Decorative plaster ceiling surface (structural ceiling at Y=8.0 from shell.js)
  const ceilingPlate = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.04, 11.8), M_STONE_CEILING);
  ceilingPlate.position.set(0, 7.97, 4);
  scene.add(ceilingPlate);

  // Chandelier mounting medallion
  const medallion = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 8, 20), M_MEDALLION);
  medallion.position.set(0, 7.96, 4);
  medallion.rotation.x = Math.PI / 2;
  scene.add(medallion);

  // Radiating cracks from mounting point
  for (let c = 0; c < 8; c++) {
    const angle = (c / 8) * Math.PI * 2 + Math.random() * 0.3;
    const len = 0.8 + Math.random() * 1.8;

    const crk = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.015, len), M_CRACK);
    crk.position.set(Math.cos(angle) * len * 0.5, 7.975, 4 + Math.sin(angle) * len * 0.5);
    crk.rotation.y = angle;
    scene.add(crk);

    // 1-2 secondary branches
    if (Math.random() > 0.4) {
      const branchAngle = angle + (Math.random() - 0.5) * 0.8;
      const branchLen = len * 0.3 + Math.random() * 0.4;
      const brch = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, branchLen), M_CRACK.clone());
      brch.position.set(
        Math.cos(angle) * len * 0.7 + Math.cos(branchAngle) * branchLen * 0.5,
        7.975,
        4 + Math.sin(angle) * len * 0.7 + Math.sin(branchAngle) * branchLen * 0.5
      );
      brch.rotation.y = branchAngle;
      scene.add(brch);
    }
  }

  // Cornices (all 4 sides)
  const corniceN = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.18, 0.22), M_CORNICE);
  corniceN.position.set(0, 7.87, -2.11);
  scene.add(corniceN);

  const corniceS = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.18, 0.22), M_CORNICE);
  corniceS.position.set(0, 7.87, 10.11);
  scene.add(corniceS);

  const corniceW = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 12.0), M_CORNICE);
  corniceW.position.set(-5.89, 7.87, 4);
  scene.add(corniceW);

  const corniceE = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 12.0), M_CORNICE);
  corniceE.position.set(5.89, 7.87, 4);
  scene.add(corniceE);

  // ═════════════════════════════════════════════
  // SECTION H: DEAD LEAVES NEAR ENTRANCE
  // ═════════════════════════════════════════════

  for (let i = 0; i < 22; i++) {
    const leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1 + Math.random() * 0.08, 0.07 + Math.random() * 0.05),
      new THREE.MeshStandardMaterial({
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        roughness: 1.0,
        side: THREE.DoubleSide
      })
    );
    leaf.position.set((Math.random() - 0.5) * 3.5, 0.005, 9 + Math.random() * 2);
    leaf.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.15, Math.random() * Math.PI * 2, 0);
    leaf.receiveShadow = true;
    scene.add(leaf);
  }
}

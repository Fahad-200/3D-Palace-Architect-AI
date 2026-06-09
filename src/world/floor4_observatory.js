import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture } from '../geometry.js?v=2';

const M_STONE = materials.stone_flags;
const M_CEILING = materials.stone_ceiling_vault;
const M_LIMESTONE = materials.limestone_ashlar;
const M_BRASS = new THREE.MeshStandardMaterial({ color: 0xb08030, roughness: 0.4, metalness: 0.6 });
const M_BRASS_TARN = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, roughness: 0.55, metalness: 0.45 });
const M_WALNUT = materials.dark_walnut;
const M_IRON = materials.iron_rusted;

const CX = 17.5, CZ = -10.0, FLOOR_Y = 22.0, CEIL_Y = 26.0;

function buildPart1() {

/* SECTION 1: FLOOR AND CEILING */

const floorDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.25, 16), M_STONE);
floorDisc.position.set(CX, FLOOR_Y + 0.125, CZ);
floorDisc.receiveShadow = true;
scene.add(floorDisc);
collisionWorld.addBox(15.1, FLOOR_Y, -12.4, 19.9, FLOOR_Y + 0.25, -7.6, 'stone', 0);

const ceilDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.04, 16), M_CEILING);
ceilDisc.position.set(CX, CEIL_Y - 0.02, CZ);
scene.add(ceilDisc);

for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  const wx = CX + Math.cos(a) * 2.2;
  const wz = CZ + Math.sin(a) * 2.2;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 3.8), M_LIMESTONE);
  panel.position.set(wx, FLOOR_Y + 1.9, wz);
  panel.rotation.y = a + Math.PI;
  scene.add(panel);
}

/* SECTION 2: 8 ARROWSLIT WINDOWS */

for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  const wx = CX + Math.cos(a) * 2.35;
  const wz = CZ + Math.sin(a) * 2.35;
  const wY = FLOOR_Y + 0.5;
  const intact = i !== 3 && i !== 6;
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.85),
    new THREE.MeshStandardMaterial({ color: intact ? 0x404c54 : 0x000000, transparent: true, opacity: intact ? 0.45 : 0, roughness: 0.2 }));
  pane.position.set(wx, wY, wz);
  pane.rotation.y = a + Math.PI;
  scene.add(pane);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x8c8276, roughness: 0.9 }));
  sill.position.set(CX + Math.cos(a) * 2.1, wY - 0.4, CZ + Math.sin(a) * 2.1);
  sill.rotation.y = a;
  scene.add(sill);
}
}

export const moonbeamBandPosition = new THREE.Vector3(
  CX + Math.cos((2 / 8) * Math.PI * 2) * 1.2,
  FLOOR_Y + 0.8,
  CZ + Math.sin((2 / 8) * Math.PI * 2) * 1.2
);

function buildPart2() {

/* SECTION 3: BRASS TELESCOPE */

const ta = (2 / 8) * Math.PI * 2;
const tDist = 1.3;
const tX = CX + Math.cos(ta) * tDist;
const tZ = CZ + Math.sin(ta) * tDist;

for (let l = 0; l < 3; l++) {
  const la = (l / 3) * Math.PI * 2;
  const len = l === 0 ? 0.65 : 0.85;
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 6), M_BRASS_TARN);
  leg.position.set(tX + Math.cos(la) * 0.2, FLOOR_Y + len / 2, tZ + Math.sin(la) * 0.2);
  leg.rotation.z = Math.cos(la) * 0.12;
  leg.rotation.x = Math.sin(la) * 0.12;
  scene.add(leg);
  collisionWorld.addBox(leg.position.x - 0.04, FLOOR_Y, leg.position.z - 0.04, leg.position.x + 0.04, FLOOR_Y + len, leg.position.z + 0.04, 'metal', len);
}

const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), M_BRASS);
pivot.position.set(tX, FLOOR_Y + 0.85, tZ);
scene.add(pivot);

const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 1.2, 8), M_BRASS);
tube.position.set(tX, FLOOR_Y + 0.95, tZ);
tube.rotation.y = ta + Math.PI;
tube.rotation.x = -0.15;
scene.add(tube);

const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 8), M_BRASS);
eyepiece.position.set(tX, FLOOR_Y + 0.95, tZ);
eyepiece.rotation.y = ta + Math.PI;
eyepiece.rotation.x = -0.15;
eyepiece.position.x += Math.sin(ta + Math.PI) * 0.6;
eyepiece.position.z += Math.cos(ta + Math.PI) * 0.6;
scene.add(eyepiece);

const objLens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 8), M_BRASS);
objLens.position.set(tX, FLOOR_Y + 0.95, tZ);
objLens.rotation.y = ta + Math.PI;
objLens.rotation.x = -0.15;
objLens.position.x += Math.sin(ta) * 0.6;
objLens.position.z += Math.cos(ta) * 0.6;
scene.add(objLens);

const lensFace = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8),
  new THREE.MeshStandardMaterial({ color: 0x304050, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.6 }));
lensFace.position.set(tX + Math.sin(ta) * 0.64, FLOOR_Y + 0.95, tZ + Math.cos(ta) * 0.64);
lensFace.rotation.y = ta;
lensFace.rotation.x = -0.15;
scene.add(lensFace);

const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), M_BRASS);
knob.position.set(tX + Math.sin(ta + Math.PI / 2) * 0.08, FLOOR_Y + 0.95, tZ + Math.cos(ta + Math.PI / 2) * 0.08);
scene.add(knob);

const arc = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 6, 12, Math.PI), M_BRASS);
arc.position.set(tX, FLOOR_Y + 0.87, tZ);
arc.rotation.x = Math.PI / 2;
scene.add(arc);

/* SECTION 4: STARCHART CORKBOARD AND BOOKS */

const cAngle = (4.5 / 8) * Math.PI * 2;
const cDist = 2.2;
const cork = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.04),
  new THREE.MeshStandardMaterial({ color: 0x8a6840, roughness: 1.0 }));
cork.position.set(CX + Math.cos(cAngle) * cDist, FLOOR_Y + 1.2, CZ + Math.sin(cAngle) * cDist);
cork.rotation.y = cAngle + Math.PI;
scene.add(cork);

for (let map = 0; map < 3; map++) {
  const starTex = makeTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, w, h);
    for (let s = 0; s < 80; s++) {
      const sr = Math.random();
      ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, sr * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,240,${0.4 + sr * 0.5})`; ctx.fill();
    }
    ctx.strokeStyle = 'rgba(180,180,220,0.3)'; ctx.lineWidth = 0.5;
    for (let c = 0; c < 8; c++) { ctx.beginPath(); ctx.moveTo(Math.random() * w, Math.random() * h); ctx.lineTo(Math.random() * w, Math.random() * h); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(80,80,120,0.3)'; ctx.lineWidth = 0.5;
    for (let g = 0; g < 6; g++) { const x = (g / 5) * w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let g = 0; g < 6; g++) { const y = (g / 5) * h; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(120,90,50,0.2)'; ctx.fillRect(0, 0, w, h);
  });
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.28),
    new THREE.MeshStandardMaterial({ map: starTex, roughness: 0.8 }));
  chart.position.set(CX + Math.cos(cAngle) * cDist + (map - 1) * 0.2, FLOOR_Y + 1.2 + (map - 1) * 0.08, CZ + Math.sin(cAngle) * cDist + 0.03);
  chart.rotation.y = cAngle + Math.PI;
  if (map === 0) chart.scale.x = 0.92;
  if (map === 0) chart.rotation.x = 0.12;
  scene.add(chart);
  for (let p = 0; p < 3; p++) {
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6),
      new THREE.MeshStandardMaterial({ color: p === 1 ? 0xcc2222 : 0xb08030, roughness: 0.4 }));
    pin.position.set(chart.position.x + (p - 1) * 0.15, chart.position.y + 0.12, chart.position.z);
    scene.add(pin);
  }
}

for (let n = 0; n < 2; n++) {
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.07),
    new THREE.MeshStandardMaterial({ color: 0xd0c8a0, roughness: 0.9 }));
  note.position.set(CX + Math.cos(cAngle) * cDist + (n - 0.5) * 0.3, FLOOR_Y + 0.95, CZ + Math.sin(cAngle) * cDist + 0.03);
  note.rotation.y = cAngle + Math.PI;
  scene.add(note);
}

for (let s = 0; s < 6; s++) {
  const sa = (s / 6) * Math.PI * 2 + 0.2;
  for (let seg = 0; seg < 3; seg++) {
    const segA = sa + (seg - 1) * 0.08;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.035, 0.35), M_WALNUT);
    shelf.position.set(CX + Math.cos(segA) * 2.0, FLOOR_Y + 0.5 + s * 0.35, CZ + Math.sin(segA) * 2.0);
    shelf.rotation.y = segA + Math.PI / 2;
    scene.add(shelf);
  }
}

/* SECTION 5: TRAPDOOR */

const trapdoor = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.85), M_WALNUT);
trapdoor.position.set(CX, FLOOR_Y + 0.06 / 2, CZ);
scene.add(trapdoor);

const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 6, 10), M_IRON);
ring.position.set(CX, FLOOR_Y + 0.06, CZ);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

[-0.35, 0.35].forEach(ox => {
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.08), M_IRON);
  hinge.position.set(CX + ox, FLOOR_Y + 0.03, CZ + 0.4);
  scene.add(hinge);
});

const keyplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.02), M_IRON);
keyplate.position.set(CX, FLOOR_Y + 0.04, CZ + 0.35);
scene.add(keyplate);
}

export function init(scene) {
  buildPart1();
  buildPart2();
}

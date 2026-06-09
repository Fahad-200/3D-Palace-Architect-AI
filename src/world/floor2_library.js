import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture } from '../geometry.js?v=2';

const M_WALNUT = materials.dark_walnut;
const M_PLASTER = materials.plaster_aged;
const M_BRASS = new THREE.MeshStandardMaterial({ color: 0xb08030, metalness: 0.7, roughness: 0.3 });
const M_DESK = materials.dark_wood_furniture;
const M_IRON = materials.iron_rusted;
const M_VELVET = materials.velvet_crimson_aged;
const M_LEATHER = new THREE.MeshStandardMaterial({ color: 0x2a4020, roughness: 1.0 });
const M_BOOK_COLORS = [0x3d1a0a, 0x1a2e1a, 0x1a1a3d, 0x4a3d10, 0x2a1a0a];

/* SECTION 1: FLOOR AND WALLS */

function build() {
const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.035, 7), M_WALNUT);
floor.position.set(8.5, 4.535, -6.5);
floor.receiveShadow = true;
scene.add(floor);

const WALL_THICK = 0.04;
const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(8, 5, WALL_THICK), M_PLASTER);
wallNorth.position.set(8.5, 7, -10 + WALL_THICK / 2);
scene.add(wallNorth);
const wallWest = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK, 5, 7), M_PLASTER);
wallWest.position.set(4.5 + WALL_THICK / 2, 7, -6.5);
scene.add(wallWest);
const wallEast = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK, 5, 7), M_PLASTER);
wallEast.position.set(12.5 - WALL_THICK / 2, 7, -6.5);
scene.add(wallEast);

/* SECTION 2: FLOOR-TO-CEILING BOOKSHELVES */

function makeBooksTexture() {
  return makeTexture(256, 64, (ctx, w, h) => {
    let cx = 0;
    while (cx < w) {
      const bw = 8 + Math.floor(Math.random() * 12);
      const bh = 40 + Math.floor(Math.random() * 20);
      const colors = ['#3d1a0a', '#1a2e1a', '#1a1a3d', '#4a3d10', '#2a1a0a', '#3d2a10', '#1a3d2a', '#3d1a2a'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(cx, h - bh, bw - 1, bh);
      ctx.fillStyle = 'rgba(200,180,140,0.3)';
      ctx.fillRect(cx + 2, h - bh + 4, bw - 5, 1);
      cx += bw;
    }
  });
}

const booksTex = makeBooksTexture();
const M_BOOKS_STRIP = new THREE.MeshStandardMaterial({ map: booksTex, roughness: 0.9 });

function createShelfUnit(x, z, rotY, hasFallenBooks) {
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.0, 0.04), M_WALNUT);
  back.position.set(x, 4.5 + 2.5, z);
  back.rotation.y = rotY;
  scene.add(back);

  const shelfYOffsets = [0.02, 0.62, 1.22, 1.82, 2.42, 3.05, 3.68, 4.30, 4.92];
  shelfYOffsets.forEach(dy => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.035, 0.32), M_WALNUT);
    shelf.position.set(x, 4.5 + dy, z + 0.14 * Math.cos(rotY));
    shelf.rotation.y = rotY;
    scene.add(shelf);
  });

  [-0.5, +0.5].forEach(ox => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.04, 5.0, 0.32), M_WALNUT);
    side.position.set(x + ox * Math.cos(rotY), 4.5 + 2.5, z + ox * Math.sin(rotY));
    side.rotation.y = rotY;
    scene.add(side);
  });

  for (let s = 0; s < 7; s++) {
    const shelfY = 4.5 + shelfYOffsets[s + 1] - 0.32;
    const bookStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.52), M_BOOKS_STRIP);
    bookStrip.position.set(x, shelfY + 0.26, z + 0.155 * Math.cos(rotY));
    bookStrip.rotation.y = rotY > 0 ? rotY - Math.PI : rotY + Math.PI;
    scene.add(bookStrip);
  }

  if (hasFallenBooks) {
    for (let b = 0; b < 7; b++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.04 + Math.random() * 0.02, 0.22 + Math.random() * 0.08, 0.16 + Math.random() * 0.05),
        new THREE.MeshStandardMaterial({ color: M_BOOK_COLORS[Math.floor(Math.random() * 5)], roughness: 0.9 })
      );
      book.position.set(x + (Math.random() - 0.5) * 0.9, 4.5 + Math.random() * 0.12, z + Math.random() * 0.4);
      book.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
      scene.add(book);
      collisionWorld.addBox(book.position.x - 0.06, 4.5, book.position.z - 0.1, book.position.x + 0.06, 4.5 + 0.25, book.position.z + 0.1, 'wood', 0.25);
    }
  }

  const halfW = 0.5, halfD = 0.16;
  if (rotY === 0) {
    collisionWorld.addBox(x - halfW, 4.5, z - halfD, x + halfW, 9.5, z + halfD, 'wood', 5.0);
  } else if (rotY === Math.PI / 2 || rotY === -Math.PI / 2) {
    collisionWorld.addBox(x - halfD, 4.5, z - halfW, x + halfD, 9.5, z + halfW, 'wood', 5.0);
  }
}

for (let i = 0; i < 7; i++) createShelfUnit(5.1 + i * 1.05, -9.85, 0, i === 5);
for (let i = 0; i < 5; i++) createShelfUnit(4.7, -3.5 - i * 1.25, Math.PI / 2, i === 2);
for (let i = 0; i < 5; i++) createShelfUnit(12.3, -3.5 - i * 1.25, -Math.PI / 2, i === 4);

/* SECTION 3: ROLLING LIBRARY LADDERS */

const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 7, 8), M_BRASS);
rail.rotation.z = Math.PI / 2;
rail.position.set(8.5, 9.2, -9.82);
scene.add(rail);

[5.5, 6.5, 7.5, 8.5, 9.5].forEach(rx => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 8), M_BRASS);
  ring.position.set(rx, 9.2, -9.82);
  scene.add(ring);
});

const uprightLadder = new THREE.Group();
for (let r = 0; r < 12; r++) {
  const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 6), M_WALNUT);
  rung.position.set(0, 0.1 + r * (2.1 - 0.2) / 11, 0);
  rung.rotation.x = Math.PI / 2;
  uprightLadder.add(rung);
}
[-0.19, 0.19].forEach(ox => {
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.025, 2.1, 0.025), M_WALNUT);
  side.position.set(ox, 1.05, 0);
  uprightLadder.add(side);
});
uprightLadder.position.set(8.5, 4.5, -9.65);
uprightLadder.rotation.x = -0.08;
scene.add(uprightLadder);
collisionWorld.addBox(8.28, 4.5, -9.85, 8.72, 6.6, -9.45, 'wood', 2.1);

const fallenLadder = new THREE.Group();
for (let r = 0; r < 12; r++) {
  const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 6), M_WALNUT);
  rung.position.set(0.1 + r * (2.1 - 0.2) / 11, 0, 0);
  rung.rotation.y = Math.PI / 2;
  fallenLadder.add(rung);
}
[-0.19, 0.19].forEach(ox => {
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 2.1), M_WALNUT);
  side.position.set(1.05, 0, ox);
  fallenLadder.add(side);
});
fallenLadder.position.set(5.2, 4.5 + 0.04, -5.5);
fallenLadder.rotation.z = Math.PI / 2;
fallenLadder.rotation.y = 0.4;
scene.add(fallenLadder);
collisionWorld.addBox(4.8, 4.5, -6.0, 6.0, 5.5, -5.0, 'wood', 1.0);

/* SECTION 4: CENTRAL READING TABLE AND PROPS */

const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.1), M_DESK);
deskTop.position.set(8.5, 4.5 + 0.78, -6.5);
scene.add(deskTop);
[[-1.05, -0.48], [1.05, -0.48], [-1.05, 0.48], [1.05, 0.48]].forEach(([lx, lz]) => {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.78, 0.1), M_DESK);
  leg.position.set(8.5 + lx, 4.5 + 0.39, -6.5 + lz);
  scene.add(leg);
});
const leather = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 0.95), M_LEATHER);
leather.position.set(8.5, 5.29, -6.5);
leather.rotation.x = -Math.PI / 2;
scene.add(leather);
for (let c = 0; c < 8; c++) {
  const crack = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.001, 0.02 + Math.random() * 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1a1a0a }));
  crack.position.set(8.5 + (Math.random() - 0.5) * 1.8, 5.291, -6.5 + (Math.random() - 0.5) * 0.8);
  crack.rotation.z = (Math.random() - 0.5) * 0.3;
  scene.add(crack);
}
collisionWorld.addBox(7.38, 4.5, -7.05, 9.62, 5.36, -5.95, 'wood', 0.86);

const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.26, 8), M_IRON);
lampBase.position.set(8.8, 5.29 + 0.13, -6.8);
lampBase.rotation.z = 0.78;
scene.add(lampBase);
const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.2, 8),
  new THREE.MeshStandardMaterial({ color: 0x604830, transparent: true, opacity: 0.5 }));
chimney.position.set(8.8, 5.29 + 0.13, -6.8);
chimney.rotation.z = 0.78;
scene.add(chimney);

const pileY = 5.29;
const pileZ = -6.3;
for (let b = 0; b < 4; b++) {
  const bw = 0.28 + Math.random() * 0.07;
  const bh = 0.04 + Math.random() * 0.02;
  const bd = 0.22 + Math.random() * 0.06;
  const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd),
    new THREE.MeshStandardMaterial({ color: 0x3d2a1a, roughness: 0.9 }));
  book.position.set(8.1 + (b - 1.5) * 0.015, pileY + bh / 2 + b * 0.04, pileZ);
  if (b === 3) {
    book.rotation.z = 0.3;
  }
  scene.add(book);
}
const topBookL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.24),
  new THREE.MeshStandardMaterial({ color: 0x3d2a1a, roughness: 0.9 }));
topBookL.position.set(8.1, pileY + 0.22, pileZ - 0.01);
topBookL.rotation.z = 0.3;
scene.add(topBookL);
const topBookR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.24),
  new THREE.MeshStandardMaterial({ color: 0x3d2a1a, roughness: 0.9 }));
topBookR.position.set(8.1, pileY + 0.22, pileZ + 0.01);
topBookR.rotation.z = -0.3;
scene.add(topBookR);

const weight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6),
  new THREE.MeshStandardMaterial({ color: 0x809080, roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.7 }));
weight.position.set(8.9, 5.35, -6.3);
scene.add(weight);

for (let p = 0; p < 3; p++) {
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xd8ceb0, roughness: 1.0, side: THREE.DoubleSide }));
  paper.position.set(8.5 + (p - 1) * 0.1, 5.29, -6.7 + p * 0.02);
  paper.rotation.y = (p - 1) * 0.08;
  paper.rotation.x = -Math.PI / 2;
  scene.add(paper);
}

/* SECTION 5: GLOBE STAND AND CHESTERFIELD */

const globeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8), M_WALNUT);
globeShaft.position.set(12.0, 4.5 + 0.4, -5.0);
scene.add(globeShaft);
for (let a = 0; a < 3; a++) {
  const ang = (a / 3) * Math.PI * 2;
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5), M_WALNUT);
  leg.position.set(12.0 + Math.sin(ang) * 0.18, 4.5 + 0.08, -5.0 + Math.cos(ang) * 0.18);
  leg.rotation.z = Math.sin(ang) * 0.35;
  leg.rotation.x = Math.cos(ang) * 0.35;
  scene.add(leg);
}
const mount = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 12), M_BRASS);
mount.position.set(12.0, 4.5 + 0.8, -5.0);
scene.add(mount);

const globeMat = new THREE.MeshStandardMaterial({
  map: makeTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#3a4a5a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7a6a38';
    ctx.beginPath(); ctx.ellipse(w * 0.55, h * 0.35, w * 0.2, h * 0.22, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.15, h * 0.45, w * 0.08, h * 0.3, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.52, h * 0.62, w * 0.07, h * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(180,170,140,0.3)'; ctx.lineWidth = 0.5;
    for (let lat = 0; lat < h; lat += h / 6) { ctx.beginPath(); ctx.moveTo(0, lat); ctx.lineTo(w, lat); ctx.stroke(); }
    for (let lon = 0; lon < w; lon += w / 8) { ctx.beginPath(); ctx.moveTo(lon, 0); ctx.lineTo(lon, h); ctx.stroke(); }
  }),
  roughness: 0.8
});
const globeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), globeMat);
globeMesh.position.set(12.0, 4.5 + 0.8 + 0.22, -5.0);
scene.add(globeMesh);

const crackInner = new THREE.Mesh(
  new THREE.SphereGeometry(0.19, 8, 6, 0, Math.PI * 0.7),
  new THREE.MeshStandardMaterial({ color: 0xd0c8b8, roughness: 0.9, side: THREE.BackSide })
);
crackInner.position.copy(globeMesh.position);
crackInner.rotation.y = 0.8;
scene.add(crackInner);

for (let p = 0; p < 4; p++) {
  const peel = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x7a6a38, roughness: 0.7, side: THREE.DoubleSide }));
  peel.position.set(12.0 + (Math.random() - 0.5) * 0.35, 4.5 + 0.8 + 0.22 + (Math.random() - 0.5) * 0.2, -5.0 + (Math.random() - 0.5) * 0.35);
  peel.rotation.x = (Math.random() - 0.5) * 0.5;
  peel.rotation.z = (Math.random() - 0.5) * 0.5;
  scene.add(peel);
}

const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.16, 0.68), M_VELVET);
chairSeat.position.set(5.2, 4.5 + 0.45, -4.2);
scene.add(chairSeat);
const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 0.14), M_VELVET);
chairBack.position.set(5.2, 4.5 + 0.87, -4.2 - 0.27);
scene.add(chairBack);
[-0.4, 0.4].forEach(ox => {
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.68), M_VELVET);
  arm.position.set(5.2 + ox, 4.5 + 0.50, -4.2);
  scene.add(arm);
});
const chairBase = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.44, 0.72), M_DESK);
chairBase.position.set(5.2, 4.5 + 0.22, -4.2);
scene.add(chairBase);

for (let t = 0; t < 2; t++) {
  const stuffing = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4),
    new THREE.MeshStandardMaterial({ color: 0xd0c8a0, roughness: 0.9 }));
  stuffing.position.set(5.2 + (t - 0.5) * 0.3, 4.5 + 0.88, -4.2 - 0.28);
  scene.add(stuffing);
}

for (let s = 0; s < 3; s++) {
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.005, 0.005),
    new THREE.MeshStandardMaterial({ color: 0x1a0a08 }));
  seam.position.set(5.2, 4.5 + 0.47, -4.2 + (s - 1) * 0.2);
  scene.add(seam);
}

collisionWorld.addBox(4.82, 4.5, -4.86, 5.58, 4.5 + 0.45, -4.54, 'wood', 0.45);
collisionWorld.addBox(4.83, 4.5, -4.72, 5.57, 5.67, -4.56, 'wood', 1.17);

/* SECTION 6: SPIRAL IRON STAIR TO OBSERVATORY */

const SPIRAL_STEPS = 84;
const SPIRAL_RISE = 17.5;
const SPIRAL_REVS = 3.5;
const risePerStep = SPIRAL_RISE / SPIRAL_STEPS;

const centralColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, SPIRAL_RISE, 12), M_IRON);
centralColumn.position.set(12.0, 4.5 + SPIRAL_RISE / 2, -9.5);
scene.add(centralColumn);
collisionWorld.addBox(11.82, 4.5, -9.68, 12.18, 22.0, -9.32, 'metal', SPIRAL_RISE);

const M_METAL = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, metalness: 0.6 });
const M_RAIL = new THREE.MeshStandardMaterial({ color: 0x3a3028, metalness: 0.6, roughness: 0.7 });

for (let i = 0; i < SPIRAL_STEPS; i++) {
  const angle = (i / SPIRAL_STEPS) * Math.PI * 2 * SPIRAL_REVS;
  const stepY = 4.5 + i * risePerStep;
  const treadR = 0.55;
  const tx = 12.0 + Math.cos(angle) * treadR;
  const tz = -9.5 + Math.sin(angle) * treadR;
  const tread = new THREE.Mesh(new THREE.BoxGeometry(0.7, risePerStep * 0.8, 0.3), M_METAL);
  tread.position.set(tx, stepY + risePerStep * 0.4, tz);
  tread.rotation.y = angle + Math.PI / 2;
  scene.add(tread);
  const rotAngle = angle + Math.PI / 2;
  const ca = Math.abs(Math.cos(rotAngle));
  const sa = Math.abs(Math.sin(rotAngle));
  const dX = 0.35 * ca + 0.15 * sa;
  const dZ = 0.35 * sa + 0.15 * ca;
  collisionWorld.addBox(tx - dX, stepY, tz - dZ, tx + dX, stepY + risePerStep * 0.8, tz + dZ, 'metal', risePerStep * 0.8);

  const railR = 0.85;
  const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6), M_RAIL);
  baluster.position.set(12.0 + Math.cos(angle) * railR, stepY + 0.45, -9.5 + Math.sin(angle) * railR);
  scene.add(baluster);
}

const railPoints = [];
for (let i = 0; i < 168; i++) {
  const t = i / 167;
  const angle = t * Math.PI * 2 * SPIRAL_REVS;
  const stepY = 4.5 + t * SPIRAL_RISE;
  const railR = 0.85;
  railPoints.push(new THREE.Vector3(
    12.0 + Math.cos(angle) * railR, stepY + 0.9, -9.5 + Math.sin(angle) * railR
  ));
}
const railCurve = new THREE.CatmullRomCurve3(railPoints);
const railTube = new THREE.Mesh(
  new THREE.TubeGeometry(railCurve, 168, 0.025, 6, false),
  M_RAIL
);
scene.add(railTube);

const bridgeMat = materials.stone_flags;
const bridgeLength = 5.8;
const bridgeWidth = 1.2;
const bridgeY = 22.0;
const bridge = new THREE.Mesh(
  new THREE.BoxGeometry(bridgeLength, 0.25, bridgeWidth),
  bridgeMat
);
const bridgeCX = 12.0 + (17.5 - 12.0) / 2;
const bridgeCZ = -9.5 + (-10.0 + 9.5) / 2;
bridge.position.set(bridgeCX, bridgeY + 0.125, bridgeCZ);
bridge.receiveShadow = true;
scene.add(bridge);
collisionWorld.addBox(
  bridgeCX - bridgeLength / 2, bridgeY, bridgeCZ - bridgeWidth / 2,
  bridgeCX + bridgeLength / 2, bridgeY + 0.25, bridgeCZ + bridgeWidth / 2,
  'stone', 0
);
}

export function init(scene) {
  build();
}

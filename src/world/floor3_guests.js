import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';

const M_WALNUT = materials.dark_walnut;
const M_DARK_WOOD = materials.dark_wood_furniture;
const M_IRON = materials.iron_rusted;
const M_VELVET = materials.velvet_crimson_aged;
const M_CEILING = materials.stone_ceiling_vault;
const M_STONE = materials.limestone_ashlar;
const M_PLASTER = materials.plaster_aged;
const M_GOLD = new THREE.MeshStandardMaterial({ color: 0x907030, metalness: 0.4, roughness: 0.45 });
const M_WATER_STAIN = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.55 });
const M_MOLD = new THREE.MeshStandardMaterial({ color: 0x1a2010, roughness: 0.95 });
const M_PLASTER_CHUNK = new THREE.MeshStandardMaterial({ color: 0xc0b8a8, roughness: 0.95 });
const leafColors = [0x6b4a1f, 0x5a3d18, 0x7a5228, 0x4a3010, 0x8a5a20];
const M_SHARD = new THREE.MeshStandardMaterial({ color: 0xc0c8d0, metalness: 0.08, roughness: 0.08, side: THREE.DoubleSide });

function buildPart1() {

/* SECTION 6: CORRIDOR WALLS AND FLOOR */

const corrFloor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.035, 16), M_WALNUT);
corrFloor.position.set(0, 9.035, -9);
corrFloor.receiveShadow = true;
scene.add(corrFloor);

const corrCeil = new THREE.Mesh(new THREE.BoxGeometry(8, 0.04, 16), M_CEILING);
corrCeil.position.set(0, 12.47, -9);
scene.add(corrCeil);

const doorAngles = [0.26, 0.70, 0.14, 0.96, 0.38, 1.57];
const doorZ = [-3, -7, -11];

for (let side = 0; side < 2; side++) {
  const wx = side === 0 ? 4 : -4;
  for (let d = 0; d < 3; d++) {
    const dz = doorZ[d];
    const idx = side * 3 + d;
    const angle = doorAngles[idx];
    const doorX = wx + (side === 0 ? 0.44 : -0.44);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.86, 2.18, 0.06), M_WALNUT);
    door.position.set(doorX, 9 + 1.09, dz);
    door.rotation.y = side === 0 ? -angle : angle;
    scene.add(door);
    [-1.22, 0, 1.22].forEach(oy => {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.08), M_IRON);
      hinge.position.set(wx + (side === 0 ? 0.02 : -0.02), 9 + 1.09 + oy, dz);
      scene.add(hinge);
    });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), M_IRON);
    handle.position.set(wx + (side === 0 ? 0.35 : -0.35), 9 + 1.15, dz + 0.04);
    scene.add(handle);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.9), M_PLASTER);
    lintel.position.set(wx, 9 + 2.2 + 0.65, dz);
    scene.add(lintel);
  }
}

/* SECTION 7: ROOM 1 — CHILD'S ROOM (X +4 to +8, Z -1 to -5) */

const r1Floor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.035, 3.8), M_WALNUT);
r1Floor.position.set(6, 9.035, -3);
scene.add(r1Floor);

const childBed = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 0.65), M_IRON);
childBed.position.set(6.5, 9.225, -4.2);
childBed.scale.y = 0.85;
scene.add(childBed);
collisionWorld.addBox(5.95, 9, -4.53, 7.05, 9.45, -3.87, 'metal', 0.45);

const hr = new THREE.MeshStandardMaterial({ color: 0x8a6040, roughness: 0.7 });
const hb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.5, 0.22), hr);
hb.scale.set(1, 0.85, 1);
hb.position.set(5.5, 9 + 0.6, -2.5);
scene.add(hb);
const hh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), hr);
hh.scale.set(0.9, 1.1, 0.8);
hh.position.set(5.9, 9 + 0.75, -2.5);
scene.add(hh);
const muz = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.12), new THREE.MeshStandardMaterial({ color: 0x7a5030, roughness: 0.7 }));
muz.position.set(6.04, 9 + 0.7, -2.5);
scene.add(muz);
[-0.03, 0.03].forEach(oz => {
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), M_IRON);
  n.position.set(6.08, 9 + 0.68, -2.5 + oz); scene.add(n);
});
[-0.04, 0.04].forEach(oz => {
  const e = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9 }));
  e.position.set(5.85, 9 + 0.78, -2.5 + oz); scene.add(e);
});
for (let m = 0; m < 5; m++) {
  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.04), new THREE.MeshStandardMaterial({ color: 0x5a3020, roughness: 0.9 }));
  mane.position.set(5.7 + m * 0.05, 9 + 0.8 + m * 0.04, -2.5 + (Math.random() - 0.5) * 0.06);
  mane.rotation.z = (Math.random() - 0.5) * 0.2; scene.add(mane);
}
[[-0.16, 0.12, 0.12, 0.12], [0.16, 0.12, -0.12, 0.12], [-0.16, -0.12, 0.12, -0.12], [0.16, -0.12, -0.12, -0.12]].forEach(([lx, lz]) => {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), new THREE.MeshStandardMaterial({ color: 0x7a5030, roughness: 0.7 }));
  leg.position.set(5.5 + lx, 9 + 0.2, -2.5 + lz);
  leg.rotation.z = lx * 0.15; leg.rotation.x = lz * 0.15; scene.add(leg);
});
const rocker = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 4, 8, Math.PI), new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: 0.8 }));
rocker.position.set(5.5, 9 + 0.1, -2.5);
rocker.rotation.y = Math.PI / 2;
scene.add(rocker);
const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.2), new THREE.MeshStandardMaterial({ color: 0x5a3020, roughness: 0.95 }));
saddle.position.set(5.5, 9 + 0.82, -2.5);
scene.add(saddle);
collisionWorld.addBox(5.1, 9, -2.9, 5.9, 9.75, -2.1, 'wood', 0.75);

for (let t = 0; t < 3; t++) {
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: [0x8a3a3a, 0x3a6a3a, 0x3a3a8a][t], roughness: 0.8 }));
  block.position.set(6.2 + t * 0.12, 9.04, -2.0); scene.add(block);
}
const childChair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.35), M_DARK_WOOD);
childChair.position.set(7.0, 9 + 0.175, -2.2);
scene.add(childChair);
collisionWorld.addBox(6.8, 9, -2.38, 7.2, 9.35, -2.02, 'wood', 0.35);

/* SECTION 8: ROOM 2 — SHATTERED MIRROR ROOM (X -8 to -4, Z -1 to -5) */

const r2Floor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.035, 3.8), M_WALNUT);
r2Floor.position.set(-6, 9.035, -3);
scene.add(r2Floor);

const mFrame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 0.8), M_GOLD);
mFrame.position.set(-7.5, 9 + 0.9, -3);
mFrame.rotation.z = 0.05;
scene.add(mFrame);
const mBack = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.7), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 }));
mBack.position.set(-7.48, 9 + 0.9, -3);
mBack.rotation.z = 0.05;
scene.add(mBack);

for (let s = 0; s < 18; s++) {
  const size = 0.04 + Math.random() * 0.12;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, size, 0, size * Math.random(), size * Math.random(), 0, size
  ], 3));
  geo.computeVertexNormals();
  const shard = new THREE.Mesh(geo, M_SHARD);
  shard.position.set(-7.2 + (Math.random() - 0.5) * 1.4, 9.005, -3.0 + (Math.random() - 0.5) * 1.2);
  shard.rotation.y = Math.random() * Math.PI;
  scene.add(shard);
}
collisionWorld.addBox(-8.0, 9, -3.8, -6.5, 9.05, -2.2, 'rubble', 0.05);

const room2Bed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.9), M_IRON);
room2Bed.position.set(-6.2, 9.225, -4.0);
scene.add(room2Bed);
collisionWorld.addBox(-6.9, 9, -4.45, -5.5, 9.42, -3.55, 'metal', 0.42);

const desk = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.75, 0.55), M_DARK_WOOD);
desk.position.set(-5.2, 9 + 0.375, -3.5);
desk.rotation.x = 0.35;
desk.rotation.z = 0.15;
scene.add(desk);
collisionWorld.addMesh(desk, 'wood', 0.75);

/* SECTION 9: ROOM 3 — WATER DAMAGE / COLLAPSED CEILING (X +4 to +8, Z -5 to -9) */

const r3Floor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.035, 3.8), M_WALNUT);
r3Floor.position.set(6, 9.035, -7);
scene.add(r3Floor);

const hole = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0, side: THREE.DoubleSide }));
hole.position.set(6, 12.47, -7);
scene.add(hole);

for (let h = 0; h < 8; h++) {
  const shard = new THREE.Mesh(new THREE.BoxGeometry(0.1 + Math.random() * 0.3, 0.15, 0.05), M_PLASTER_CHUNK);
  shard.position.set(5 + Math.random() * 2, 12.4 + Math.random() * 0.1, -8 + Math.random() * 2);
  shard.rotation.z = (Math.random() - 0.5) * 0.3;
  scene.add(shard);
}
for (let l = 0; l < 6; l++) {
  const lath = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.04, 0.45), new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9 }));
  lath.position.set(5.2 + l * 0.32, 12.47, -7 + (Math.random() - 0.5) * 1.2);
  lath.rotation.z = (Math.random() - 0.5) * 0.1;
  scene.add(lath);
}

for (let c = 0; c < 5; c++) {
  const chunk = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18 + Math.random() * 0.14, 0), M_PLASTER_CHUNK);
  chunk.position.set(5.5 + Math.random() * 1.8, 9.05 + Math.random() * 0.2, -7 + (Math.random() - 0.5) * 1.5);
  scene.add(chunk);
}
for (let l = 0; l < 4; l++) {
  const lath = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.4), new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9 }));
  lath.position.set(5.5 + Math.random() * 1.5, 9.06, -7 + (Math.random() - 0.5) * 1.5);
  lath.rotation.y = Math.random() * Math.PI;
  scene.add(lath);
}
const dust = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.5), new THREE.MeshStandardMaterial({ color: 0xe0d8d0, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
dust.position.set(6, 9.02, -7);
dust.rotation.x = -Math.PI / 2;
scene.add(dust);

const buriedBed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.9), M_IRON);
buriedBed.position.set(6.2, 9.12, -6.5);
buriedBed.scale.y = 0.7;
buriedBed.rotation.z = 0.05;
scene.add(buriedBed);
collisionWorld.addBox(5.5, 9, -7.5, 6.8, 9.45, -6.0, 'rubble', 0.45);

[[6, -8.5], [6, -5.5], [4.2, -7], [7.8, -7]].forEach(([wx, wz]) => {
  const stain = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.5, 0.1), M_WATER_STAIN);
  stain.position.set(wx, 9 + 1.75, wz);
  scene.add(stain);
  const stain2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.5, 0.1), M_WATER_STAIN);
  stain2.position.set(wz, 9 + 1.75, wx);
  scene.add(stain2);
});
[[4.2, -6.5], [7.8, -7.5]].forEach(([mx, mz]) => {
  const mold = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 4), M_MOLD);
  mold.scale.y = 0.2;
  mold.position.set(mx, 9 + 0.5, mz);
  scene.add(mold);
});
}

/* SECTION 10: ROOM 4 — MISSING WINDOW (X -8 to -4, Z -5 to -9) */

function buildPart2() {
const r4Floor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.035, 3.8), M_WALNUT);
r4Floor.position.set(-6, 9.035, -7);
scene.add(r4Floor);

for (let i = 0; i < 30; i++) {
  const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.1 + Math.random() * 0.08, 0.07 + Math.random() * 0.05),
    new THREE.MeshStandardMaterial({ color: leafColors[Math.floor(Math.random() * leafColors.length)], roughness: 1.0, side: THREE.DoubleSide }));
  const dist = Math.random();
  leaf.position.set(-7.5 + (Math.random() - 0.5) * 2.5 * dist, 9.005, -7 + Math.random() * 3.5 - 1.5);
  leaf.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.15, Math.random() * Math.PI * 2, 0);
  leaf.receiveShadow = true;
  scene.add(leaf);
}

const r4Bed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.9), M_IRON);
r4Bed.position.set(-5.5, 9.225, -7.5);
scene.add(r4Bed);
collisionWorld.addBox(-6.2, 9, -7.95, -4.8, 9.42, -7.05, 'metal', 0.42);

const chest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.5), M_DARK_WOOD);
chest.position.set(-7.0, 9 + 0.275, -8.0);
scene.add(chest);
const lid = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.48), M_DARK_WOOD);
lid.position.set(-7.0, 9 + 0.55, -8.0);
lid.rotation.x = 0.8;
scene.add(lid);

/* SECTION 11: ROOM 5 — CHESS SET (X +4 to +8, Z -9 to -13) */

const r5Floor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.035, 3.8), M_WALNUT);
r5Floor.position.set(6, 9.035, -11);
scene.add(r5Floor);

const chessTable = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), M_DARK_WOOD);
chessTable.position.set(6, 9 + 0.35, -11);
scene.add(chessTable);
collisionWorld.addBox(5.65, 9, -11.35, 6.35, 9.7, -10.65, 'wood', 0.7);

const boardTex = (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  for (let r = 0; r < 8; r++) {
    for (let col = 0; col < 8; col++) {
      ctx.fillStyle = (r + col) % 2 === 0 ? '#e8e0d0' : '#2a2018';
      ctx.fillRect(col * 8, r * 8, 8, 8);
    }
  }
  const data = ctx.getImageData(0, 0, 64, 64);
  const t = new THREE.DataTexture(data.data, 64, 64, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
})();
const board = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.62), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.7 }));
board.position.set(6, 9 + 0.71, -11);
scene.add(board);

const M_WHITE = new THREE.MeshStandardMaterial({ color: 0xd0c8b0, roughness: 0.5 });
const M_BLACK = new THREE.MeshStandardMaterial({ color: 0x2a2820, roughness: 0.5 });
const pieceTypes = [
  { h: 0.06, top: 0.02 }, { h: 0.08, top: 0.03 }, { h: 0.09, top: 0.035 },
  { h: 0.08, top: 0.03 }, { h: 0.11, top: 0.04 }, { h: 0.12, top: 0.045 }
];
const boardPositions = [[-0.2, -0.2], [0.2, -0.2], [-0.1, 0.1], [0.1, 0.2], [-0.2, 0.05], [0.15, -0.05], [-0.05, -0.15], [0.25, 0.1]];
const boardPositionsB = [[-0.15, 0.2], [0.15, 0.15], [-0.25, -0.05], [0.05, -0.1], [-0.1, -0.2], [0.2, -0.15]];
boardPositions.forEach(([bx, bz], i) => {
  const type = i < 4 ? 0 : (i < 6 ? 1 : 2 + (i % 4));
  const ph = pieceTypes[Math.min(type, 5)].h;
  const piece = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, ph, 6), M_WHITE);
  piece.position.set(6 + bx, 9 + 0.73 + ph / 2, -11 + bz);
  scene.add(piece);
  if (ph > 0.07) {
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 4), M_WHITE);
    top.position.set(6 + bx, 9 + 0.73 + ph, -11 + bz);
    scene.add(top);
  }
});
boardPositionsB.forEach(([bx, bz]) => {
  const ph = 0.06 + Math.random() * 0.05;
  const piece = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, ph, 6), M_BLACK);
  piece.position.set(6 + bx, 9 + 0.73 + ph / 2, -11 + bz);
  scene.add(piece);
  if (ph > 0.07) {
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 4), M_BLACK);
    top.position.set(6 + bx, 9 + 0.73 + ph, -11 + bz);
    scene.add(top);
  }
});
for (let f = 0; f < 3; f++) {
  const ph = 0.06;
  const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, ph, 6), Math.random() > 0.5 ? M_WHITE : M_BLACK);
  fp.position.set(6 + (Math.random() - 0.5) * 0.5, 9 + 0.73 + ph / 2, -11 + (Math.random() - 0.5) * 0.5);
  fp.rotation.x = Math.PI / 2;
  scene.add(fp);
}
for (let f = 0; f < 2; f++) {
  const ph = 0.06;
  const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, ph, 6), M_WHITE);
  fp.position.set(6 + (Math.random() - 0.5) * 0.6, 9.04, -11 + (Math.random() - 0.5) * 0.6);
  fp.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
  scene.add(fp);
}

[6.2, 5.8].forEach((cx, i) => {
  const chair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.4), M_DARK_WOOD);
  chair.position.set(cx, 9 + 0.225, -10.3 + i * 1.4);
  scene.add(chair);
  collisionWorld.addBox(cx - 0.25, 9, -10.55 + i * 1.4, cx + 0.25, 9.45, -10.05 + i * 1.4, 'wood', 0.45);
});

const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.5, 0.32), M_WALNUT);
bookshelf.position.set(7.8, 9 + 2.25, -11);
scene.add(bookshelf);
for (let s = 0; s < 3; s++) {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.035, 0.3), M_WALNUT);
  shelf.position.set(7.8, 9 + 0.5 + s * 1.5, -11);
  scene.add(shelf);
}
for (let b = 0; b < 2; b++) {
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.12 + Math.random() * 0.05, 0.2 + Math.random() * 0.06, 0.15),
    new THREE.MeshStandardMaterial({ color: [0x3d1a0a, 0x1a2e1a][b], roughness: 0.9 }));
  book.position.set(7.5 + b * 0.15, 9 + 0.75 + b * 0.25, -11);
  scene.add(book);
}

/* SECTION 12: ROOM 6 — GENERAL DECAY (X -8 to -4, Z -9 to -13) */

const r6Floor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.035, 3.8), M_WALNUT);
r6Floor.position.set(-6, 9.035, -11);
scene.add(r6Floor);

const r6Bed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.9), M_IRON);
r6Bed.position.set(-6.5, 9.225, -11.5);
scene.add(r6Bed);
collisionWorld.addBox(-7.2, 9, -11.95, -5.8, 9.42, -11.05, 'metal', 0.42);

const mattressTop = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.85),
  new THREE.MeshStandardMaterial({ color: 0x808078, roughness: 0.97, side: THREE.DoubleSide }));
mattressTop.position.set(-6.5, 9.39, -11.5);
mattressTop.rotation.x = -0.35;
scene.add(mattressTop);
const mattressBottom = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.85),
  new THREE.MeshStandardMaterial({ color: 0x808078, roughness: 0.97, side: THREE.DoubleSide }));
mattressBottom.position.set(-6.5, 9.39, -11.5);
mattressBottom.rotation.x = 0.35;
scene.add(mattressBottom);
const batting = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xa0a098, roughness: 0.95 }));
batting.position.set(-6.5, 9.33, -11.5);
scene.add(batting);

const washstand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.4), M_WALNUT);
washstand.position.set(-7.2, 9 + 0.425, -10.3);
scene.add(washstand);
const basin = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6),
  new THREE.MeshStandardMaterial({ color: 0xc8c0b4, roughness: 0.6 }));
basin.scale.y = 0.5;
basin.position.set(-7.2, 9 + 0.75, -10.3);
scene.add(basin);
basin.scale.y = 0.5;
const stain = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.18, 8),
  new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 1.0, side: THREE.DoubleSide }));
stain.position.set(-7.2, 9 + 0.76, -10.3);
stain.rotation.x = -Math.PI / 2;
scene.add(stain);

const fpStone = M_STONE;
[-8.8, -7.2].forEach(jx => {
  const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.35), fpStone);
  jamb.position.set(jx, 9 + 0.6, -12.8);
  scene.add(jamb);
});
const fpLintel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 0.35), fpStone);
fpLintel.position.set(-8.0, 9 + 1.3, -12.8);
scene.add(fpLintel);
const fpBack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.12), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 }));
fpBack.position.set(-8.0, 9 + 0.7, -12.7);
scene.add(fpBack);
const fpAsh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: 0x3a3830, roughness: 1.0 }));
fpAsh.position.set(-8.15, 9 + 0.04, -12.8);
scene.add(fpAsh);
for (let g = 0; g < 5; g++) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.3), M_IRON);
  bar.position.set(-7.8 + g * 0.08, 9 + 0.4, -12.8);
  scene.add(bar);
}

const painting = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.03), M_GOLD);
painting.position.set(-5.2, 9 + 0.9, -12.5);
scene.add(painting);
const pCanvas = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.30),
  new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 1.0 }));
pCanvas.position.set(-5.2, 9 + 0.9, -12.48);
scene.add(pCanvas);
for (let s = 0; s < 4; s++) {
  const stainMark = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.025, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x1a0a05 }));
  stainMark.position.set(-5.2 + (Math.random() - 0.5) * 0.35, 9 + 0.85 + Math.random() * 0.1, -12.47);
  scene.add(stainMark);
}
}

export function init(scene) {
  buildPart1();
  buildPart2();
}

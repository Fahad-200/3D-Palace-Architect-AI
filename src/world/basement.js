import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture, lerpAlong3PointArc } from '../geometry.js?v=2';

const M_STONE = materials.limestone_ashlar;
const M_STONE_FLAGS = materials.stone_flags;
const M_CEILING = materials.stone_ceiling_vault;
const M_IRON = materials.iron_rusted;
const M_WALNUT = materials.dark_walnut;
const M_WATER_STAIN = new THREE.MeshStandardMaterial({ color: 0x2a2218, transparent: true, opacity: 0.5 });

function buildPart1() {

/* SECTION A: BASEMENT ENVIRONMENT BASE */

const bsmtFloor = new THREE.Mesh(new THREE.BoxGeometry(39.0, 0.04, 24.0), M_STONE_FLAGS);
bsmtFloor.position.set(0, -3.71, 0);
bsmtFloor.receiveShadow = true;
scene.add(bsmtFloor);

[-19.7, 19.7].forEach(wx => {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.75, 24), M_STONE);
  panel.position.set(wx, -3.75 + 1.875, 0);
  scene.add(panel);
});
[-12.3, 12.3].forEach(wz => {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(39, 3.75, 0.04), M_STONE);
  panel.position.set(0, -3.75 + 1.875, wz);
  scene.add(panel);
});

[-19.7, 19.7].forEach(wx => {
  const stain = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 24), M_WATER_STAIN);
  stain.position.set(wx, -3.75 + 0.3, 0);
  scene.add(stain);
});
[-12.3, 12.3].forEach(wz => {
  const stain = new THREE.Mesh(new THREE.BoxGeometry(39, 0.6, 0.04), M_WATER_STAIN);
  stain.position.set(0, -3.75 + 0.3, wz);
  scene.add(stain);
});

/* SECTION B: WINE CELLAR — BARREL-VAULTED CEILING */

const wineCeilH = -0.5, winePeakH = -0.28;
const wineZ0 = -6, wineZ1 = +4;

for (let bz = -5.5; bz <= 3.5; bz += 0.9) {
  const z = Math.round(bz * 10) / 10;
  for (let s = 0; s < 7; s++) {
    const t0 = s / 7, t1 = (s + 1) / 7;
    const start = new THREE.Vector3(-10, wineCeilH, z);
    const peak = new THREE.Vector3(0, winePeakH, z);
    const end = new THREE.Vector3(10, wineCeilH, z);
    const p0 = lerpAlong3PointArc(start, peak, end, t0);
    const p1 = lerpAlong3PointArc(start, peak, end, t1);
    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;
    const len = p0.distanceTo(p1) + 0.01;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, len), M_STONE);
    seg.position.set(cx, cy, z);
    seg.lookAt(p1);
    scene.add(seg);
  }
}

const ribZ = [];
for (let z = -5.5; z <= 3.5; z += 0.9) ribZ.push(Math.round(z * 10) / 10);
for (let i = 0; i < ribZ.length - 1; i++) {
  const z0 = ribZ[i], z1 = ribZ[i + 1];
  const zMid = (z0 + z1) / 2;
  for (let s = 0; s < 7; s++) {
    const t0 = s / 7, t1 = (s + 1) / 7;
    const start = new THREE.Vector3(-10, wineCeilH, z0);
    const peak = new THREE.Vector3(0, winePeakH, z0);
    const end = new THREE.Vector3(10, wineCeilH, z0);
    const p0 = lerpAlong3PointArc(start, peak, end, t0);
    const p1 = lerpAlong3PointArc(start, peak, end, t1);
    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;
    const segLen = p0.distanceTo(p1) + 0.01;
    const bayLen = z1 - z0;
    const infill = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, bayLen), new THREE.MeshStandardMaterial({ color: 0x6a6258 }));
    infill.position.set(cx, cy, zMid);
    infill.lookAt(p1.x, p1.y, zMid);
    scene.add(infill);
  }
}

for (let d = 0; d < 8; d++) {
  const dz = wineZ0 + Math.random() * (wineZ1 - wineZ0);
  const dx = (Math.random() - 0.5) * 18;
  const arcT = (dx + 10) / 20;
  const start = new THREE.Vector3(-10, wineCeilH, dz);
  const peak = new THREE.Vector3(0, winePeakH, dz);
  const end = new THREE.Vector3(10, wineCeilH, dz);
  const vaultPos = lerpAlong3PointArc(start, peak, end, arcT);
  const stal = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.003, 0.08 + Math.random() * 0.14, 6),
    new THREE.MeshStandardMaterial({ color: 0x9a9090 }));
  stal.position.set(vaultPos.x + (Math.random() - 0.5) * 0.1, vaultPos.y - 0.02 - 0.04 - Math.random() * 0.07, vaultPos.z);
  scene.add(stal);
}

/* SECTION C: WINE RACKS AND BOTTLES */

function createWineRack(x, z, rotY, fillLevel) {
  const rackW = 2.4, rackH = 1.8, rackD = 0.4, cols = 5, rows = 6;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(rackW, rackH, rackD), M_WALNUT);
  frame.position.set(x, -3.75 + rackH / 2, z);
  frame.rotation.y = rotY;
  scene.add(frame);
  collisionWorld.addBox(x - rackW / 2, -3.75, z - rackD / 2, x + rackW / 2, -3.75 + rackH, z + rackD / 2, 'wood', rackH);
  for (let r = 0; r <= rows; r++) {
    const div = new THREE.Mesh(new THREE.BoxGeometry(rackW - 0.04, 0.04, rackD - 0.04), M_WALNUT);
    div.position.set(x, -3.75 + r * (rackH / rows), z);
    div.rotation.y = rotY;
    scene.add(div);
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > fillLevel) continue;
      const bottleY = -3.75 + (r + 0.5) * (rackH / rows);
      const bx = x + ((c / (cols - 1)) - 0.5) * (rackW - 0.1);
      const bz = z;
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.04, 0.29, 8),
        new THREE.MeshStandardMaterial({
          color: Math.random() > 0.3 ? 0x1a2a18 : 0x4a3820,
          transparent: true, opacity: 0.7 + Math.random() * 0.2, roughness: 0.12, metalness: 0.05
        }));
      bottle.position.set(bx, bottleY, bz);
      bottle.rotation.z = Math.PI / 2;
      bottle.rotation.y = rotY + (Math.random() - 0.5) * 0.15;
      scene.add(bottle);
      if (Math.random() > 0.3) {
        const dust = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4),
          new THREE.MeshStandardMaterial({ color: 0x9a9490, transparent: true, opacity: 0.25, roughness: 1.0 }));
        dust.scale.set(0.9, 0.8, 1);
        dust.position.copy(bottle.position);
        scene.add(dust);
      }
      if (Math.random() > 0.5) {
        const label = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.06),
          new THREE.MeshStandardMaterial({ color: 0xc8b888, roughness: 1.0 }));
        label.position.copy(bottle.position);
        label.position.y += 0.001;
        label.rotation.z = Math.PI / 2;
        label.rotation.y = rotY;
        scene.add(label);
      }
    }
  }
}

createWineRack(+9.4, -4.5, -Math.PI / 2, 0.75);
createWineRack(+9.4, -2.0, -Math.PI / 2, 0.85);
createWineRack(+9.4, +0.5, -Math.PI / 2, 0.60);
createWineRack(-9.4, -4.5, +Math.PI / 2, 0.90);
createWineRack(-9.4, -2.0, +Math.PI / 2, 0.70);
createWineRack(-9.4, +0.5, +Math.PI / 2, 0.55);

const M_SHARD = new THREE.MeshStandardMaterial({ color: 0x1a2a18, transparent: true, opacity: 0.65, roughness: 0.1, side: THREE.DoubleSide });
const M_POOL = new THREE.MeshStandardMaterial({ color: 0x180c08, transparent: true, opacity: 0.6, roughness: 1.0 });

for (let b = 0; b < 5; b++) {
  const bx = (Math.random() - 0.5) * 18, bz = -5 + Math.random() * 8.5;
  for (let s = 0; s < 5; s++) {
    const shard = new THREE.Mesh(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.03 + Math.random() * 0.04, 0, 0.02),
        new THREE.Vector3(0.01, 0, 0.04 + Math.random() * 0.03)
      ]), M_SHARD);
    shard.position.set(bx + (Math.random() - 0.5) * 0.2, -3.71, bz + (Math.random() - 0.5) * 0.2);
    shard.rotation.y = Math.random() * Math.PI * 2;
    scene.add(shard);
  }
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.18 + Math.random() * 0.1, 8), M_POOL);
  pool.position.set(bx, -3.708, bz);
  pool.rotation.x = -Math.PI / 2;
  scene.add(pool);
}

/* SECTION D: IRON GATE */

const gateZ = 0;
for (let v = 0; v < 8; v++) {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), M_IRON);
  bar.position.set(-1.0 + v * 0.28, -3.75 + 1.1, gateZ);
  bar.rotation.y = 0.35;
  scene.add(bar);
}
[-1.5, -0.65, 0.2, 1.05].forEach((oy, i) => {
  const hBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.0, 6), M_IRON);
  hBar.position.set(0, -3.75 + 0.3 + i * 0.8, gateZ);
  hBar.rotation.x = Math.PI / 2;
  hBar.rotation.y = 0.35;
  scene.add(hBar);
});

[-1.02, 1.02].forEach(ox => {
  const frameBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), M_IRON);
  frameBar.position.set(ox, -3.75 + 1.1, gateZ);
  scene.add(frameBar);
});

collisionWorld.addBox(-1.02, -3.75, -0.15, -0.1, -1.55, 0.15, 'metal', 2.2);
collisionWorld.addBox(+0.1, -3.75, -0.15, +1.02, -1.55, 0.15, 'metal', 2.2);

const lock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), M_IRON);
lock.position.set(-0.05, -2.5, 0.08);
scene.add(lock);
const padlock = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), M_IRON);
padlock.position.set(-0.05, -2.55, 0.12);
padlock.scale.set(0.8, 1, 0.8);
scene.add(padlock);
const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.018, 6, 8), M_IRON);
shackle.position.set(-0.05, -2.5, 0.1);
scene.add(shackle);

/* SECTION E: DUNGEON / STORAGE VAULT */

const dunCeil = new THREE.Mesh(new THREE.BoxGeometry(19.8, 0.04, 9.8), M_CEILING);
dunCeil.position.set(0, -0.02, +5);
scene.add(dunCeil);

const M_CRACK = new THREE.MeshStandardMaterial({ color: 0x1a1815, roughness: 1.0 });
for (let c = 0; c < 6; c++) {
  const crack = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.3 + Math.random() * 0.8), M_CRACK);
  crack.position.set((Math.random() - 0.5) * 16, -0.01, 5 + (Math.random() - 0.5) * 6);
  crack.rotation.z = (Math.random() - 0.5) * 0.2;
  scene.add(crack);
}

const ringPositions = [
  [+9.6, -3.6, +2.5], [+9.6, -3.6, +5.5], [+9.6, -3.6, +8.5],
  [-9.6, -3.6, +2.5], [-9.6, -3.6, +5.5], [-9.6, -3.6, +8.5],
  [+9.6, -2.4, +2.5], [+9.6, -2.4, +5.5], [+9.6, -2.4, +8.5],
  [-9.6, -2.4, +2.5], [-9.6, -2.4, +5.5], [-9.6, -2.4, +8.5]
];
ringPositions.forEach(([rx, ry, rz]) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 10), M_IRON);
  ring.position.set(rx, ry, rz);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
});

let linkPos = new THREE.Vector3(+9.6, -3.6, +2.5);
for (let i = 0; i < 9; i++) {
  const link = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.018, 6, 8), M_IRON);
  link.position.copy(linkPos);
  link.rotation.x = (i % 2 === 0) ? 0 : Math.PI / 2;
  scene.add(link);
  if (i < 6) {
    linkPos.x += 0.12;
    linkPos.z += 0.08;
  } else {
    linkPos.x += (Math.random() - 0.5) * 0.15;
    linkPos.z += (Math.random() - 0.5) * 0.15;
  }
  linkPos.y = -3.7;
  collisionWorld.addBox(linkPos.x - 0.07, -3.75, linkPos.z - 0.07, linkPos.x + 0.07, -3.67, linkPos.z + 0.07, 'metal', 0.08);
}

[-0.5, 0.5].forEach(sx => {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.1, 0.12), M_WALNUT);
  post.position.set(8.0 + sx * 1.4, -3.75 + 1.05, 9.0);
  scene.add(post);
});
[-1.0, 0.0, 1.0].forEach(oy => {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), M_WALNUT);
  bar.position.set(8.0, -3.75 + 0.5 + oy * 0.65, 9.0);
  scene.add(bar);
});

[-8.5, +8.5].forEach(sx => {
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.45, 0.45), M_STONE_FLAGS);
  bench.position.set(sx, -3.75 + 0.225, sx > 0 ? 5 : 5);
  scene.add(bench);
  collisionWorld.addBox(sx - 1.27, -3.75, 5 - 0.24, sx + 1.27, -3.75 + 0.45, 5 + 0.24, 'stone', 0.45);
});

const drain = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
drain.position.set(0, -3.708, 5);
drain.rotation.x = -Math.PI / 2;
scene.add(drain);
for (let g = 0; g < 4; g++) {
  for (let h = 0; h < 4; h++) {
    const grate = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.07), M_IRON);
    grate.position.set(-0.0525 + g * 0.035, -3.7, 5 - 0.0525 + h * 0.035);
    scene.add(grate);
  }
}

/* SECTION F: SARCOPHAGUS-STYLE STONE CHEST */

const M_SARCO = new THREE.MeshStandardMaterial({ color: 0x706860, roughness: 0.92 });
const M_SARCO_LID = new THREE.MeshStandardMaterial({ color: 0x807870, roughness: 0.9 });
const M_RELIEF = new THREE.MeshStandardMaterial({ color: 0x908078, roughness: 0.85 });

const sarcBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.85), M_SARCO);
sarcBase.position.set(0, -3.75 + 0.45, +9.5);
scene.add(sarcBase);
collisionWorld.addBox(-1.01, -3.75, 9.08, 1.01, -3.75 + 0.9, 9.93, 'stone', 0.9);

const sarcLid = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.2, 0.9), M_SARCO_LID);
sarcLid.position.set(0, -3.75 + 0.9 + 0.1, +9.5);
scene.add(sarcLid);

[-0.9, 0.9].forEach(zp => {
  const bevel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 0.04), M_SARCO);
  bevel.position.set(0, -3.75 + 0.9 + 0.1, +9.5 + zp);
  scene.add(bevel);
});
[-1.0, 1.0].forEach(xp => {
  const bevel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.8), M_SARCO);
  bevel.position.set(xp, -3.75 + 0.9 + 0.1, +9.5);
  scene.add(bevel);
});

const fig = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.55), M_RELIEF);
fig.position.set(0, -3.75 + 0.9 + 0.12, +9.96);
scene.add(fig);
const figHead = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.05), M_RELIEF);
figHead.position.set(0, -3.75 + 0.9 + 0.14, +9.96);
scene.add(figHead);
const figFeet = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.05), M_RELIEF);
figFeet.position.set(0, -3.75 + 0.9 + 0.02, +9.96);
scene.add(figFeet);

const inscripTex = makeTexture(256, 48, (ctx, w, h) => {
  ctx.fillStyle = '#706860'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#5a5048';
  for (let i = 0; i < 18; i++) {
    ctx.fillRect(8 + i * 13, 12, 8, 2);
    ctx.fillRect(10 + i * 13, 8, 2, 10);
  }
  ctx.strokeStyle = '#4a4038'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(w * 0.4, 22); ctx.lineTo(w * 0.7, 26); ctx.lineTo(w, 24); ctx.stroke();
});
const inscrip = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3),
  new THREE.MeshStandardMaterial({ map: inscripTex, roughness: 0.9 }));
inscrip.position.set(0, -3.75 + 0.55, +9.07);
  scene.add(inscrip);
}

/* SECTION G: COLLAPSED WALL CRAWL PASSAGE */

export const crouchZones = [
  { minX: 9.0, maxX: 11.0, minZ: 6.5, maxZ: 7.5, label: 'dungeon_crawl' }
];

function buildPart2() {
const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 0.55), M_STONE);
lintel.position.set(+9.6, -3.75 + 0.75 + 0.125, +7.0);
scene.add(lintel);
collisionWorld.addBox(9.1, -3.75 + 0.75, 6.75, 10.1, -3.75 + 0.75 + 0.25, 7.25, 'stone', 0);

const M_RUBBLE = M_STONE;
for (let c = 0; c < 4; c++) {
  const chunk = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15 + Math.random() * 0.15, 0), M_RUBBLE);
  chunk.position.set(+9.6 + (Math.random() - 0.5) * 1.2, -3.72 + Math.random() * 0.05, +7.0 + (Math.random() - 0.5) * 1.0);
  chunk.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  scene.add(chunk);
}
for (let c = 0; c < 3; c++) {
  const chunk = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + Math.random() * 0.08, 0), M_RUBBLE);
  chunk.position.set(+9.6 + (Math.random() - 0.5) * 0.6, -2.9 + Math.random() * 0.2, +7.0 + (Math.random() - 0.5) * 0.5);
  chunk.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  scene.add(chunk);
}

for (let r = 0; r < 3; r++) {
  const rock = new THREE.Mesh(new THREE.BoxGeometry(0.08 + Math.random() * 0.15, 0.05 + Math.random() * 0.08, 0.08 + Math.random() * 0.12), M_RUBBLE);
  rock.position.set(+9.3 + r * 0.35, -3.72, +6.5);
  scene.add(rock);
  collisionWorld.addBox(rock.position.x - 0.1, -3.75, rock.position.z - 0.1, rock.position.x + 0.1, -3.7, rock.position.z + 0.1, 'rubble', 0.05);
}
}

/* SECTION H: WATER DRIP SOUND TRIGGER */

export function init(scene) {
  buildPart1();
  buildPart2();
  // Audio registration happens in audio.js via setDripData / setSilenceZone
}

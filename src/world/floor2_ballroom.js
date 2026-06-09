import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture } from '../geometry.js?v=2';
import { registerAudioTrigger } from '../audio.js?v=2';

function build() {

/* SECTION A: PARQUET FLOOR — HERRINGBONE PATTERN */

function drawHerringbone(ctx, w, h) {
  ctx.fillStyle = '#3d2b1c'; ctx.fillRect(0, 0, w, h);
  const plankW = 12; const plankH = 5;
  for (let row = -w; row < w * 2; row += plankH * 2) {
    for (let col = -h; col < h * 2; col += plankW) {
      ctx.save();
      ctx.translate(col, row);
      ctx.rotate(Math.PI / 4);
      const grain = Math.random() * 0.08;
      ctx.fillStyle = `rgb(${55 + grain * 40 | 0},${38 + grain * 28 | 0},${22 + grain * 18 | 0})`;
      ctx.fillRect(0, 0, plankW - 1, plankH - 1);
      ctx.restore();
    }
  }
  for (let row = -w; row < w * 2; row += plankH * 2) {
    for (let col = -h + plankW / 2; col < h * 2; col += plankW) {
      ctx.save();
      ctx.translate(col, row + plankH);
      ctx.rotate(-Math.PI / 4);
      const grain = Math.random() * 0.08;
      ctx.fillStyle = `rgb(${50 + grain * 38 | 0},${34 + grain * 26 | 0},${18 + grain * 16 | 0})`;
      ctx.fillRect(0, 0, plankW - 1, plankH - 1);
      ctx.restore();
    }
  }
  ctx.fillStyle = 'rgba(180,160,130,0.12)'; ctx.fillRect(0, 0, w, h);
}

const herringboneTex = makeTexture(512, 512, drawHerringbone);
herringboneTex.wrapS = herringboneTex.wrapT = THREE.RepeatWrapping;
herringboneTex.repeat.set(4, 2);

const parquetMat = new THREE.MeshStandardMaterial({
  map: herringboneTex, roughness: 0.42, color: 0xffffff
});

const parquet = new THREE.Mesh(new THREE.BoxGeometry(17.8, 0.035, 9.8), parquetMat);
parquet.position.set(0, 4.535, +2.0);
parquet.receiveShadow = true;
scene.add(parquet);

/* WARPED NORTHEAST SECTION */
for (let i = 0; i < 6; i++) {
  const px = 6.5 + i * 0.45;
  const pz = -2.0;
  const tilt = 0.08 + i * 0.035;
  const lift = 0.04 + i * 0.022;
  const plank = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.035 + lift, 2.4),
    parquetMat
  );
  plank.position.set(px, 4.535 + lift / 2, pz);
  plank.rotation.z = (i % 2 === 0) ? tilt : -tilt * 0.6;
  plank.rotation.x = tilt * 0.3;
  scene.add(plank);
  collisionWorld.addBox(px - 0.22, 4.5, pz - 1.2, px + 0.22, 4.5 + lift + 0.05, pz + 1.2, 'wood', lift + 0.05);
}

/* SECTION B: PLASTERWORK COFFER CEILING */

const M_CEIL = materials.stone_ceiling_vault;
const M_PLASTER_CEIL = new THREE.MeshStandardMaterial({ color: 0xb0a898, roughness: 0.82 });
const M_PLASTER_CEIL2 = new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.8 });
const M_HOOK = new THREE.MeshStandardMaterial({ color: 0x5a5040, roughness: 0.5, metalness: 0.6 });
const M_COFFER = new THREE.MeshStandardMaterial({ color: 0xa89e90, roughness: 0.84 });
const M_COFFER_PANEL = new THREE.MeshStandardMaterial({ color: 0x9a9082, roughness: 0.88 });
const M_ROSETTE = new THREE.MeshStandardMaterial({ color: 0xb0a890, roughness: 0.8 });
const M_PLASTER_MOUND = new THREE.MeshStandardMaterial({ color: 0xc0b8a8, roughness: 0.95 });

const baseCeil = new THREE.Mesh(new THREE.BoxGeometry(17.8, 0.05, 9.8), M_CEIL);
baseCeil.position.set(0, 11.47, +2.0);
scene.add(baseCeil);

const medallion = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 24), M_PLASTER_CEIL);
medallion.position.set(0, 11.46, +2.0);
medallion.rotation.x = Math.PI / 2;
scene.add(medallion);

const medallion2 = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 8, 20), M_PLASTER_CEIL2);
medallion2.position.set(0, 11.46, +2.0);
medallion2.rotation.x = Math.PI / 2;
scene.add(medallion2);

const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8), M_HOOK);
hook.position.set(0, 11.44, +2.0);
scene.add(hook);

const cofferW = 4.2; const cofferD = 3.0;
for (let cx = 0; cx < 4; cx++) {
  for (let cz = 0; cz < 3; cz++) {
    const cellX = -6.3 + cx * cofferW + cofferW / 2;
    const cellZ = -3.3 + cz * cofferD + cofferD / 2;
    const frameThick = 0.15; const frameHeight = 0.07;
    [cellZ - cofferD / 2 + frameThick / 2, cellZ + cofferD / 2 - frameThick / 2].forEach(fz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(cofferW, frameHeight, frameThick), M_COFFER);
      rail.position.set(cellX, 11.45, fz);
      scene.add(rail);
    });
    [cellX - cofferW / 2 + frameThick / 2, cellX + cofferW / 2 - frameThick / 2].forEach(fx => {
      const stile = new THREE.Mesh(new THREE.BoxGeometry(frameThick, frameHeight, cofferD), M_COFFER);
      stile.position.set(fx, 11.45, cellZ);
      scene.add(stile);
    });
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(cofferW - frameThick * 2, 0.02, cofferD - frameThick * 2),
      M_COFFER_PANEL
    );
    panel.position.set(cellX, 11.44, cellZ);
    scene.add(panel);
    const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 4), M_ROSETTE);
    rosette.scale.y = 0.3;
    rosette.position.set(cellX, 11.46, cellZ);
    scene.add(rosette);
  }
}

function addPlasterMound(x, z, radius, height) {
  const geo = new THREE.SphereGeometry(radius, 7, 5);
  geo.scale(1, height / radius, 0.85);
  const mesh = new THREE.Mesh(geo, M_PLASTER_MOUND);
  mesh.position.set(x, 4.5 + height / 2, z);
  mesh.rotation.y = Math.random() * Math.PI;
  scene.add(mesh);
  collisionWorld.addBox(x - radius, 4.5, z - radius * 0.85, x + radius, 4.5 + height, z + radius * 0.85, 'rubble', height);
}
addPlasterMound(+7.0, -1.5, 0.55, 0.18);
addPlasterMound(-6.5, +5.5, 0.48, 0.14);
addPlasterMound(+3.5, +6.0, 0.32, 0.10);
addPlasterMound(-4.0, -2.0, 0.40, 0.12);

/* SECTION C: INTACT DUSTY CHANDELIER */

const M_CHAN = new THREE.MeshStandardMaterial({ color: 0x7a7060, roughness: 0.6, metalness: 0.45 });
const M_LINK = new THREE.MeshStandardMaterial({ color: 0x5a5040, roughness: 0.5, metalness: 0.6 });
const M_ARM = new THREE.MeshStandardMaterial({ color: 0x6a6050, roughness: 0.55, metalness: 0.5 });
const M_CRYSTAL = new THREE.MeshStandardMaterial({
  color: 0xa8b0b8, transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.08
});

const hubY = 10.2;
const chanHub = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.3, 0.22, 12),
  M_CHAN
);
chanHub.position.set(0, hubY, +2.0);
scene.add(chanHub);

for (let i = 0; i < 8; i++) {
  const link = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 8), M_LINK);
  link.position.set(0, 11.42 - i * 0.13, +2.0);
  link.rotation.x = (i % 2 === 0) ? 0 : Math.PI / 2;
  scene.add(link);
}

for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  const armR = 1.4;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, armR), M_ARM);
  arm.position.set(Math.cos(a) * armR / 2, hubY - 0.04, 2.0 + Math.sin(a) * armR / 2);
  arm.rotation.y = -a;
  scene.add(arm);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.06, 8), M_CHAN);
  cup.position.set(Math.cos(a) * armR, hubY - 0.1, 2.0 + Math.sin(a) * armR);
  scene.add(cup);
  for (let j = 0; j < 3; j++) {
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.038 + j * 0.008), M_CRYSTAL);
    crystal.position.set(
      Math.cos(a) * armR + (Math.random() - 0.5) * 0.06,
      hubY - 0.2 - j * 0.1,
      2.0 + Math.sin(a) * armR + (Math.random() - 0.5) * 0.06
    );
    scene.add(crystal);
  }
}

/* SECTION D: FIVE MIRROR PANELS */

const M_MIRROR_FRAME = new THREE.MeshStandardMaterial({ color: 0x907030, metalness: 0.4, roughness: 0.45 });
const M_MIRROR_DARK = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
const M_SHARD = new THREE.MeshStandardMaterial({ color: 0xc0d0d8, metalness: 0.08, roughness: 0.1 });

function createMirror(z, condition, wallX) {
  const mirrorH = 2.8; const mirrorW = 0.9;
  [4.5 + mirrorH / 2 + 0.06, 4.5 - mirrorH / 2 - 0.06].forEach(fy => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(mirrorW + 0.12, 0.06, 0.05), M_MIRROR_FRAME);
    rail.position.set(wallX, fy, z);
    scene.add(rail);
  });
  [-mirrorW / 2 - 0.03, +mirrorW / 2 + 0.03].forEach(ox => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, mirrorH + 0.12, 0.05), M_MIRROR_FRAME);
    s.position.set(wallX, 4.5 + mirrorH / 2 + 0.06, z + ox);
    scene.add(s);
  });
  if (condition === 'shattered') {
    const backing = new THREE.Mesh(new THREE.PlaneGeometry(mirrorW, mirrorH), M_MIRROR_DARK);
    backing.position.set(wallX + (wallX > 0 ? -0.03 : 0.03), 4.5 + mirrorH / 2, z);
    backing.rotation.y = wallX > 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(backing);
    for (let s = 0; s < 7; s++) {
      const shard = new THREE.Mesh(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.04 + Math.random() * 0.06, 0, 0),
          new THREE.Vector3(Math.random() * 0.05, 0.05 + Math.random() * 0.07, 0)
        ]),
        M_SHARD
      );
      shard.position.set(wallX + (Math.random() - 0.5) * 0.6, 4.52, z + (Math.random() - 0.5) * 0.8);
      shard.rotation.y = wallX > 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(shard);
    }
  } else {
    function drawTarnishedMirror(ctx, w, h) {
      ctx.fillStyle = '#888078'; ctx.fillRect(0, 0, w, h);
      for (let p = 0; p < 5; p++) {
        const grd = ctx.createRadialGradient(
          Math.random() * w, Math.random() * h, 5,
          Math.random() * w, Math.random() * h, 30 + Math.random() * 40
        );
        grd.addColorStop(0, 'rgba(200,195,185,0.5)');
        grd.addColorStop(1, 'rgba(100,95,85,0)');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
      }
      for (let b = 0; b < 8; b++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,18,15,${0.3 + Math.random() * 0.4})`;
        ctx.fill();
      }
    }
    const mirrorTex = makeTexture(256, 512, drawTarnishedMirror);
    const M_MIRROR_TARNISHED = new THREE.MeshStandardMaterial({
      map: mirrorTex, roughness: 0.05, metalness: 0.9, envMapIntensity: 0.3
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(mirrorW, mirrorH), M_MIRROR_TARNISHED);
    face.position.set(wallX + (wallX > 0 ? -0.025 : 0.025), 4.5 + mirrorH / 2, z);
    face.rotation.y = wallX > 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(face);
  }
  collisionWorld.addBox(wallX - 0.08, 4.5, z - mirrorW / 2, wallX + 0.08, 4.5 + mirrorH, z + mirrorW / 2, 'metal', mirrorH);
}

const mirrorPositions = [-2.0, +4.5, -0.5, +2.0, +5.8];
const mirrorConditions = ['shattered', 'shattered', 'tarnished', 'tarnished', 'tarnished'];
mirrorPositions.forEach((z, i) => createMirror(z, mirrorConditions[i], +8.78));

/* SECTION E: UPRIGHT PIANO ON DAIS */

const M_STONE = materials.stone_flags;
const M_WALNUT = materials.dark_walnut;
const M_IVORY = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.5 });
const M_BLACK_KEY = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
const M_KEY_GAP = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.8 });
const M_IRON = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.6, metalness: 0.7 });

const dais = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.28, 1.5), M_STONE);
dais.position.set(0, 4.64, +6.5);
dais.receiveShadow = true;
scene.add(dais);
collisionWorld.addBox(-1.75, 4.5, 5.75, 1.75, 4.78, 7.25, 'stone', 0.28);

const pianoBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.25, 0.6), M_WALNUT);
pianoBody.position.set(0, 5.405, +6.2);
scene.add(pianoBody);
collisionWorld.addBox(-0.72, 4.78, 5.9, 0.72, 6.03, 6.5, 'wood', 1.53);

const lid = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.04, 0.5), M_WALNUT);
lid.position.set(0, 5.54, +6.52);
lid.rotation.x = -0.4;
scene.add(lid);

const keys = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.18), M_IVORY);
keys.position.set(0, 5.42, +5.94);
scene.add(keys);

const blackKeys = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.10), M_BLACK_KEY);
blackKeys.position.set(0, 5.44, +5.94);
scene.add(blackKeys);

[-0.34, 0.08, 0.28].forEach(ox => {
  const gap = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.04, 0.18), M_KEY_GAP);
  gap.position.set(ox, 5.43, +5.94);
  scene.add(gap);
});

[-0.24, 0, 0.24].forEach(ox => {
  const pedal = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6), M_IRON);
  pedal.position.set(ox, 4.78, +5.85);
  scene.add(pedal);
});

const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.32), M_WALNUT);
benchSeat.position.set(0, 5.165, +5.6);
scene.add(benchSeat);

const bl = [[-0.35, -0.14], [0.35, -0.14], [-0.35, 0.14], [0.35, 0.14]];
bl.forEach(([lx, lz]) => {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6), M_WALNUT);
  leg.position.set(lx, 4.78 + 0.175, 5.6 + lz);
  scene.add(leg);
});
collisionWorld.addBox(-0.42, 4.78, 5.44, 0.42, 5.2, 5.76, 'wood', 0.385);

/* SECTION F: SCATTERED GILT BALLROOM CHAIRS */

const M_GOLD = new THREE.MeshStandardMaterial({ color: 0x907030, metalness: 0.45, roughness: 0.4 });

function createBallroomChair(x, z, rotY, lean) {
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.4), materials.velvet_crimson_aged);
  cushion.position.set(x, 4.5 + 0.45, z);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.05), M_GOLD);
  back.position.set(x, 4.5 + 0.81, z - 0.18);
  const legPositions = [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]];
  const legs = legPositions.map(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 6), M_GOLD);
    leg.position.set(x + lx, 4.5 + 0.22, z + lz);
    return leg;
  });
  const group = new THREE.Group();
  group.add(cushion, back, ...legs);
  const splat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.03), M_GOLD);
  splat.position.set(x, 4.5 + 0.81, z - 0.16);
  group.add(splat);
  group.rotation.y = rotY;
  group.rotation.z = lean;
  group.rotation.x = lean * 0.3;
  scene.add(group);
  collisionWorld.addBox(x - 0.25, 4.5, z - 0.25, x + 0.25, 4.5 + 0.45, z + 0.25, 'wood', 0.45);
}

createBallroomChair(-6.5, +1.5, 0.4, 0);
createBallroomChair(-7.2, +3.0, 1.1, 0);
createBallroomChair(-5.8, +4.5, -0.3, -0.12);
createBallroomChair(+6.0, +0.5, -0.7, 0);
createBallroomChair(+7.5, +1.8, 2.2, 0);
createBallroomChair(+6.8, +4.0, 0.8, 0);
createBallroomChair(+1.5, +5.8, 0.2, 0.08);
createBallroomChair(-2.0, +5.5, -0.5, 0.15);

/* SECTION G: EAST WALL FIREPLACE */

const M_SOOT = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.95 });
const M_MANTEL = materials.dark_walnut;
const M_MARBLE_CANDLE = new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.3 });
const M_CANDLE_STUB = new THREE.MeshStandardMaterial({ color: 0xd0c8b8, roughness: 0.6 });
const M_WAX = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.5 });
const M_FIREBOX_BACK = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 });
const M_ASH = new THREE.MeshStandardMaterial({ color: 0x3a3830, roughness: 1.0 });

const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 0.55), materials.limestone_ashlar);
jamb.position.set(+7.75, 4.5 + 0.9, +2.0);
scene.add(jamb);
const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 0.55), materials.limestone_ashlar);
jambR.position.set(+9.85, 4.5 + 0.9, +2.0);
scene.add(jambR);

const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 0.55), materials.limestone_ashlar);
lintel.position.set(+8.8, 4.5 + 1.8 + 0.14, +2.0);
scene.add(lintel);

const fireback = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 0.18), M_SOOT);
fireback.position.set(+9.05, 5.3, +2.0);
scene.add(fireback);

const mantel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 0.35), M_MANTEL);
mantel.position.set(+8.8, 6.44, +1.92);
scene.add(mantel);
collisionWorld.addBox(+7.5, 4.5, 1.7, 10.1, 6.52, 2.3, 'wood', 2.0);

[-0.6, +0.6].forEach(ox => {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), M_MARBLE_CANDLE);
  base.position.set(8.8 + ox, 6.48, +1.95);
  scene.add(base);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.32, 8), M_MARBLE_CANDLE);
  body.position.set(8.8 + ox, 6.66, +1.95);
  scene.add(body);
  for (let ca = 0; ca < 3; ca++) {
    const ang = (ca / 3) * Math.PI * 2;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6), M_GOLD);
    branch.position.set(8.8 + ox + Math.cos(ang) * 0.04, 6.78, 1.95 + Math.sin(ang) * 0.04);
    branch.rotation.z = Math.cos(ang) * 0.3;
    branch.rotation.x = Math.sin(ang) * 0.3;
    scene.add(branch);
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 6), M_CANDLE_STUB);
    stub.position.set(8.8 + ox + Math.cos(ang) * 0.06, 6.82, 1.95 + Math.sin(ang) * 0.06);
    scene.add(stub);
    const wax = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 3), M_WAX);
    wax.position.set(8.8 + ox + Math.cos(ang) * 0.06, 6.80, 1.95 + Math.sin(ang) * 0.06);
    scene.add(wax);
  }
});

const firebox = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.6), M_FIREBOX_BACK);
firebox.position.set(+9.0, 5.22, +2.0);
firebox.rotation.y = -Math.PI / 2;
scene.add(firebox);

const ash = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.03, 0.35), M_ASH);
ash.position.set(+8.5, 4.53, +2.0);
scene.add(ash);

// ── BALLROOM WALL DECORATION: PILASTERS & CORNICES ──
const M_WALL_PIL = new THREE.MeshStandardMaterial({ color: 0xe0d0b0, roughness: 0.7 });
const M_CAP = new THREE.MeshStandardMaterial({ color: 0xd4c4a4, roughness: 0.65 });
const M_CORNICE_BR = new THREE.MeshStandardMaterial({ color: 0xc8b898, roughness: 0.7 });

// East wall pilasters (X=+8.8, Z from +6.0 to -2.0)
for (let pz = -1.5; pz <= 5.5; pz += 2.0) {
  const pil = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.16), M_WALL_PIL);
  pil.position.set(8.78, 6.3, pz);
  scene.add(pil);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.24), M_CAP);
  cap.position.set(8.76, 8.18, pz);
  scene.add(cap);
}

// West wall pilasters (X=-8.8)
for (let pz = -1.5; pz <= 5.5; pz += 2.0) {
  const pil = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.16), M_WALL_PIL);
  pil.position.set(-8.78, 6.3, pz);
  scene.add(pil);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.24), M_CAP);
  cap.position.set(-8.76, 8.18, pz);
  scene.add(cap);
}

// Cornices (4 sides)
const corniceN = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.15, 0.2), M_CORNICE_BR);
corniceN.position.set(0, 8.88, -2.4);
scene.add(corniceN);
const corniceS = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.15, 0.2), M_CORNICE_BR);
corniceS.position.set(0, 8.88, 7.4);
scene.add(corniceS);
const corniceW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 9.8), M_CORNICE_BR);
corniceW.position.set(-8.78, 8.88, 2.5);
scene.add(corniceW);
const corniceE = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 9.8), M_CORNICE_BR);
corniceE.position.set(8.78, 8.88, 2.5);
scene.add(corniceE);

// Cobwebs in upper corners
const M_COBWEB = new THREE.MeshStandardMaterial({
  color: 0xd0c8b8, transparent: true, opacity: 0.25, roughness: 1.0, side: THREE.DoubleSide
});
const cws = [[-8.7, 8.7, -2.3, 0.6], [8.7, 8.7, -2.3, -0.6], [-8.7, 8.7, 7.3, -0.6], [8.7, 8.7, 7.3, 0.6]];
for (const [cx, cy, cz, rot] of cws) {
  const web = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), M_COBWEB);
  web.position.set(cx, cy, cz);
  web.rotation.y = rot;
  scene.add(web);
  }
}

export function init(scene) {
  build();
  registerAudioTrigger('piano_chord', new THREE.Vector3(0, 4.5, +6.2), 2.2, 'playPianoChord');
}

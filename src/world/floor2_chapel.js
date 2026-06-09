import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture, lerpAlong3PointArc } from '../geometry.js?v=2';

function addRib(start, peak, end, segCount, width, mat) {
  for (let s = 0; s < segCount; s++) {
    const t0 = s / segCount;
    const t1 = (s + 1) / segCount;
    const p0 = lerpAlong3PointArc(start, peak, end, t0);
    const p1 = lerpAlong3PointArc(start, peak, end, t1);
    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;
    const cz = (p0.z + p1.z) / 2;
    const len = p0.distanceTo(p1) + 0.01;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(width, width, len), mat);
    seg.position.set(cx, cy, cz);
    seg.lookAt(p1);
    scene.add(seg);
  }
}

const M_STONE = materials.limestone_ashlar;
const M_STONE_FLAGS = materials.stone_flags;
const M_CEILING = materials.stone_ceiling_vault;
const M_WALNUT = materials.dark_walnut;
const M_IRON = materials.iron_rusted;
const M_GOLD = new THREE.MeshStandardMaterial({ color: 0x7a6530, roughness: 0.6 });
const M_DARK_WOOD = materials.dark_wood_furniture;

/* SECTION 7: CHAPEL STRUCTURE AND FLOOR */

function build() {
const northPanel = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 0.04), M_STONE);
northPanel.position.set(-8, 7, -12.98);
scene.add(northPanel);
const southPanel = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 0.04), M_STONE);
southPanel.position.set(-8, 7, -3.02);
scene.add(southPanel);
const westPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 5, 10), M_STONE);
westPanel.position.set(-10.98, 7, -8);
scene.add(westPanel);
const eastPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 5, 10), M_STONE);
eastPanel.position.set(-5.02, 7, -8);
scene.add(eastPanel);

const chapelFloor = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.04, 9.8), M_STONE_FLAGS);
chapelFloor.position.set(-8.0, 4.535, -8.0);
chapelFloor.receiveShadow = true;
scene.add(chapelFloor);

const ribPositions = [-4, -5.5, -7, -8.5, -10, -11.5];
ribPositions.forEach(z => {
  const start = new THREE.Vector3(-11, 4.5 + 3.0, z);
  const peak = new THREE.Vector3(-8, 4.5 + 4.8, z);
  const end = new THREE.Vector3(-5, 4.5 + 3.0, z);
  addRib(start, peak, end, 7, 0.2, M_STONE);
});

for (let b = 0; b < ribPositions.length - 1; b++) {
  const z0 = ribPositions[b];
  const z1 = ribPositions[b + 1];
  const segCount = 7;
  for (let s = 0; s < segCount; s++) {
    const t0 = s / segCount;
    const t1 = (s + 1) / segCount;
    const start0 = new THREE.Vector3(-11, 7.5, z0);
    const peak0 = new THREE.Vector3(-8, 9.3, z0);
    const end0 = new THREE.Vector3(-5, 7.5, z0);
    const p0 = lerpAlong3PointArc(start0, peak0, end0, t0);
    const p1 = lerpAlong3PointArc(start0, peak0, end0, t1);
    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;
    const len = p0.distanceTo(p1) + 0.01;
    const bayZ = (z0 + z1) / 2;
    const bayLen = z1 - z0;
    const infill = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, bayLen), M_CEILING);
    infill.position.set(cx, cy, bayZ);
    infill.lookAt(p1.x, p1.y, bayZ);
    scene.add(infill);
  }
}

/* SECTION 8: PEWS */

function createPew(cx, cz) {
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.055, 0.44), M_WALNUT);
  seat.position.set(cx, 4.5 + 0.45, cz);
  scene.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.055), M_WALNUT);
  back.position.set(cx, 4.5 + 0.73, cz - 0.195);
  scene.add(back);
  [-1.18, +1.18].forEach(ox => {
    const end = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.5), M_WALNUT);
    end.position.set(cx + ox, 4.5 + 0.42, cz);
    scene.add(end);
  });
  const kneel = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.035, 0.22), M_WALNUT);
  kneel.position.set(cx, 4.5 + 0.08, cz + 0.28);
  scene.add(kneel);
  const dust = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x807870, transparent: true, opacity: 0.35, depthWrite: false }));
  dust.rotation.x = -Math.PI / 2;
  dust.position.set(cx, 4.5 + 0.478, cz);
  scene.add(dust);
  collisionWorld.addBox(cx - 1.22, 4.5, cz - 0.25, cx + 1.22, 4.5 + 0.5, cz + 0.25, 'wood', 0.5);
  collisionWorld.addBox(cx - 1.22, 4.5, cz - 0.25, cx + 1.22, 4.5 + 0.82, cz - 0.22, 'wood', 0.82);
}

const pewPositions = [[-9.5, -5], [-9.5, -6.5], [-9.5, -8], [-9.5, -9.5],
  [-6.5, -5], [-6.5, -6.5], [-6.5, -8], [-6.5, -9.5]];
pewPositions.forEach(([x, z]) => createPew(x, z));

/* SECTION 9: STONE ALTAR AND TRIPTYCH */

const altar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.8), M_STONE_FLAGS);
altar.position.set(-8.0, 4.5 + 0.5, -12.0);
scene.add(altar);
collisionWorld.addBox(-9.5, 4.5, -12.4, -6.5, 5.5, -11.6, 'stone', 1.0);

const altarCloth = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 0.95),
  new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 1.0, side: THREE.DoubleSide }));
altarCloth.position.set(-8.0, 5.0, -12.0);
altarCloth.rotation.y = Math.PI;
scene.add(altarCloth);
const clothDrape = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 0.4),
  new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 1.0, side: THREE.DoubleSide }));
clothDrape.position.set(-8.0, 4.5 + 0.85, -11.59);
clothDrape.rotation.x = Math.PI / 2;
scene.add(clothDrape);

const triptychCenter = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.06), M_WALNUT);
triptychCenter.position.set(-8.0, 4.5 + 1.0 + 0.9, -12.38);
scene.add(triptychCenter);

const paintingTex = makeTexture(256, 384, (ctx, w, h) => {
  ctx.fillStyle = '#2a2a1a'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(140,110,40,0.4)';
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.4, 50, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(w * 0.4, h * 0.4, w * 0.2, h * 0.5);
  ctx.fillStyle = 'rgba(160,130,60,0.3)';
  ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.55); ctx.lineTo(w * 0.35, h * 0.25); ctx.lineTo(w * 0.4, h * 0.55); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.85, h * 0.55); ctx.lineTo(w * 0.65, h * 0.25); ctx.lineTo(w * 0.6, h * 0.55); ctx.fill();
});
const painting = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.6),
  new THREE.MeshStandardMaterial({ map: paintingTex, roughness: 0.9 }));
painting.position.set(-8.0, 4.5 + 1.0 + 0.9, -12.35);
scene.add(painting);

const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.5, 0.06), M_WALNUT);
leftPanel.position.set(-8.55, 4.5 + 1.0 + 0.75, -12.35 + Math.sin(-Math.PI / 6) * 0.03);
leftPanel.rotation.y = -Math.PI / 6;
scene.add(leftPanel);

const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.5, 0.06), M_WALNUT);
rightPanel.position.set(-7.45, 4.5 + 1.0 + 0.75, -12.35 + Math.sin(Math.PI / 6) * 0.03);
rightPanel.rotation.y = Math.PI / 6;
scene.add(rightPanel);

const crown = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 0.1), M_GOLD);
crown.position.set(-8.0, 4.5 + 1.0 + 1.8, -12.38);
scene.add(crown);

[-9.3, -6.7].forEach(cx => {
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1815, roughness: 0.9 }));
  candle.position.set(cx, 4.5 + 1.0 + 0.225, -12.0);
  scene.add(candle);
});

/* SECTION 10: EAGLE LECTERN */

const lecternPos = new THREE.Vector3(-9.5, 4.5, -11.5);
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 8), M_WALNUT);
pedestal.position.set(-9.5, 4.5 + 0.525, -11.5);
scene.add(pedestal);

for (let a = 0; a < 3; a++) {
  const ang = (a / 3) * Math.PI * 2;
  const baseLeg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.28), M_WALNUT);
  baseLeg.position.set(-9.5 + Math.sin(ang) * 0.12, 4.5 + 0.04, -11.5 + Math.cos(ang) * 0.12);
  baseLeg.rotation.x = Math.cos(ang) * 0.5;
  baseLeg.rotation.z = Math.sin(ang) * 0.5;
  scene.add(baseLeg);
}

const eagleBody = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), M_WALNUT);
eagleBody.scale.set(0.85, 0.7, 1.1);
eagleBody.position.set(-9.5, 4.5 + 1.1, -11.5);
scene.add(eagleBody);

const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.04), M_WALNUT);
leftWing.position.set(-9.7, 4.5 + 1.15, -11.5);
leftWing.rotation.z = 0.55;
leftWing.rotation.y = -0.3;
scene.add(leftWing);
const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.04), M_WALNUT);
rightWing.position.set(-9.3, 4.5 + 1.15, -11.5);
rightWing.rotation.z = -0.55;
rightWing.rotation.y = 0.3;
scene.add(rightWing);

const eagleHead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), M_WALNUT);
eagleHead.scale.set(0.9, 1.0, 0.9);
eagleHead.position.set(-9.5, 4.5 + 1.22, -11.5);
scene.add(eagleHead);

const beak = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.04),
  new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.8 }));
beak.position.set(-9.5, 4.5 + 1.22, -11.5 + 0.04);
beak.rotation.x = 0.35;
scene.add(beak);

const bookRest = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.03, 0.28), M_WALNUT);
bookRest.position.set(-9.5, 4.5 + 1.3, -11.5 + 0.05);
bookRest.rotation.x = -0.61;
scene.add(bookRest);

collisionWorld.addBox(-9.7, 4.5, -11.7, -9.3, 5.8, -11.3, 'wood', 1.3);

/* SECTION 11: STAINED GLASS LANCET WINDOWS */

const M_LANCET_FRAME = new THREE.MeshStandardMaterial({ color: 0x5a5040, roughness: 0.8 });
const M_LANCET_LEAD = new THREE.MeshStandardMaterial({ color: 0x2a2525, roughness: 0.5, metalness: 0.5 });
const lancetColors = [[0x1a2a8a, 0x8a1a1a, 0x1a7a1a], [0x7a6a10, 0x4a1a7a, 0x1a6a6a]];

[-9.0, -8.0, -7.0].forEach((wx, wi) => {
  const wy = 4.5 + 1.4 + 1.8 / 2;
  const wz = -13 - 0.03;
  const winW = 0.55;
  const winH = 1.8;
  const archRise = 0.25;

  [-winW / 2 - 0.03, winW / 2 + 0.03].forEach(jx => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.05, winH, 0.05), M_LANCET_FRAME);
    jamb.position.set(wx + jx, 4.5 + 1.4 + winH / 2, wz);
    scene.add(jamb);
  });
  const sill = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.06, 0.05, 0.05), M_LANCET_FRAME);
  sill.position.set(wx, 4.5 + 1.4, wz);
  scene.add(sill);
  const head = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.06, 0.05, 0.05), M_LANCET_FRAME);
  head.position.set(wx, 4.5 + 1.4 + winH, wz);
  scene.add(head);

  for (let v = 0; v < 7; v++) {
    const va = (v / 6) * Math.PI - Math.PI / 2;
    const vx = wx + Math.cos(va) * winW * 0.5;
    const vy = (4.5 + 1.4 + winH) + Math.sin(va) * archRise;
    const voussoir = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.08), M_LANCET_FRAME);
    voussoir.position.set(vx, vy, wz);
    voussoir.rotation.z = -va + Math.PI / 2;
    scene.add(voussoir);
  }

  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 3; row++) {
      const px = wx + (col - 0.5) * 0.26;
      const py = 4.5 + 1.4 + 0.3 + row * 0.57;
      const colorIdx = col * 3 + row;
      const color = lancetColors[col][row];
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.52),
        new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.72, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.2 }));
      pane.position.set(px, py, wz + 0.01);
      scene.add(pane);
    }
  }

  [-0.26 / 2, 0.26 / 2].forEach(cx => {
    const divider = new THREE.Mesh(new THREE.BoxGeometry(0.005, 1.7, 0.005), M_LANCET_LEAD);
    divider.position.set(wx + cx, 4.5 + 1.4 + winH / 2, wz + 0.015);
    scene.add(divider);
  });
  for (let r = 0; r < 2; r++) {
    const divider = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.005, 0.005), M_LANCET_LEAD);
    divider.position.set(wx, 4.5 + 1.4 + 0.3 + r * 0.57 + 0.26, wz + 0.015);
    scene.add(divider);
  }
});

/* SECTION 12: FLOOR-STANDING CANDELABRA */

[[-9.3, -11.8], [-6.7, -11.8]].forEach(([cx, cz]) => {
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 1.45, 8), M_IRON);
  shaft.position.set(cx, 4.5 + 0.725, cz);
  scene.add(shaft);
  for (let a = 0; a < 3; a++) {
    const ang = (a / 3) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 6), M_IRON);
    arm.position.set(cx + Math.cos(ang) * 0.12, 4.5 + 1.3 + Math.sin(Math.PI / 9) * 0.17, cz + Math.sin(ang) * 0.12);
    arm.rotation.x = Math.cos(ang) * 0.35;
    arm.rotation.z = -Math.sin(ang) * 0.35;
    scene.add(arm);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.04, 6), M_IRON);
    cup.position.set(cx + Math.cos(ang) * 0.28, 4.5 + 1.45, cz + Math.sin(ang) * 0.28);
    scene.add(cup);
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6),
      new THREE.MeshStandardMaterial({ color: 0xd0c8a8, roughness: 0.6 }));
    stub.position.set(cx + Math.cos(ang) * 0.28, 4.5 + 1.47, cz + Math.sin(ang) * 0.28);
    scene.add(stub);
    for (let w = 0; w < 3; w++) {
      const wax = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 3),
        new THREE.MeshStandardMaterial({ color: 0xd0c8a0, roughness: 0.5 }));
      wax.position.set(
        cx + Math.cos(ang) * 0.28 + (Math.random() - 0.5) * 0.04,
        4.5 + 1.45,
        cz + Math.sin(ang) * 0.28 + (Math.random() - 0.5) * 0.04
      );
      scene.add(wax);
    }
  }
  for (let a = 0; a < 3; a++) {
    const ang = (a / 3) * Math.PI * 2;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.25), M_IRON);
    foot.position.set(cx + Math.sin(ang) * 0.12, 4.5 + 0.04, cz + Math.cos(ang) * 0.12);
    foot.rotation.x = Math.cos(ang) * 0.6;
    foot.rotation.z = Math.sin(ang) * 0.6;
    scene.add(foot);
  }
  collisionWorld.addBox(cx - 0.15, 4.5, cz - 0.15, cx + 0.15, 5.95, cz + 0.15, 'metal', 1.45);
});
}

export function init(scene) {
  build();
}

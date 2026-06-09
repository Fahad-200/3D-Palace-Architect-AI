import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture } from '../geometry.js?v=2';

const M_WALNUT = materials.dark_walnut;
const M_CARPET = materials.persian_carpet_faded;
const M_PLASTER = materials.plaster_aged;
const M_DARK_WOOD = materials.dark_wood_furniture;
const M_VELVET = materials.velvet_crimson_aged;
const M_IRON = materials.iron_rusted;
const M_GOLD = new THREE.MeshStandardMaterial({ color: 0x908030, roughness: 0.4, metalness: 0.5 });
const M_MATT_BLACK = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1.0 });
const M_PLASTER_CHUNK = new THREE.MeshStandardMaterial({ color: 0xc0b8a8, roughness: 0.95 });
const M_SILVER = new THREE.MeshStandardMaterial({ color: 0x909090, metalness: 0.7, roughness: 0.4 });

/* SECTION 1: FLOOR, WALLS, CEILING */

function build() {
const woodFloor = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.035, 7.8), M_WALNUT);
woodFloor.position.set(0, 9.035, 1);
woodFloor.receiveShadow = true;
scene.add(woodFloor);

const carpet = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.02, 6.5), M_CARPET);
carpet.position.set(0, 9.057, 1);
scene.add(carpet);

for (let e = 0; e < 8; e++) {
  const side = Math.floor(e / 2);
  const isEven = e % 2 === 0;
  const len = 1.0 + Math.random() * 1.5;
  const fray = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, len),
    new THREE.MeshStandardMaterial({ map: M_CARPET.map, roughness: 0.95 }));
  const cx = side === 0 || side === 1 ? (isEven ? -4.0 : 4.0) : (isEven ? -3.0 : 3.0) + (Math.random() - 0.5) * 0.5;
  const cz = side === 0 || side === 1 ? 1 + (Math.random() - 0.5) * 5 : (side === 2 ? -1.8 : 3.8) + (Math.random() - 0.5) * 0.3;
  fray.position.set(side < 2 ? cx : (isEven ? -4.0 : 4.0), 9.068, side < 2 ? (side === 0 ? -2.2 : 4.2) : cz);
  fray.rotation.z = (side === 0 || side === 1) ? (isEven ? 0.08 : -0.06) : (Math.random() - 0.5) * 0.1;
  fray.rotation.x = (side < 2) ? (Math.random() - 0.5) * 0.1 : (isEven ? 0.05 : -0.04);
  scene.add(fray);
}

const wallMat = M_PLASTER;
[[-4.9, 0, 1, 0.04, 4, 8, 0], [4.9, 0, 1, 0.04, 4, 8, 0], [0, 0, -2.9, 10, 4, 0.04, 0], [0, 0, 4.9, 10, 4, 0.04, 0]].forEach(([px, py, pz, sx, sy, sz]) => {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), wallMat);
  panel.position.set(px, 9 + 2, pz);
  scene.add(panel);
});

[[-4.9, 1, 0, 10, 0.15, 0.02], [4.9, 1, 0, 10, 0.15, 0.02], [0, 1, -2.9, 0.02, 0.15, 8], [0, 1, 4.9, 0.02, 0.15, 8]].forEach(([px, py, pz, sx, sy, sz]) => {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz),
    new THREE.MeshStandardMaterial({ color: 0xb0a898, roughness: 0.8 }));
  rail.position.set(px, 9 + 1.2, pz);
  scene.add(rail);
});

const frescoCeil = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.03, 7.6),
  new THREE.MeshStandardMaterial({
    map: makeTexture(512, 256, (ctx, w, h) => {
      ctx.fillStyle = '#8a9aaa'; ctx.fillRect(0, 0, w, h);
      for (let c = 0; c < 6; c++) {
        const grd = ctx.createRadialGradient(Math.random() * w, Math.random() * h * 0.5, 5, Math.random() * w, Math.random() * h * 0.5, 40 + Math.random() * 60);
        grd.addColorStop(0, 'rgba(210,200,185,0.5)'); grd.addColorStop(1, 'rgba(160,155,145,0)');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
      }
      ctx.fillStyle = 'rgba(190,175,155,0.35)';
      ctx.beginPath(); ctx.ellipse(w * 0.3, h * 0.6, 15, 40, -0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.7, h * 0.5, 20, 45, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(200,190,165,0.25)';
      ctx.beginPath(); ctx.ellipse(w * 0.55, h * 0.35, 55, 18, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5a5040'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.moveTo(Math.random() * w, Math.random() * h); ctx.lineTo(Math.random() * w, Math.random() * h); ctx.stroke(); }
      ctx.fillStyle = '#6a5a48'; ctx.beginPath(); ctx.moveTo(w * 0.78, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.32); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4a3828'; ctx.beginPath(); ctx.moveTo(w * 0.82, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 1;
      for (let l = 0; l < 6; l++) { ctx.beginPath(); ctx.moveTo(w * 0.78 + l * 8, 0); ctx.lineTo(w, l * 12); ctx.stroke(); }
    })
  }));
frescoCeil.position.set(0, 12.97, 1);
scene.add(frescoCeil);

[[4.2, -2.5], [4.6, -2.1], [3.8, -2.8]].forEach(([cx, cz]) => {
  const chunk = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12 + Math.random() * 0.1, 0), M_PLASTER_CHUNK);
  chunk.position.set(cx, 9.04, cz);
  chunk.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  scene.add(chunk);
  collisionWorld.addBox(cx - 0.15, 9, cz - 0.15, cx + 0.15, 9 + 0.15, cz + 0.15, 'rubble', 0.12);
});

/* SECTION 2: FOUR-POSTER BED */

const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 2.0), M_DARK_WOOD);
bedBase.position.set(0, 9 + 0.275, 2.5);
scene.add(bedBase);
collisionWorld.addBox(-1.12, 9, 1.5, 1.12, 9.55, 3.5, 'wood', 0.55);

const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.26, 1.88),
  new THREE.MeshStandardMaterial({ color: 0x808070, roughness: 0.97 }));
mattress.position.set(0, 9.55 + 0.13, 2.5);
mattress.scale.y = 0.9;
scene.add(mattress);

const M_POST = materials.dark_wood_furniture;
[[-1.0, 1.6], [1.0, 1.6], [-1.0, 3.4], [1.0, 3.4]].forEach(([px, pz]) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), M_POST);
  post.position.set(px, 9 + 1.25, pz);
  scene.add(post);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), M_POST);
  face.position.set(px, 9 + 2.45, pz);
  scene.add(face);
  [-0.03, 0.03].forEach(ox => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), M_MATT_BLACK);
    eye.position.set(px + ox, 9 + 2.45, pz + 0.04);
    scene.add(eye);
  });
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.04), M_POST);
  brow.position.set(px, 9 + 2.48, pz + 0.04);
  scene.add(brow);
  collisionWorld.addBox(px - 0.1, 9, pz - 0.1, px + 0.1, 11.5, pz + 0.1, 'wood', 2.5);
});

const postPairs = [[-1.0, 1.6, 1.0, 1.6], [-1.0, 3.4, 1.0, 3.4], [-1.0, 1.6, -1.0, 3.4], [1.0, 1.6, 1.0, 3.4]];
postPairs.forEach(([x1, z1, x2, z2]) => {
  const span = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, span), M_POST);
  beam.position.set((x1 + x2) / 2, 9 + 2.45, (z1 + z2) / 2);
  beam.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  scene.add(beam);
  const valance = new THREE.Mesh(new THREE.BoxGeometry(span, 0.08, 0.04), M_VELVET);
  valance.position.set((x1 + x2) / 2, 9 + 2.5, (z1 + z2) / 2);
  valance.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  scene.add(valance);
});

const curtainData = [
  { x: -0.94, z: 1.6, rotX: 0, side: 0 },
  { x: 0.94, z: 1.6, rotX: 0.35, side: 1 },
  { x: -0.94, z: 3.4, rotX: 0, side: 2 },
  { x: 0.94, z: 3.4, rotX: 0, side: 3 }
];
curtainData.forEach(({ x, z, rotX, side }) => {
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 2.4), M_VELVET);
  curtain.position.set(x, 9 + 2.5 - 1.2, z);
  curtain.rotation.y = Math.atan2(0, 1);
  curtain.rotation.x = rotX;
  if (side === 2) {
    scene.add(curtain);
    const torn = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.0), M_VELVET);
    torn.position.set(x + 0.15, 9 + 2.5 - 2.1, z - 0.1);
    torn.rotation.y = 0.6;
    torn.rotation.x = 0.2;
    scene.add(torn);
  } else {
    scene.add(curtain);
  }
});

const sag = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.7), M_VELVET);
sag.position.set(0, 9 + 2.38, 2.5);
scene.add(sag);

const sideTable = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.66, 0.4), M_DARK_WOOD);
sideTable.position.set(-1.4, 9 + 0.33, 2.0);
scene.add(sideTable);
const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.38), M_DARK_WOOD);
drawer.position.set(-1.5, 9 + 0.3, 2.0);
scene.add(drawer);
const photo = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.14), M_SILVER);
photo.position.set(-1.4, 9.67, 2.0);
photo.rotation.z = 0.1;
scene.add(photo);
collisionWorld.addBox(-1.65, 9, 1.8, -1.15, 9.66, 2.2, 'wood', 0.66);

/* SECTION 3: WARDROBE */

const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.3, 0.65), M_DARK_WOOD);
wardrobe.position.set(4.35, 9 + 1.15, 1.5);
scene.add(wardrobe);
collisionWorld.addBox(3.46, 9, 1.18, 5.24, 11.3, 1.82, 'wood', 2.3);

const crownMolding = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 0.72), M_DARK_WOOD);
crownMolding.position.set(4.35, 9 + 2.3, 1.5);
scene.add(crownMolding);

const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(0.86, 2.1, 0.04), M_DARK_WOOD);
leftDoor.position.set(3.98, 9 + 1.05, 1.5);
leftDoor.rotation.y = -1.22;
scene.add(leftDoor);
const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(0.86, 2.1, 0.04), M_DARK_WOOD);
rightDoor.position.set(4.98, 9 + 1.05, 1.5);
rightDoor.rotation.y = 0.96;
scene.add(rightDoor);

[[3.54, 0.3], [3.54, 1.05], [3.54, 1.8]].forEach(([hx, hy]) => {
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.08), M_IRON);
  hinge.position.set(hx, 9 + hy, 1.5);
  scene.add(hinge);
});
[[4.54, 0.3], [4.54, 1.05], [4.54, 1.8]].forEach(([hx, hy]) => {
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.08), M_IRON);
  hinge.position.set(hx, 9 + hy, 1.5);
  scene.add(hinge);
});

const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.75, 6), M_IRON);
rod.rotation.x = Math.PI / 2;
rod.position.set(4.35, 9 + 1.8, 1.5);
scene.add(rod);

for (let h = 0; h < 6; h++) {
  const hanger = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x6a6a5a, roughness: 0.8 }));
  hanger.position.set(3.7 + h * 0.26, 9 + 1.72, 1.5);
  scene.add(hanger);
  if (h === 3) {
    const coat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.75, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.8 }));
    coat.position.set(3.7 + h * 0.26, 9 + 1.35, 1.5);
    scene.add(coat);
    [-0.18, 0.18].forEach(ox => {
      const ep = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.1), M_GOLD);
      ep.position.set(3.7 + h * 0.26 + ox, 9 + 1.7, 1.5);
      scene.add(ep);
    });
    for (let e = 0; e < 5; e++) {
      const hole = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.7 }));
      hole.position.set(3.7 + h * 0.26 + (Math.random() - 0.5) * 0.3, 9 + 1.3 + Math.random() * 0.4, 1.5);
      scene.add(hole);
    }
  }
}

const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.035, 0.6), M_DARK_WOOD);
shelf1.position.set(4.35, 9 + 2.0, 1.5);
scene.add(shelf1);
const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.035, 0.6), M_DARK_WOOD);
shelf2.position.set(4.35, 9 + 2.18, 1.5);
scene.add(shelf2);
const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.4),
  new THREE.MeshStandardMaterial({ color: 0x808078, roughness: 0.95 }));
cloth.position.set(4.2, 9 + 2.03, 1.5);
scene.add(cloth);
const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.18), M_DARK_WOOD);
box.position.set(4.5, 9 + 2.08, 1.5);
scene.add(box);

/* SECTION 4: DRESSING TABLE AND CRACKED MIRROR */

const dressTable = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.5), M_DARK_WOOD);
dressTable.position.set(-3.0, 9 + 0.375, -2.4);
scene.add(dressTable);
collisionWorld.addBox(-3.55, 9, -2.65, -2.45, 9.75, -2.15, 'wood', 0.75);

const M_MIRROR = new THREE.MeshStandardMaterial({ color: 0x888078, roughness: 0.05, metalness: 0.9, envMapIntensity: 0.3, transparent: true, opacity: 0.6 });
const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.04), M_DARK_WOOD);
mirrorFrame.position.set(-3.0, 9 + 0.75 + 0.45, -2.35);
mirrorFrame.rotation.x = 0.12;
scene.add(mirrorFrame);
const mirrorFace = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), M_MIRROR);
mirrorFace.position.set(-3.0, 9 + 0.75 + 0.45, -2.33);
mirrorFace.rotation.x = 0.12;
scene.add(mirrorFace);

for (let r = 0; r < 8; r++) {
  const ra = (r / 8) * Math.PI * 2;
  const len = 0.06 + Math.random() * 0.08;
  const crack = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.015, len),
    new THREE.MeshStandardMaterial({ color: 0x1a1818, roughness: 1.0 }));
  crack.position.set(-3.0, 9 + 1.2, -2.32);
  crack.rotation.y = Math.PI / 2;
  crack.rotation.z = ra + (Math.random() - 0.5) * 0.3;
  scene.add(crack);
}
const impact = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), M_MATT_BLACK);
impact.position.set(-3.0, 9 + 1.2, -2.32);
scene.add(impact);

const brush = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.04), M_DARK_WOOD);
brush.position.set(-3.2, 9.76, -2.38);
scene.add(brush);
const brushHead = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), M_DARK_WOOD);
brushHead.position.set(-3.2, 9.76, -2.34);
scene.add(brushHead);

const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.09, 8),
  new THREE.MeshStandardMaterial({ color: 0x2a6a4a, transparent: true, opacity: 0.6 }));
bottle.position.set(-2.85, 9.79, -2.38);
scene.add(bottle);

for (let p = 0; p < 3; p++) {
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.06, 6), M_IRON);
  pin.position.set(-3.05 + (Math.random() - 0.5) * 0.2, 9.76, -2.45 + (Math.random() - 0.5) * 0.1);
  pin.rotation.z = (Math.random() - 0.5) * 0.5;
  scene.add(pin);
}

const compact = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.06), M_SILVER);
compact.position.set(-2.9, 9.76, -2.45);
scene.add(compact);
const compactLid = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.06), M_SILVER);
compactLid.position.set(-2.9, 9.77, -2.45);
compactLid.rotation.x = 0.6;
scene.add(compactLid);

/* SECTION 5: CHAISE LONGUE AND WINDOW */

const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.44, 0.72), M_VELVET);
chaise.position.set(-3.0, 9 + 0.22, 4.3);
scene.add(chaise);
const headRest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.32, 0.72), M_VELVET);
headRest.position.set(-3.9, 9 + 0.44 + 0.16, 4.3);
scene.add(headRest);

[[-3.9, 4.3], [-3.3, 4.3], [-2.1, 4.3]].forEach(([cx, cz]) => {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.44, 6), M_DARK_WOOD);
  leg.position.set(cx, 9 + 0.22, cz);
  scene.add(leg);
});

const split = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.04, 1.7),
  new THREE.MeshStandardMaterial({ color: 0x2a1010 }));
split.position.set(-3.0, 9.24, 4.3);
scene.add(split);
collisionWorld.addBox(-3.9, 9, 3.94, -2.1, 9 + 0.44, 4.66, 'wood', 0.44);

const sill = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.35), materials.stone_flags);
sill.position.set(0, 9.9, 4.82);
scene.add(sill);
const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.4),
  new THREE.MeshStandardMaterial({ color: 0x404848, transparent: true, opacity: 0.4, roughness: 0.15, side: THREE.DoubleSide }));
glass.position.set(0, 9 + 0.9 + 0.7, 4.99);
scene.add(glass);
const cornerCrack = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.15),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
cornerCrack.position.set(0.35, 9 + 0.9 + 0.7 + 0.5, 4.99);
cornerCrack.rotation.x = 0.7;
cornerCrack.rotation.z = 0.3;
scene.add(cornerCrack);
}

export function init(scene) {
  build();
}

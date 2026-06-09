import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';

const M_CARPET = materials.persian_carpet_faded;
const M_WAINSCOT = materials.dark_walnut;
const M_GILT = new THREE.MeshStandardMaterial({ color: 0x907030, metalness: 0.4, roughness: 0.45 });
const M_CEILING = materials.stone_ceiling_vault;
const M_CORNICE = new THREE.MeshStandardMaterial({ color: 0xa09080, roughness: 0.8 });
const M_COBWEB = new THREE.MeshStandardMaterial({ color: 0xd0c8b8, transparent: true, opacity: 0.2, roughness: 1.0, side: THREE.DoubleSide });
const M_TABLE = materials.dark_walnut;
const M_IRON = materials.iron_rusted;

const portraitSizes = [
  [0.55, 0.75], [0.65, 0.85], [0.7, 0.9], [0.6, 0.8], [0.8, 1.05], [0.58, 0.78], [0.62, 0.82],
  [0.72, 0.95], [0.55, 0.75], [0.68, 0.88], [0.75, 1.0], [0.6, 0.8], [0.65, 0.85], [0.7, 0.9]
];
const conditions = [
  'intact_dark', 'cracked_frame', 'yellow_canvas', 'mold_spots', 'water_damage',
  'slash', 'intact_dark',
  'cracked_frame', 'yellow_canvas', 'mold_spots', 'water_damage',
  'mold_spots', 'water_damage', 'intact_dark'
];
const westZ = [-3.8, -5.2, -6.0, -7.0, -8.2, -9.4, -11.2];
const eastZ = [-4.5, -5.8, -6.8, -7.8, -8.8, -10.0, -11.5];

function addCobweb(x, y, z, rx, ry, rz, scaleX, scaleY, phase) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(scaleX, scaleY, 3, 3), M_COBWEB);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.userData.isCobweb = true;
  mesh.userData.phase = phase;
  scene.add(mesh);
}

function createPortrait(x, z, wallSide, idx) {
  const [fw, fh] = portraitSizes[idx];
  const cond = conditions[idx];
  const rotY = wallSide === 'west' ? Math.PI / 2 : -Math.PI / 2;
  const y = 1.65;
  const depth = 0.03;

  const fwd = (d) => new THREE.Vector3(0, 0, d).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  const side = (d) => new THREE.Vector3(d, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);

  // Frame
  const frameMat = cond === 'cracked_frame' ? M_GILT.clone() : M_GILT;
  const frameRotZ = cond === 'cracked_frame' ? 0.04 : 0;

  const topRail = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.04, depth), frameMat);
  topRail.position.set(x, y + fh / 2, z);
  topRail.rotation.y = rotY;
  topRail.rotation.z = frameRotZ;
  scene.add(topRail);

  const botRail = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.04, depth), frameMat);
  botRail.position.set(x, y - fh / 2, z);
  botRail.rotation.y = rotY;
  botRail.rotation.z = frameRotZ;
  scene.add(botRail);

  const stileOffset = fw / 2 - 0.02;
  for (const dir of [-1, 1]) {
    const sOff = side(dir * stileOffset);
    const stile = new THREE.Mesh(new THREE.BoxGeometry(0.04, fh - 0.04, depth), frameMat);
    stile.position.set(x + sOff.x, y, z + sOff.z);
    stile.rotation.y = rotY;
    stile.rotation.z = frameRotZ;
    scene.add(stile);
  }

  // Canvas
  let canvasColor = 0x3a3020;
  if (cond === 'yellow_canvas') canvasColor = 0xa09040;
  else if (cond === 'mold_spots' || cond === 'water_damage') canvasColor = 0x3a3828;

  const canvasMat = new THREE.MeshStandardMaterial({ color: canvasColor, roughness: 0.95 });
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(fw - 0.08, fh - 0.1), canvasMat);
  const cOff = fwd(depth + 0.005);
  canvas.position.set(x + cOff.x, y, z + cOff.z);
  canvas.rotation.y = rotY;
  scene.add(canvas);

  // Condition-specific overlays
  if (cond === 'mold_spots') {
    for (let m = 0; m < 5; m++) {
      const mold = new THREE.Mesh(new THREE.SphereGeometry(0.04 + Math.random() * 0.07, 5, 5),
        new THREE.MeshStandardMaterial({ color: 0x3a4a28, transparent: true, opacity: 0.7 }));
      mold.scale.z = 0.2;
      const mOff = fwd(depth + 0.01 + Math.random() * 0.01);
      const mSide = side((Math.random() - 0.5) * (fw - 0.2));
      mold.position.set(x + mSide.x + mOff.x, y + (Math.random() - 0.5) * (fh - 0.2), z + mSide.z + mOff.z);
      mold.rotation.y = rotY;
      scene.add(mold);
    }
  }

  if (cond === 'water_damage') {
    for (let w = 0; w < 2; w++) {
      const stain = new THREE.Mesh(new THREE.PlaneGeometry(0.3 + Math.random() * 0.2, 0.2 + Math.random() * 0.3),
        new THREE.MeshStandardMaterial({ color: 0x5a4830, transparent: true, opacity: 0.35, roughness: 1.0 }));
      const wOff = fwd(depth + 0.01);
      const wSide = side((Math.random() - 0.5) * (fw - 0.3));
      stain.position.set(x + wSide.x + wOff.x, y + (Math.random() - 0.5) * (fh - 0.4), z + wSide.z + wOff.z);
      stain.rotation.y = rotY;
      scene.add(stain);
    }
  }

  if (cond === 'slash') {
    const slash = new THREE.Mesh(new THREE.BoxGeometry(0.02, fh * 0.7, depth + 0.01),
      new THREE.MeshStandardMaterial({ color: 0x1a1010, roughness: 1.0 }));
    const sOff2 = fwd(depth + 0.01);
    slash.position.set(x + sOff2.x, y, z + sOff2.z);
    slash.rotation.y = rotY;
    slash.rotation.z = 0.55;
    scene.add(slash);
  }
}

export const collidables = [];

export function init(sc) {
  // ═════════════════════════════════════════════
  // SECTION 1: GALLERY FLOOR AND WALLS
  // ═════════════════════════════════════════════

  const runner = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.02, 19.6), M_CARPET);
  runner.position.set(8.25, 0.01, -7.1);
  runner.receiveShadow = true;
  scene.add(runner);

  for (const wx of [6.55, 9.95]) {
    const wainscot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.1, 19.6), M_WAINSCOT);
    wainscot.position.set(wx, 0.55, -7.1);
    scene.add(wainscot);
  }

  // ═════════════════════════════════════════════
  // SECTION 2: 14 PORTRAIT FRAMES WITH CANVASES
  // ═════════════════════════════════════════════

  for (let i = 0; i < 7; i++) {
    createPortrait(6.58, westZ[i], 'west', i);
    createPortrait(9.92, eastZ[i], 'east', i + 7);
  }

  // ═════════════════════════════════════════════
  // SECTION 3: OCCASIONAL TABLES AND PROPS
  // ═════════════════════════════════════════════

  const tableZ = [-4.5, -7.5, -10.0];
  for (const tz of tableZ) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.4), M_TABLE);
    top.position.set(6.78, 0.77, tz);
    top.castShadow = true;
    scene.add(top);

    for (const lx of [-0.3, 0.3]) {
      for (const lz of [-0.15, 0.15]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.75, 5), M_TABLE);
        leg.position.set(6.78 + lx, 0.375, tz + lz);
        scene.add(leg);
      }
    }

    collisionWorld.addBox(6.78 - 0.35, 0, tz - 0.2, 6.78 + 0.35, 0.79, tz + 0.2, 'wood', 0.79);
  }

  // Table 1 props (Z=-4.5): overturned candlestick
  const candlestick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.04, 0.4, 6), M_IRON);
  candlestick.position.set(6.55, 0.75, -4.5);
  candlestick.rotation.x = Math.PI / 2;
  candlestick.rotation.z = 0.3;
  scene.add(candlestick);

  // Table 2 props (Z=-7.5): cracked vase
  const vase = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 0.85 }));
  vase.scale.set(1, 0.8, 0.9);
  vase.position.set(7.0, 0.79, -7.5);
  scene.add(vase);
  for (let vc = 0; vc < 3; vc++) {
    const vCrack = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.04 + Math.random() * 0.04),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1.0 }));
    vCrack.position.set(7.0 + (Math.random() - 0.5) * 0.15, 0.79, -7.5 + (Math.random() - 0.5) * 0.15);
    vCrack.rotation.z = (Math.random() - 0.5) * 0.3;
    vCrack.rotation.y = Math.random() * Math.PI;
    scene.add(vCrack);
  }

  // Table 3 props (Z=-10.0): leather book
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.9 }));
  book.position.set(6.7, 0.77, -10.05);
  book.scale.set(1.08, 1.3, 1);
  scene.add(book);

  // ═════════════════════════════════════════════
  // SECTION 4: COBWEBS AND CEILING CORNICE
  // ═════════════════════════════════════════════

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 19.8), M_CEILING);
  ceiling.position.set(8.25, 4.47, -7.1);
  scene.add(ceiling);

  for (const cx of [6.55, 9.95]) {
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 19.8), M_CORNICE);
    cornice.position.set(cx, 4.38, -7.1);
    scene.add(cornice);
  }

  addCobweb(6.6, 4.3, -2.2, 0, 0, 0.6, 0.7, 0.5, 0);
  addCobweb(9.9, 4.3, -2.2, 0, Math.PI, -0.6, 0.7, 0.5, 1);
  addCobweb(6.6, 4.3, -11.9, 0, 0, -0.5, 0.7, 0.5, 2);
  addCobweb(9.9, 4.3, -11.9, 0, Math.PI, 0.5, 0.7, 0.5, 3);
  addCobweb(6.6, 4.3, -7.1, 0, 0, 0.3, 0.5, 0.4, 4);
  addCobweb(9.9, 4.3, -7.1, 0, Math.PI, -0.3, 0.5, 0.4, 5);
}

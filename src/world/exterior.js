import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { addWall } from '../geometry.js?v=2';
import { materials } from '../materials.js?v=2';

const M_STONE = materials.limestone_ashlar;
const M_STONE_FLAGS = materials.stone_flags;
const M_IRON = materials.iron_rusted;
const M_DARKWOOD = materials.dark_wood_furniture;
const M_DARKSTONE = new THREE.MeshStandardMaterial({ color: 0x6b6259, roughness: 0.92 });
const M_WATER_STAIN = new THREE.MeshStandardMaterial({ color: 0x2a2520, transparent: true, opacity: 0.55, roughness: 1.0 });
const M_GLASS = new THREE.MeshStandardMaterial({ color: 0x1a1a18, transparent: true, opacity: 0.45, roughness: 0.1, metalness: 0.0 });
const M_PATH = new THREE.MeshStandardMaterial({ color: 0x7a7266, roughness: 0.95 });
const M_CRACK = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 1.0 });
const M_KEYSTONE = new THREE.MeshStandardMaterial({ color: 0x9a8e7e, roughness: 0.85 });
const M_PLAQUE = new THREE.MeshStandardMaterial({ color: 0x9a8e80, roughness: 0.85 });
const M_GROTESQUE = new THREE.MeshStandardMaterial({ color: 0x7a6e60, roughness: 0.95 });
const M_MOSS = new THREE.MeshStandardMaterial({ color: 0x2a3820, transparent: true, opacity: 0.35, roughness: 1.0 });
const M_SLATE = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.95 });
const M_RECESS = new THREE.MeshStandardMaterial({ color: 0x7a7060, roughness: 0.95 });
const M_DARK_RECESS = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.95 });
const M_CORNICE = new THREE.MeshStandardMaterial({ color: 0x9a8e80, roughness: 0.85 });
const M_FAR_GROUND = new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 1.0 });

export function init(sc) {
  // ═════════════════════════════════════════════
  // SECTION A: EXTERIOR GROUND PLANE
  // ═════════════════════════════════════════════

  const courtyard = new THREE.Mesh(
    new THREE.BoxGeometry(80, 0.3, 35),
    M_STONE_FLAGS
  );
  courtyard.position.set(0, -0.15, 27);
  courtyard.receiveShadow = true;
  scene.add(courtyard);
  collisionWorld.addBox(-40, -0.3, 9.75, 40, 0, 44.25, 'stone', 0);

  const pathway = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.06, 28),
    M_PATH
  );
  pathway.position.set(0, 0.03, 26.5);
  pathway.receiveShadow = true;
  scene.add(pathway);
  collisionWorld.addBox(-1.5, 0, 12.5, 1.5, 0.06, 40.5, 'stone', 0);

  const crackPositions = [14, 17, 20.5, 23, 27, 30, 33, 37];
  for (const cz of crackPositions) {
    const crackLen = 0.4 + Math.random() * 0.8;
    const crack = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.01, crackLen),
      M_CRACK
    );
    crack.position.set((Math.random() - 0.5) * 2.4, 0.07, cz);
    crack.rotation.y = (Math.random() - 0.5) * 0.6;
    scene.add(crack);
  }

  const farGround = new THREE.Mesh(
    new THREE.BoxGeometry(200, 0.3, 60),
    M_FAR_GROUND
  );
  farGround.position.set(0, -0.15, 70);
  farGround.receiveShadow = true;
  scene.add(farGround);

  // ═════════════════════════════════════════════
  // SECTION B: DEAD LANTERN POSTS (8 total)
  // ═════════════════════════════════════════════

  const postPositions = [
    { x: -2.8, z: 20 }, { x: +2.8, z: 20 },
    { x: -2.8, z: 24 }, { x: +2.8, z: 24 },
    { x: -2.8, z: 28 }, { x: +2.8, z: 28 },
    { x: -2.8, z: 32 }, { x: +2.8, z: 32 },
  ];

  for (const pp of postPositions) {
    const isBroken = pp.x === -2.8 && pp.z === 24;
    const isTilted = pp.x === +2.8 && pp.z === 32;

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 3.6, 6),
      M_IRON
    );
    pole.position.set(pp.x, 1.8, pp.z);
    if (isTilted) {
      pole.rotation.z = 0.28;
    } else if (!isBroken) {
      pole.rotation.x = (Math.random() - 0.5) * 0.12;
      pole.rotation.z = (Math.random() - 0.5) * 0.1;
    }
    pole.castShadow = true;
    scene.add(pole);
    collisionWorld.addBox(pp.x - 0.15, 0, pp.z - 0.15, pp.x + 0.15, 3.6, pp.z + 0.15, 'metal', 3.6);

    if (!isBroken) {
      const lantern = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.38, 0.3),
        M_IRON
      );
      lantern.position.set(pp.x, 3.6 + 0.19, pp.z);
      lantern.castShadow = true;
      scene.add(lantern);

      for (let gi = 0; gi < 4; gi++) {
        const gAngle = (gi / 4) * Math.PI * 2;
        const glass = new THREE.Mesh(
          new THREE.PlaneGeometry(0.28, 0.32),
          M_GLASS
        );
        glass.position.set(
          pp.x + Math.cos(gAngle) * 0.165,
          3.6 + 0.19,
          pp.z + Math.sin(gAngle) * 0.165
        );
        glass.rotation.y = gAngle;
        scene.add(glass);
      }
    } else {
      const fallenLantern = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.38, 0.3),
        M_IRON
      );
      fallenLantern.position.set(pp.x + 0.4, 0.2, pp.z + 0.3);
      fallenLantern.rotation.x = Math.random() * 0.5;
      fallenLantern.rotation.z = Math.random() * 0.5;
      scene.add(fallenLantern);
    }
  }

  // ═════════════════════════════════════════════
  // SECTION C: GOTHIC ARCH ENTRANCE GATE
  // ═════════════════════════════════════════════

  // Left and right jambs
  addWall(-2.1, 0, 12.2, 1.2, 2.0, 0.7, M_STONE, 'stone');
  addWall(+2.1, 0, 12.2, 1.2, 2.0, 0.7, M_STONE, 'stone');

  // Wall returns above jambs, below arch springing
  addWall(-1.5, 1.0, 12.2, 1.5, 2.3, 0.6, M_STONE, 'stone');
  addWall(+1.5, 1.0, 12.2, 1.5, 2.3, 0.6, M_STONE, 'stone');

  // Voussoir blocks — left arch
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const angle = t * Math.PI / 2;
    const vx = -1.5 + Math.sin(angle) * 1.5;
    const vy = 2.0 + (1 - Math.cos(angle)) * 2.3;
    const voussoir = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.35, 0.7),
      M_STONE
    );
    voussoir.position.set(vx - 0.2 * Math.sin(angle), vy, 12.2);
    voussoir.rotation.z = angle;
    voussoir.castShadow = true;
    scene.add(voussoir);
    const vb = new THREE.Box3().setFromObject(voussoir);
    collisionWorld.addBox(vb.min.x, vb.min.y, vb.min.z, vb.max.x, vb.max.y, vb.max.z, 'stone', 0.35);
  }

  // Voussoir blocks — right arch
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const angle = t * Math.PI / 2;
    const vx = 1.5 - Math.sin(angle) * 1.5;
    const vy = 2.0 + (1 - Math.cos(angle)) * 2.3;
    const voussoir = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.35, 0.7),
      M_STONE
    );
    voussoir.position.set(vx + 0.2 * Math.sin(angle), vy, 12.2);
    voussoir.rotation.z = -angle;
    voussoir.castShadow = true;
    scene.add(voussoir);
    const vb = new THREE.Box3().setFromObject(voussoir);
    collisionWorld.addBox(vb.min.x, vb.min.y, vb.min.z, vb.max.x, vb.max.y, vb.max.z, 'stone', 0.35);
  }

  // Keystone
  const keystone = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.4, 0.7),
    M_KEYSTONE
  );
  keystone.position.set(0, 4.35, 12.2);
  keystone.castShadow = true;
  scene.add(keystone);
  collisionWorld.addBox(-0.225, 4.15, 11.85, 0.225, 4.55, 12.55, 'stone', 0.4);

  // ═════════════════════════════════════════════
  // SECTION D: IRONWOOD DOORS
  // ═════════════════════════════════════════════

  // Both doors (visual only — collision removed so player can enter)
  const rightDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 4.0, 0.1),
    M_DARKWOOD
  );
  rightDoor.position.set(0.75, 2.0, 12.15);
  rightDoor.castShadow = true;
  scene.add(rightDoor);

  for (let hi = 0; hi < 3; hi++) {
    const hinge = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.04, 1.3),
      M_IRON
    );
    hinge.position.set(0.75, 0.5 + hi * 1.5, 12.22);
    scene.add(hinge);
  }

  const leftDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 4.0, 0.1),
    M_DARKWOOD
  );
  leftDoor.position.set(-0.75, 2.0, 12.15);
  leftDoor.rotation.y = 0.35;
  leftDoor.rotation.z = -0.035;
  leftDoor.castShadow = true;
  scene.add(leftDoor);

  // ═════════════════════════════════════════════
  // SECTION E: HERALDIC CREST ABOVE ARCH
  // ═════════════════════════════════════════════

  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.1),
    M_PLAQUE
  );
  plaque.position.set(0, 4.8, 11.9);
  scene.add(plaque);

  const shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.6, 0.06),
    M_PLAQUE
  );
  shield.position.set(0, 4.85, 11.85);
  scene.add(shield);

  // Shield pointed bottom (two wedges creating a chevron suggestion)
  const wedgeL = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.15, 0.07),
    M_DARKSTONE
  );
  wedgeL.position.set(-0.13, 4.55, 11.85);
  wedgeL.rotation.z = 0.4;
  scene.add(wedgeL);

  const wedgeR = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.15, 0.07),
    M_DARKSTONE
  );
  wedgeR.position.set(0.13, 4.55, 11.85);
  wedgeR.rotation.z = -0.4;
  scene.add(wedgeR);

  // Left griffin
  const griffinParts = [
    { type: 'sphere', pos: [-0.45, 4.85, 11.84], size: [0.12, 8, 6], scale: [1, 1, 0.5] },
    { type: 'box', pos: [-0.5, 5.0, 11.84], size: [0.18, 0.1, 0.04], rot: 0.5 },
    { type: 'box', pos: [-0.38, 5.0, 11.84], size: [0.18, 0.1, 0.04], rot: -0.5 },
    { type: 'sphere', pos: [-0.45, 4.98, 11.84], size: [0.07, 6, 6] },
    { type: 'box', pos: [-0.45, 4.68, 11.84], size: [0.04, 0.15, 0.04] },
  ];
  for (const gp of griffinParts) {
    const mesh = gp.type === 'sphere'
      ? new THREE.Mesh(new THREE.SphereGeometry(...gp.size), M_PLAQUE)
      : new THREE.Mesh(new THREE.BoxGeometry(...gp.size), M_PLAQUE);
    mesh.position.set(...gp.pos);
    if (gp.scale) mesh.scale.set(...gp.scale);
    if (gp.rot) mesh.rotation.x = gp.rot;
    scene.add(mesh);
  }

  // Right griffin (mirror)
  const griffinPartsR = [
    { type: 'sphere', pos: [0.45, 4.85, 11.84], size: [0.12, 8, 6], scale: [1, 1, 0.5] },
    { type: 'box', pos: [0.5, 5.0, 11.84], size: [0.18, 0.1, 0.04], rot: -0.5 },
    { type: 'box', pos: [0.38, 5.0, 11.84], size: [0.18, 0.1, 0.04], rot: 0.5 },
    { type: 'sphere', pos: [0.45, 4.98, 11.84], size: [0.07, 6, 6] },
    { type: 'box', pos: [0.45, 4.68, 11.84], size: [0.04, 0.15, 0.04] },
  ];
  for (const gp of griffinPartsR) {
    const mesh = gp.type === 'sphere'
      ? new THREE.Mesh(new THREE.SphereGeometry(...gp.size), M_PLAQUE)
      : new THREE.Mesh(new THREE.BoxGeometry(...gp.size), M_PLAQUE);
    mesh.position.set(...gp.pos);
    if (gp.scale) mesh.scale.set(...gp.scale);
    if (gp.rot) mesh.rotation.x = gp.rot;
    scene.add(mesh);
  }

  // Erosion weathering chips
  const chipPositions = [
    [-0.6, 4.3, 11.9], [0.5, 4.2, 11.88], [-0.3, 5.2, 11.85],
    [0.2, 5.1, 11.87], [-0.5, 5.3, 11.86], [0.6, 4.4, 11.9],
  ];
  for (const cp of chipPositions) {
    const chip = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 + Math.random() * 0.05, 0.03, 0.04 + Math.random() * 0.06),
      M_DARKSTONE
    );
    chip.position.set(...cp);
    chip.rotation.x = (Math.random() - 0.5) * 0.5;
    chip.rotation.z = (Math.random() - 0.5) * 0.5;
    scene.add(chip);
  }

  // ═════════════════════════════════════════════
  // SECTION F: FLANKING TURRETS
  // ═════════════════════════════════════════════

  function addTurretPanel(px, y, pz, width, height, angle, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.45), mat);
    mesh.position.set(px, y + height / 2, pz);
    mesh.rotation.y = angle + Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    const rotAngle = angle + Math.PI / 2;
    const ca = Math.abs(Math.cos(rotAngle));
    const sa = Math.abs(Math.sin(rotAngle));
    const halfD = 0.225;
    const dX = (width / 2) * ca + halfD * sa;
    const dZ = (width / 2) * sa + halfD * ca;
    collisionWorld.addBox(px - dX, y, pz - dZ, px + dX, y + height, pz + dZ, 'stone', height);
  }

  const turretPositions = [
    { cx: -3.8, cz: 12.2 },
    { cx: +3.8, cz: 12.2 },
  ];
  const turretR = 2.0;
  const panelWidth = 2 * turretR * Math.tan(Math.PI / 8);

  for (const tp of turretPositions) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = tp.cx + Math.cos(angle) * turretR;
      const pz = tp.cz + Math.sin(angle) * turretR;

      if (i % 2 === 0) {
        addTurretPanel(px, 0, pz, panelWidth, 5.5, angle, M_STONE);
        addTurretPanel(px, 6.4, pz, panelWidth, 15.6, angle, M_STONE);

        const slitFill = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.9, 0.5),
          M_DARKSTONE
        );
        slitFill.position.set(px, 5.5 + 0.45, pz);
        slitFill.rotation.y = angle + Math.PI / 2;
        scene.add(slitFill);
      } else {
        addTurretPanel(px, 0, pz, panelWidth, 22, angle, M_STONE);
      }
    }

    // Turret conical roof
    const roofApex = 26.5;
    const roofBase = 22;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const nextAngle = ((i + 1) / 8) * Math.PI * 2;
      const cAngle = (angle + nextAngle) / 2;

      const bx = tp.cx + Math.cos(angle) * (turretR + 0.45);
      const bz = tp.cz + Math.sin(angle) * (turretR + 0.45);
      const tipX = tp.cx;
      const tipZ = tp.cz;
      const midX = (bx + tipX) / 2;
      const midZ = (bz + tipZ) / 2;
      const roofPanel = new THREE.Mesh(
        new THREE.BoxGeometry(panelWidth * 0.9, 5.2, 0.15),
        M_SLATE
      );
      roofPanel.position.set(midX, roofBase + (roofApex - roofBase) / 2, midZ);
      roofPanel.rotation.y = cAngle;
      roofPanel.rotation.x = -(Math.PI / 2 - Math.atan2(roofApex - roofBase, turretR + 0.45));
      roofPanel.castShadow = true;
      scene.add(roofPanel);
    }
  }

  // ═════════════════════════════════════════════
  // SECTION G: SOUTH FACADE DETAILING
  // ═════════════════════════════════════════════

  // Blind arcading
  for (let i = 0; i < 14; i++) {
    const ax = -18 + i * 2.5 + 1.25;
    if (ax > -3.5 && ax < 3.5) continue;

    const recess = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.8, 0.25),
      M_RECESS
    );
    recess.position.set(ax, 0.9, 12.38);
    scene.add(recess);

    // Small arch above recess — 4 voussoirs
    for (let vi = 0; vi < 4; vi++) {
      const va = (vi / 3) * Math.PI / 2;
      const vx = ax + Math.sin(va) * 0.45;
      const vy = 1.8 + (1 - Math.cos(va)) * 0.12 + 0.05;
      const vous = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.1, 0.26),
        M_STONE
      );
      vous.position.set(vx, vy, 12.38);
      vous.rotation.x = va;
      scene.add(vous);
    }
  }

  // Corbelled cornice strips at Y=4.4 and Y=9.0
  for (const cy of [4.4, 9.0]) {
    const cornice = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.3, 0.35),
      M_CORNICE
    );
    cornice.position.set(0, cy + 0.15, 12.42);
    cornice.castShadow = true;
    scene.add(cornice);

    for (let ci = -18; ci <= 18; ci += 1.5) {
      if (Math.abs(ci) < 3.5) continue;
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.3, 0.3),
        M_CORNICE
      );
      bracket.position.set(ci, cy - 0.15, 12.45);
      scene.add(bracket);
    }
  }

  // F1 windows
  const f1WindowX = [-12, -6, 6, 12];
  for (const wx of f1WindowX) {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.25), M_STONE);
    sill.position.set(wx, 1.5, 12.38);
    scene.add(sill);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.25), M_STONE);
    lintel.position.set(wx, 3.15, 12.38);
    scene.add(lintel);
    const recess = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.6, 0.5), M_DARK_RECESS);
    recess.position.set(wx, 2.3, 12.1);
    scene.add(recess);
  }

  // F2 windows
  const f2WindowX = [-10, -4, 4, 10];
  for (const wx of f2WindowX) {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.25), M_STONE);
    sill.position.set(wx, 5.95, 12.38);
    scene.add(sill);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.25), M_STONE);
    lintel.position.set(wx, 7.6, 12.38);
    scene.add(lintel);
    const recess = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.6, 0.5), M_DARK_RECESS);
    recess.position.set(wx, 6.75, 12.1);
    scene.add(recess);
  }

  // Water staining below F1 window sills
  for (const wx of f1WindowX) {
    const stain = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.0, 0.01),
      M_WATER_STAIN
    );
    stain.position.set(wx, 0.5, 12.22);
    scene.add(stain);
  }
  // Water staining below F2 window sills
  for (const wx of f2WindowX) {
    const stain = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.0, 0.01),
      M_WATER_STAIN
    );
    stain.position.set(wx, 5.45, 12.22);
    scene.add(stain);
  }

  // Grotesque faces (rainspouts) above each F1 and F2 window
  const allWindowX = [...f1WindowX, ...f2WindowX];
  for (const wx of allWindowX) {
    for (const offset of [-0.6, 0.6]) {
      const spout = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.12, 0.45),
        M_GROTESQUE
      );
      spout.position.set(wx + offset, 3.25, 12.45);
      spout.castShadow = true;
      scene.add(spout);

      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 4, 4),
        M_GROTESQUE
      );
      eye.position.set(wx + offset + 0.04, 3.28, 12.67);
      scene.add(eye);
      const eye2 = eye.clone();
      eye2.position.set(wx + offset - 0.04, 3.28, 12.67);
      scene.add(eye2);

      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.04, 0.08),
        M_GROTESQUE
      );
      mouth.position.set(wx + offset, 3.2, 12.65);
      scene.add(mouth);
    }
  }

  // Moss patches at wall base
  const mossPositions = [
    [-16, 12.5], [-12, 12.5], [-8, 12.5], [-4.5, 12.5],
    [4.5, 12.5], [8, 12.5], [12, 12.5], [16, 12.5],
    [-14, 12.5], [-2, 12.5], [2, 12.5], [14, 12.5],
  ];
  for (const mp of mossPositions) {
    const mossW = 1.5 + Math.random() * 1.5;
    const mossH = 0.8 + Math.random() * 0.4;
    const moss = new THREE.Mesh(
      new THREE.PlaneGeometry(mossW, mossH),
      M_MOSS
    );
    moss.position.set(mp[0] + (Math.random() - 0.5) * 0.5, 0.4, mp[1] + 0.01);
    moss.rotation.y = (Math.random() - 0.5) * 0.3;
    scene.add(moss);
  }
}

export const collidables = [];

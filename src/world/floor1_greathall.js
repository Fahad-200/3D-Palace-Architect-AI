import * as THREE from 'three';
import { scene } from '../state.js?v=2';
import { collisionWorld } from '../collision.js?v=2';
import { materials } from '../materials.js?v=2';
import { makeTexture, lerpAlong3PointArc } from '../geometry.js?v=2';

const M_TERRACOTTA = materials.terracotta_cracked;
const M_EARTH = materials.bare_earth;
const M_CEILING = materials.stone_ceiling_vault;
const M_STONE = materials.limestone_ashlar;
const M_STONE_FLAGS = materials.stone_flags;
const M_DARKWOOD = materials.dark_wood_furniture;
const M_VELVET = materials.velvet_crimson_aged;
const M_IRON = materials.iron_rusted;

const M_CAPITAL = new THREE.MeshStandardMaterial({ color: 0xa8a098, roughness: 0.8 });
const M_ACANTHUS = new THREE.MeshStandardMaterial({ color: 0xb0a890, roughness: 0.85 });
const M_KEYSTONE = new THREE.MeshStandardMaterial({ color: 0xb0a898, roughness: 0.75 });
const M_CRACK = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 1.0 });
const M_SMOKE = new THREE.MeshStandardMaterial({ color: 0x1a1410, transparent: true, opacity: 0.45, roughness: 1.0, side: THREE.DoubleSide });
const M_LEAD = new THREE.MeshStandardMaterial({ color: 0x2a2828, roughness: 0.9, metalness: 0.3 });
const M_TORCH = new THREE.MeshStandardMaterial({ color: 0x1c1410, roughness: 0.95 });

const glassColors = [0x1a3a5c, 0x8b2222, 0x1a5c1a, 0xb8860b, 0x5c1a5c, 0x2a5c3a];

function drawTapestryPattern(ctx, w, h) {
  ctx.fillStyle = '#8a7060';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#6a5040';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.strokeStyle = '#5a4030';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  for (let t = 0; t < 4; t++) {
    const tx = 30 + t * 55;
    const ty = h - 40;
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(tx - 4, ty - 60, 8, 60);
    ctx.beginPath();
    ctx.moveTo(tx, ty - 100);
    ctx.lineTo(tx - 20, ty - 55);
    ctx.lineTo(tx + 20, ty - 55);
    ctx.closePath();
    ctx.fillStyle = '#4a5030';
    ctx.fill();
  }
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(80, h - 100, 12, 45);
  ctx.fillRect(130, h - 90, 10, 38);
}

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

export const collidables = [];

export function init(sc) {
  // ═════════════════════════════════════════════
  // SECTION A: FLOOR
  // ═════════════════════════════════════════════

  const floorTile = new THREE.Mesh(new THREE.BoxGeometry(12, 0.04, 10), M_TERRACOTTA);
  floorTile.position.set(0, 0.02, -7);
  floorTile.receiveShadow = true;
  scene.add(floorTile);

  const earthPatches = [
    [-2.5, -7.3],
    [1.8, -9.0],
    [-4.0, -4.5],
    [3.5, -7.8]
  ];
  for (const [ex, ez] of earthPatches) {
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.55), M_EARTH);
    patch.position.set(ex, 0.01, ez);
    scene.add(patch);
  }

  for (let i = 0; i < 6; i++) {
    const len = 1.2 + Math.random() * 1.2;
    const angle = Math.random() * Math.PI * 2;
    const crk = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, len), M_CRACK);
    crk.position.set((Math.random() - 0.5) * 10, 0.042, -7 + (Math.random() - 0.5) * 8);
    crk.rotation.y = angle;
    scene.add(crk);
  }

  // ═════════════════════════════════════════════
  // SECTION B: STONE RIB-VAULTED CEILING
  // ═════════════════════════════════════════════

  const ceilingInfill = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.04, 9.8), M_CEILING);
  ceilingInfill.position.set(0, 9.97, -7);
  scene.add(ceilingInfill);

  // Diagonal ribs
  addRib(
    new THREE.Vector3(-6, 8.0, -2), new THREE.Vector3(0, 9.5, -7), new THREE.Vector3(6, 8.0, -12.2),
    7, 0.22, M_CEILING
  );
  addRib(
    new THREE.Vector3(6, 8.0, -2), new THREE.Vector3(0, 9.5, -7), new THREE.Vector3(-6, 8.0, -12.2),
    7, 0.22, M_CEILING
  );
  addRib(
    new THREE.Vector3(-6, 8.0, -7), new THREE.Vector3(0, 9.5, -4.5), new THREE.Vector3(6, 8.0, -2),
    7, 0.22, M_CEILING
  );
  addRib(
    new THREE.Vector3(-6, 8.0, -7), new THREE.Vector3(0, 9.5, -9.5), new THREE.Vector3(6, 8.0, -12.2),
    7, 0.22, M_CEILING
  );

  // Transverse ribs
  const transZ = [-4.5, -7, -9.5];
  for (const tz of transZ) {
    addRib(
      new THREE.Vector3(-6, 8.0, tz), new THREE.Vector3(0, 9.2, tz), new THREE.Vector3(6, 8.0, tz),
      7, 0.18, M_CEILING
    );
  }

  // Keystones
  const keystonePositions = [
    [0, 9.5, -7],
    [0, 9.2, -4.5],
    [0, 9.2, -9.5]
  ];
  for (const [kx, ky, kz] of keystonePositions) {
    const ks = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), M_KEYSTONE);
    ks.position.set(kx, ky, kz);
    scene.add(ks);
  }

  // Smoke staining patches
  const smokePositions = [
    [-3, 9.94, -5.5],
    [3.5, 9.94, -9.2],
    [-2.5, 9.94, -9.8],
    [4, 9.94, -4.2]
  ];
  for (const [sx, sy, sz] of smokePositions) {
    const diam = 2 + Math.random() * 2;
    const smoke = new THREE.Mesh(new THREE.PlaneGeometry(diam, diam), M_SMOKE);
    smoke.position.set(sx, sy, sz);
    smoke.rotation.x = -Math.PI / 2;
    scene.add(smoke);
  }

  // ═════════════════════════════════════════════
  // SECTION C: 8 STONE COLUMNS
  // ═════════════════════════════════════════════

  const colZ = [-3.5, -6.0, -8.5, -11.0];
  const colX = [-4.5, 4.5];
  for (const x of colX) {
    for (const z of colZ) {
      // Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 8.0, 16), M_STONE);
      shaft.position.set(x, 4.0, z);
      shaft.castShadow = true;
      scene.add(shaft);

      // Capital
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.35, 0.75), M_CAPITAL);
      cap.position.set(x, 8.18, z);
      scene.add(cap);

      // Acanthus leaf projections (4 sides)
      const projOffsets = [[0.44, 0, 0], [-0.44, 0, 0], [0, 0, 0.44], [0, 0, -0.44]];
      for (const [px, py, pz] of projOffsets) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.1), M_ACANTHUS);
        leaf.position.set(x + px, 8.18, z + pz);
        scene.add(leaf);
      }

      // Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.65), M_STONE);
      base.position.set(x, 0.07, z);
      scene.add(base);

      // Collision
      collisionWorld.addBox(x - 0.32, 0, z - 0.32, x + 0.32, 8.35, z + 0.32, 'stone', 8.35);
    }
  }

  // ═════════════════════════════════════════════
  // SECTION D: RAISED DAIS AND THRONE
  // ═════════════════════════════════════════════

  // Dais main platform
  const dais = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 2.8), M_STONE_FLAGS);
  dais.position.set(0, 0.16, -10.8);
  dais.receiveShadow = true;
  dais.castShadow = true;
  scene.add(dais);
  collisionWorld.addBox(-1.9, 0, -12.2, 1.9, 0.32, -8.6, 'stone', 0.32);

  // Steps
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.16, 0.55), M_STONE_FLAGS);
  step1.position.set(0, 0.08, -8.3);
  scene.add(step1);
  collisionWorld.addBox(-1.9, 0, -8.575, 1.9, 0.16, -7.9, 'stone', 0.16);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.24, 0.45), M_STONE_FLAGS);
  step2.position.set(0, 0.12, -8.7);
  scene.add(step2);
  collisionWorld.addBox(-1.9, 0, -8.925, 1.9, 0.24, -8.45, 'stone', 0.24);

  // Throne
  const M_LEGROW = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.85 });

  // Seat cushion
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.65), M_VELVET);
  cushion.position.set(0, 0.46, -10.9);
  cushion.rotation.x = 0.025;
  scene.add(cushion);

  // Seat frame base
  const seatFrame = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.08, 0.68), M_DARKWOOD);
  seatFrame.position.set(0, 0.36, -10.9);
  scene.add(seatFrame);

  // 4 legs
  const legPositions = [[-0.3, -0.28], [-0.3, 0.28], [0.3, -0.28], [0.3, 0.28]];
  for (const [lx, lz] of legPositions) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6), M_LEGROW);
    leg.position.set(lx, 0.16, -10.9 + lz);
    scene.add(leg);
  }

  // Throne back
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.5, 0.1), M_DARKWOOD);
  back.position.set(0, 1.27, -11.15);
  scene.add(back);

  // Decorative top rail
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.14), M_DARKWOOD);
  topRail.position.set(0, 2.0, -11.1);
  scene.add(topRail);

  // Side posts
  for (const sx of [-0.34, 0.34]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.5, 0.12), M_DARKWOOD);
    post.position.set(sx, 1.27, -11.15);
    scene.add(post);
  }

  // Grotesque face carvings at 4 post tops
  const facePositions = [[-0.34, 1.95, -11.15], [0.34, 1.95, -11.15], [-0.3, 1.95, -10.9], [0.3, 1.95, -10.9]];
  for (const [fx, fy, fz] of facePositions) {
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 6), M_LEGROW);
    face.position.set(fx, fy, fz);
    face.scale.set(1, 1.2 + Math.random() * 0.15, 0.85);
    scene.add(face);
  }

  // Arms
  for (const ax of [-0.36, 0.36]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.65), M_DARKWOOD);
    arm.position.set(ax, 0.56, -10.9);
    scene.add(arm);
  }

  // Throne collision
  collisionWorld.addBox(-0.4, 0.32, -11.3, 0.4, 2.32, -10.55, 'wood', 2.32);

  // Iron sconces flanking throne
  for (const sx of [-1.3, 1.3]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.16), M_IRON);
    arm.position.set(sx, 2.2, -12.05);
    arm.rotation.x = 0.15;
    scene.add(arm);
    collisionWorld.addBox(sx - 0.15, 2.15, -12.15, sx + 0.15, 2.35, -11.85, 'metal', 0.2);
  }

  // Torch stump on left sconce only
  const torchStump = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.07, 5), M_TORCH);
  torchStump.position.set(-1.3, 2.27, -11.92);
  torchStump.rotation.x = 0.15;
  scene.add(torchStump);

  // ═════════════════════════════════════════════
  // SECTION E: TAPESTRIES
  // ═════════════════════════════════════════════

  const M_TAPESTRY = new THREE.MeshStandardMaterial({
    map: makeTexture(256, 256, drawTapestryPattern),
    roughness: 0.97,
    color: 0x8a7060,
    side: THREE.DoubleSide
  });
  const M_TAPESTRY_ROTTED = new THREE.MeshStandardMaterial({ color: 0x5a4838, roughness: 0.95, side: THREE.DoubleSide });

  // East tapestry
  const tapE = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.0), M_TAPESTRY);
  tapE.position.set(5.59, 6.3, -7);
  tapE.rotation.y = -Math.PI / 2;
  scene.add(tapE);

  // West tapestry
  const tapW = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.0), M_TAPESTRY);
  tapW.position.set(-5.59, 6.3, -7);
  tapW.rotation.y = Math.PI / 2;
  scene.add(tapW);

  // Rotted lower sections (both sides)
  const tapSides = [
    { sign: 1, rotY: -Math.PI / 2 },
    { sign: -1, rotY: Math.PI / 2 }
  ];
  for (const side of tapSides) {
    let xOff = -1.2;
    for (let s = 0; s < 8; s++) {
      const h = 0.5 + Math.random() * 0.5;
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.02), M_TAPESTRY_ROTTED);
      strip.position.set(side.sign * (5.59 + xOff), 3.8 + h / 2, -7);
      strip.rotation.y = side.rotY;
      scene.add(strip);
      xOff += 0.3;
    }
  }

  // Iron hanging rods and rings (both sides)
  for (const sign of [-1, 1]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.35, 8), M_IRON);
    rod.position.set(sign * 5.59, 7.85, -7);
    rod.rotation.z = Math.PI / 2;
    scene.add(rod);

    for (let r = 0; r < 5; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 8), M_IRON);
      ring.position.set(sign * 5.59, 7.82, -7.5 + r * 0.5);
      scene.add(ring);
    }
  }

  // ═════════════════════════════════════════════
  // SECTION F: STAINED GLASS EMBRASURES
  // ═════════════════════════════════════════════

  const embrasureZ = [-5, -9];
  const sides = [
    { x: 6.0, paneX: 5.62, rotY: -Math.PI / 2 },
    { x: -6.0, paneX: -5.62, rotY: Math.PI / 2 }
  ];

  for (const side of sides) {
    for (const ez of embrasureZ) {
      const M_SILL = new THREE.MeshStandardMaterial({ color: 0x9a8e80, roughness: 0.85 });
      const M_INSET = new THREE.MeshStandardMaterial({ color: 0xa89e90, roughness: 0.85 });

      // Sill projecting inward
      const sill = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 1.0), M_SILL);
      sill.position.set(side.x - Math.sign(side.x) * 0.5, 2.25, ez);
      scene.add(sill);

      // Inner side walls of recess
      for (const io of [-0.46, 0.46]) {
        const inner = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 0.08), M_INSET);
        inner.position.set(side.x - Math.sign(side.x) * 0.75, 3.5, ez + io);
        scene.add(inner);
      }

      // Stained glass panes
      const brokenIndices = new Set();
      while (brokenIndices.size < 2) {
        brokenIndices.add(Math.floor(Math.random() * 8));
      }
      let paneIdx = 0;
      for (let gy = 0; gy < 4; gy++) {
        for (let gx = 0; gx < 2; gx++) {
          if (brokenIndices.has(paneIdx)) { paneIdx++; continue; }
          paneIdx++;

          const color = glassColors[Math.floor(Math.random() * glassColors.length)];
          const pane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.36, 0.46),
            new THREE.MeshStandardMaterial({
              color,
              transparent: true,
              opacity: 0.65,
              side: THREE.DoubleSide,
              emissive: color,
              emissiveIntensity: 0.15
            })
          );
          pane.position.set(side.paneX, 2.5 + gy * 0.48, ez + (gx - 0.5) * 0.38);
          pane.rotation.y = side.rotY;
          scene.add(pane);
        }
      }

      // Lead caming grid
      for (let gy = 0; gy < 5; gy++) {
        const hLead = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.005, 0.76), M_LEAD);
        hLead.position.set(side.paneX, 2.26 + gy * 0.48, ez);
        hLead.rotation.y = side.rotY;
        scene.add(hLead);
      }
      for (let gx = 0; gx < 3; gx++) {
        const vLead = new THREE.Mesh(new THREE.BoxGeometry(0.005, 1.92, 0.01), M_LEAD);
        vLead.position.set(side.paneX, 3.45, ez + (gx - 1) * 0.38);
        vLead.rotation.y = side.rotY;
        scene.add(vLead);
      }

      // Glass shards on floor near window
      const shardCount = 3 + Math.floor(Math.random() * 3);
      for (let sh = 0; sh < shardCount; sh++) {
        const shardColor = glassColors[Math.floor(Math.random() * glassColors.length)];
        const shard = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.04, 0),
          new THREE.MeshStandardMaterial({ color: shardColor, transparent: true, opacity: 0.5, roughness: 0.3 })
        );
        const szOff = (Math.random() - 0.5) * 0.5;
        shard.position.set(side.paneX + (Math.random() - 0.5) * 0.3, 0.02, ez + szOff);
        shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(shard);
      }
    }
  }
}

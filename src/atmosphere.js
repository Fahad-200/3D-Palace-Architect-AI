import * as THREE from 'three';
import { scene, clock } from './state.js?v=2';
import { registerUpdateCallback } from './callbacks.js?v=2';
import { moonbeamBandPosition } from './world/floor4_observatory.js?v=2';

class ParticleSystem {
  constructor({ count, area, velocityRange, size, color, opacity, lifetime, texture }) {
    this.count = count;
    this.positions = [];
    this.velocities = [];
    this.ages = [];
    this.lifetimes = [];
    this.active = [];
    this.area = area;

    const posArr = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({
      color, size,
      transparent: true,
      opacity,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);

    for (let i = 0; i < count; i++) {
      this._respawn(i, true);
    }
  }

  _respawn(i, randomAge = false) {
    const a = this.area;
    this.positions[i] = new THREE.Vector3(
      a.minX + Math.random() * (a.maxX - a.minX),
      a.minY + Math.random() * (a.maxY - a.minY),
      a.minZ + Math.random() * (a.maxZ - a.minZ)
    );
    this.velocities[i] = new THREE.Vector3(
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.08,
      (Math.random() - 0.5) * 0.04
    );
    const fullLife = 8 + Math.random() * 12;
    this.lifetimes[i] = fullLife;
    this.ages[i] = randomAge ? Math.random() * fullLife : 0;
    this.active[i] = true;
  }

  update(delta, elapsed) {
    const posArr = this.points.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      if (!this.active[i]) continue;
      this.ages[i] += delta;
      if (this.ages[i] >= this.lifetimes[i]) {
        this._respawn(i);
        continue;
      }
      this.positions[i].addScaledVector(this.velocities[i], delta);
      const noise = Math.sin(i * 127.1 + elapsed * 2.3) * 0.5 + 0.5;
      const noise2 = Math.cos(i * 311.7 + elapsed * 1.7) * 0.5 + 0.5;
      const noise3 = Math.sin(i * 53.9 + elapsed * 2.9) * 0.5 + 0.5;
      this.velocities[i].x += (noise - 0.5) * 0.008 * delta;
      this.velocities[i].y += (noise2 - 0.5) * 0.006 * delta;
      this.velocities[i].z += (noise3 - 0.5) * 0.008 * delta;
      this.velocities[i].clampLength(0, 0.12);
      const a = this.area;
      if (this.positions[i].x < a.minX) this.positions[i].x = a.maxX;
      if (this.positions[i].x > a.maxX) this.positions[i].x = a.minX;
      if (this.positions[i].y < a.minY) this.positions[i].y = a.maxY;
      if (this.positions[i].y > a.maxY) this.positions[i].y = a.minY;
      if (this.positions[i].z < a.minZ) this.positions[i].z = a.maxZ;
      if (this.positions[i].z > a.maxZ) this.positions[i].z = a.minZ;
      const px = this.positions[i].x, py = this.positions[i].y, pz = this.positions[i].z;
      if (isNaN(px) || isNaN(py) || isNaN(pz)) {
        this._respawn(i);
        continue;
      }
      posArr[i * 3] = px;
      posArr[i * 3 + 1] = py;
      posArr[i * 3 + 2] = pz;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

const dustSystems = [];
const fallingPlasterSystems = [];
const leafSystems = [];
let cobwebMeshes = [];

function build() {
dustSystems.push(new ParticleSystem({
  count: 20,
  area: { minX: -3.5, maxX: 3.5, minY: 0.8, maxY: 3.5, minZ: 8.5, maxZ: 12.0 },
  size: 0.025, color: 0xd8d0c0, opacity: 0.55
}));

dustSystems.push(new ParticleSystem({
  count: 14,
  area: { minX: -5.5, maxX: 5.5, minY: 1.0, maxY: 4.5, minZ: -10.0, maxZ: -3.0 },
  size: 0.018, color: 0xc8c0b8, opacity: 0.4
}));

dustSystems.push(new ParticleSystem({
  count: 25,
  area: { minX: -8.5, maxX: 8.5, minY: 5.0, maxY: 10.5, minZ: -2.5, maxZ: 7.0 },
  size: 0.015, color: 0xd0c8b8, opacity: 0.35
}));

dustSystems.push(new ParticleSystem({
  count: 18,
  area: { minX: 4.8, maxX: 12.2, minY: 5.2, maxY: 9.2, minZ: -9.5, maxZ: -3.5 },
  size: 0.02, color: 0xc8c0a8, opacity: 0.45
}));

const mpb = moonbeamBandPosition;
dustSystems.push(new ParticleSystem({
  count: 12,
  area: { minX: mpb.x - 0.3, maxX: mpb.x + 0.3, minY: 22.2, maxY: 25.5, minZ: mpb.z - 0.3, maxZ: mpb.z + 0.3 },
  size: 0.022, color: 0xe0e8f0, opacity: 0.65
}));

const tileGapPositions = [
  { x: -12, z: -6 }, { x: 8, z: 3 }, { x: -4, z: 7 },
  { x: 14, z: -8 }, { x: -7, z: 0 }, { x: 3, z: -4 }
];
tileGapPositions.forEach(g => {
  dustSystems.push(new ParticleSystem({
    count: 8,
    area: { minX: g.x - 0.35, maxX: g.x + 0.35, minY: 13.6, maxY: 16.5, minZ: g.z - 0.35, maxZ: g.z + 0.35 },
    size: 0.02, color: 0xd8d0c0, opacity: 0.5
  }));
});

class FallingParticleSystem {
  constructor({ count, area, fallSpeed, size, color, opacity }) {
    this.count = count;
    this.area = area;
    this.fallSpeed = fallSpeed;
    this.positions = [];
    this.drifts = [];
    const posArr = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      color, size, transparent: true, opacity, sizeAttenuation: true,
      depthWrite: false, blending: THREE.NormalBlending
    }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    for (let i = 0; i < count; i++) this._respawn(i, true);
  }
  _respawn(i, randomY = false) {
    const a = this.area;
    this.positions[i] = new THREE.Vector3(
      a.minX + Math.random() * (a.maxX - a.minX),
      randomY ? a.minY + Math.random() * (a.maxY - a.minY) : a.maxY,
      a.minZ + Math.random() * (a.maxZ - a.minZ)
    );
    this.drifts[i] = new THREE.Vector2((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04);
  }
  update(delta, elapsed) {
    const posArr = this.points.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      const speedNoise = 0.7 + 0.6 * (0.5 + 0.5 * Math.sin(i * 73.1 + elapsed * 0.7));
      this.positions[i].y -= this.fallSpeed * delta * speedNoise;
      this.positions[i].x += this.drifts[i].x * delta;
      this.positions[i].z += this.drifts[i].y * delta;
      if (this.positions[i].y < this.area.minY) this._respawn(i);
      posArr[i * 3] = this.positions[i].x;
      posArr[i * 3 + 1] = this.positions[i].y;
      posArr[i * 3 + 2] = this.positions[i].z;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

fallingPlasterSystems.push(new FallingParticleSystem({
  count: 6, fallSpeed: 0.12, size: 0.03, color: 0xc8c0b0, opacity: 0.45,
  area: { minX: -1.5, maxX: 1.5, minY: 0.1, maxY: 7.8, minZ: 2.5, maxZ: 5.5 }
}));

fallingPlasterSystems.push(new FallingParticleSystem({
  count: 5, fallSpeed: 0.08, size: 0.035, color: 0xc4bcac, opacity: 0.5,
  area: { minX: 5.0, maxX: 7.5, minY: 9.1, maxY: 12.3, minZ: -7.0, maxZ: -5.5 }
}));

fallingPlasterSystems.push(new FallingParticleSystem({
  count: 4, fallSpeed: 0.09, size: 0.025, color: 0xb8b0a0, opacity: 0.4,
  area: { minX: -5.5, maxX: 5.5, minY: 0.05, maxY: 9.8, minZ: -11.5, maxZ: -3.0 }
}));

class LeafDriftSystem {
  constructor({ count, spawnArea, driftDir, floorY }) {
    this.count = count;
    this.spawnArea = spawnArea;
    this.driftDir = driftDir;
    this.floorY = floorY;
    this.positions = [];
    this.velocities = [];
    const posArr = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x5a3d18, size: 0.06, transparent: true, opacity: 0.65,
      sizeAttenuation: true, depthWrite: false
    }));
    scene.add(this.points);
    for (let i = 0; i < count; i++) this._respawn(i, true);
  }
  _respawn(i, random = false) {
    const a = this.spawnArea;
    this.positions[i] = new THREE.Vector3(
      a.minX + Math.random() * (a.maxX - a.minX),
      random ? this.floorY + Math.random() * (a.maxY - this.floorY) : a.maxY,
      a.minZ + Math.random() * (a.maxZ - a.minZ)
    );
    this.velocities[i] = new THREE.Vector3(
      this.driftDir.x * (0.3 + Math.random() * 0.4),
      -(0.15 + Math.random() * 0.25),
      this.driftDir.z * (0.3 + Math.random() * 0.4)
    );
  }
  update(delta) {
    const posArr = this.points.geometry.attributes.position.array;
    const elapsed = clock.getElapsedTime();
    for (let i = 0; i < this.count; i++) {
      this.positions[i].addScaledVector(this.velocities[i], delta);
      this.velocities[i].x += Math.sin(elapsed * 2.1 + i) * 0.01 * delta;
      this.velocities[i].z += Math.cos(elapsed * 1.8 + i * 0.7) * 0.01 * delta;
      if (this.positions[i].y < this.floorY || this.positions[i].x < this.spawnArea.minX - 3 || this.positions[i].x > this.spawnArea.maxX + 3) this._respawn(i);
      posArr[i * 3] = this.positions[i].x;
      posArr[i * 3 + 1] = this.positions[i].y;
      posArr[i * 3 + 2] = this.positions[i].z;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

leafSystems.push(new LeafDriftSystem({
    count: 8,
    spawnArea: { minX: -1.2, maxX: 1.2, minY: 0.0, maxY: 3.0, minZ: 12.2, maxZ: 13.5 },
    driftDir: new THREE.Vector2(0, -1), floorY: 0.015
  }));
leafSystems.push(new LeafDriftSystem({
    count: 6,
    spawnArea: { minX: -8.0, maxX: -7.2, minY: 9.05, maxY: 10.2, minZ: -8.5, maxZ: -6.2 },
    driftDir: new THREE.Vector2(0.8, 0), floorY: 9.015
  }));

// Kitchen hearth ash (convection — fallSpeed negative = upward drift)
fallingPlasterSystems.push(new FallingParticleSystem({
  count: 8, fallSpeed: -0.04, size: 0.018, color: 0x606060, opacity: 0.3,
  area: { minX: -14.0, maxX: -10.0, minY: 0.05, maxY: 3.8, minZ: -0.5, maxZ: 4.5 }
}));

fallingPlasterSystems[fallingPlasterSystems.length - 1]._respawn = function(i, randomY) {
  const a = this.area;
  this.positions[i] = new THREE.Vector3(
    a.minX + Math.random() * (a.maxX - a.minX),
    randomY ? a.minY + Math.random() * (a.maxY - a.minY) : a.minY,
    a.minZ + Math.random() * (a.maxZ - a.minZ)
  );
  this.drifts[i] = new THREE.Vector2((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04);
};

cobwebMeshes = [];
scene.traverse(obj => {
  if (obj.userData && obj.userData.isCobweb) cobwebMeshes.push(obj);
});

function animateCobwebs(delta, elapsed) {
  for (const cw of cobwebMeshes) {
    const phase = cw.userData.phase || 0;
    cw.rotation.z += Math.sin(elapsed * 0.35 + phase) * 0.008;
    cw.rotation.x += Math.cos(elapsed * 0.28 + phase * 1.3) * 0.005;
    cw.material.opacity = 0.18 + 0.05 * Math.sin(elapsed * 0.5 + phase * 2.1);
  }
}

registerUpdateCallback(function(delta, elapsed) {
  for (const sys of dustSystems) sys.update(delta, elapsed);
  for (const sys of fallingPlasterSystems) sys.update(delta, elapsed);
  for (const sys of leafSystems) sys.update(delta);
  animateCobwebs(delta, elapsed);
});
}

export function init(scene) {
  build();
}

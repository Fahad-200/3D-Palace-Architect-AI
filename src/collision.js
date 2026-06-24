import * as THREE from 'three';

class CollisionWorld {
  constructor() {
    this.boxes = [];
    this.spatialGrid = null;
  }

  addBox(minX, minY, minZ, maxX, maxY, maxZ, surfaceType = 'stone', objectHeight = null) {
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(minZ) || !isFinite(maxX) || !isFinite(maxY) || !isFinite(maxZ)) return;
    if (minX > maxX) { const t = minX; minX = maxX; maxX = t; }
    if (minY > maxY) { const t = minY; minY = maxY; maxY = t; }
    if (minZ > maxZ) { const t = minZ; minZ = maxZ; maxZ = t; }
    const h = objectHeight !== null ? objectHeight : (maxY - minY);
    this.boxes.push({
      minX, minY, minZ, maxX, maxY, maxZ,
      surfaceType,
      objectHeight: h,
      isClimbable: h <= 1.0,
      isWall: h >= 2.0,
      isMedium: h > 1.0 && h < 2.0
    });
  }

  addMesh(mesh, surfaceType = 'stone', objectHeight = null) {
    mesh.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(mesh);
    const h = objectHeight !== null ? objectHeight : (box.max.y - box.min.y);
    this.addBox(box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z, surfaceType, h);
  }

  clear() {
    this.boxes = [];
    this.spatialGrid = null;
  }

  buildSpatialGrid() {
    const grid = {};
    this.boxes.forEach((box, idx) => {
      const minCX = Math.floor((box.minX + 20) / 10);
      const maxCX = Math.floor((box.maxX + 20) / 10);
      const minCZ = Math.floor((box.minZ + 12.5) / 6.25);
      const maxCZ = Math.floor((box.maxZ + 12.5) / 6.25);
      for (let cx = minCX; cx <= maxCX; cx++) {
        for (let cz = minCZ; cz <= maxCZ; cz++) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              const key = `${cx + dx}_${cz + dz}`;
              if (!grid[key]) grid[key] = new Set();
              grid[key].add(idx);
            }
          }
        }
      }
    });
    this.spatialGrid = grid;
    this.largeBoxThreshold = 20;
    this.largeBoxIndices = [];
    this.boxes.forEach((box, idx) => {
      if (box.maxX - box.minX > this.largeBoxThreshold ||
          box.maxZ - box.minZ > this.largeBoxThreshold) {
        this.largeBoxIndices.push(idx);
      }
    });
  }

  getNearbyIndices(px, pz) {
    if (!this.spatialGrid) return this.boxes.map((_, i) => i);
    const cellX = Math.floor((px + 20) / 10);
    const cellZ = Math.floor((pz + 12.5) / 6.25);
    const nearby = new Set();
    this.largeBoxIndices.forEach(i => nearby.add(i));
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const key = `${cellX + dx}_${cellZ + dz}`;
        if (this.spatialGrid[key]) this.spatialGrid[key].forEach(i => nearby.add(i));
      }
    }
    return [...nearby];
  }

  getSurfaceAtFeet(feetX, feetY, feetZ) {
    const eps = 0.05;
    const indices = this.getNearbyIndices(feetX, feetZ);
    for (const idx of indices) {
      const box = this.boxes[idx];
      if (feetX >= box.minX - eps && feetX <= box.maxX + eps &&
          feetZ >= box.minZ - eps && feetZ <= box.maxZ + eps &&
          feetY >= box.minY - 0.1 && feetY <= box.maxY + 0.05) {
        return box.surfaceType;
      }
    }
    return 'stone';
  }
}

export const collisionWorld = new CollisionWorld();

export function resolvePlayerCollision(currentPos, desiredPos, vertVelocity, isCrouching) {
  const PR = 0.35;
  const PH = isCrouching ? 1.1 : 1.8;

  let nx = isFinite(desiredPos.x) ? desiredPos.x : currentPos.x;
  let ny = isFinite(desiredPos.y) ? desiredPos.y : currentPos.y;
  let nz = isFinite(desiredPos.z) ? desiredPos.z : currentPos.z;
  let vv = isFinite(vertVelocity) ? vertVelocity : 0;
  let grounded = false;
  let surfaceType = 'stone';

  const indices = collisionWorld.getNearbyIndices(nx, nz);

  for (const idx of indices) { const box = collisionWorld.boxes[idx];
    const overlapX = nx + PR > box.minX && nx - PR < box.maxX;
    const overlapZ = nz + PR > box.minZ && nz - PR < box.maxZ;
    if (!overlapX || !overlapZ) continue;

    const feetYPos = ny - 1.65;
    const snapTolerance = (vv < -0.5) ? 0.3 : 0.12;
    if (feetYPos <= box.maxY + snapTolerance && feetYPos > box.maxY - 0.5 && vv <= 0) {
      ny = box.maxY + 1.65;
      vv = 0;
      grounded = true;
      surfaceType = box.surfaceType;
    }

    const headY = ny;
    if (headY > box.minY && headY < box.minY + 0.3 && vv > 0) {
      vv = 0;
      ny = box.minY - 0.05;
    }
  }

  const E = 0.001;

  for (const idx of indices) { const box = collisionWorld.boxes[idx];
    if (box.objectHeight === 0) continue;
    const playerFeetY = ny - 1.65;
    const overlapY = playerFeetY < box.maxY && playerFeetY + PH > box.minY;
    if (!overlapY) continue;
    if (box.isClimbable && box.maxY - playerFeetY <= 0.5 && box.maxY > playerFeetY) {
      if (nx + PR > box.minX && nx - PR < box.maxX && nz + PR > box.minZ && nz - PR < box.maxZ) {
        const newNy = box.maxY + 1.65;
        if (newNy > ny + 0.5) console.warn(`CLIMB ${box.maxY.toFixed(3)} idx=${idx} objH=${box.objectHeight} X=${box.minX.toFixed(1)}-${box.maxX.toFixed(1)} Z=${box.minZ.toFixed(1)}-${box.maxZ.toFixed(1)}`);
        ny = newNy;
        grounded = true;
        surfaceType = box.surfaceType;
        continue;
      }
    }

    const inX = nx + PR > box.minX && nx - PR < box.maxX;
    const inZ = nz + PR > box.minZ && nz - PR < box.maxZ;
    if (!inX || !inZ) continue;

    const boxW = box.maxX - box.minX;
    const boxD = box.maxZ - box.minZ;
    const pushX = boxW <= boxD * 2;
    const pushZ = boxD <= boxW * 2;

    if (pushX) {
      const overlapFromLeft = nx + PR - box.minX;
      const overlapFromRight = box.maxX - (nx - PR);
      if (overlapFromLeft < overlapFromRight) {
        nx = box.minX - PR - E;
      } else {
        nx = box.maxX + PR + E;
      }
    }
    if (pushZ) {
      const overlapFromFront = nz + PR - box.minZ;
      const overlapFromBack = box.maxZ - (nz - PR);
      if (overlapFromFront < overlapFromBack) {
        nz = box.minZ - PR - E;
      } else {
        nz = box.maxZ + PR + E;
      }
    }
  }

  for (const idx of indices) { const box = collisionWorld.boxes[idx];
    if (box.objectHeight === 0) continue;
    const playerFeetY = ny - 1.65;
    const overlapY = playerFeetY < box.maxY && playerFeetY + PH > box.minY;
    if (!overlapY) continue;
    if (box.isClimbable && box.maxY - playerFeetY <= 0.5 && box.maxY > playerFeetY) continue;
    if (nx + PR > box.minX && nx - PR < box.maxX &&
        nz + PR > box.minZ && nz - PR < box.maxZ) {
      nx = currentPos.x;
      nz = currentPos.z;
    }
  }

  if (!isFinite(ny) || ny < -40 || ny > 30) {
    if (ny !== currentPos.y) console.warn(`COLLISION RESET Y: ${currentPos.y.toFixed(3)} -> 1.65 (nx=${nx.toFixed(3)} nz=${nz.toFixed(3)})`);
    ny = 1.65; vv = 0;
  }
  if (ny > currentPos.y + 0.5) {
    console.warn(`Y CAP: ${currentPos.y.toFixed(3)}->${ny.toFixed(3)} capped to ${(currentPos.y + 0.5).toFixed(3)} at (${nx.toFixed(2)},${nz.toFixed(2)})`);
    ny = currentPos.y + 0.5;
    vv = 0;
  }
  if (!isFinite(nx)) { nx = currentPos.x; }
  if (!isFinite(nz)) { nz = currentPos.z; }

  return {
    position: new THREE.Vector3(nx, ny, nz),
    verticalVelocity: vv,
    onGround: grounded,
    surfaceType
  };
}

export function init(scene) {
  collisionWorld.addBox(-60, -0.25, -60, 60, 0, 60, 'stone', 0);
  collisionWorld.addBox(-60, -50, -60, 60, -49.9, 60, 'stone', 0);
  collisionWorld.addBox(-60, 0, -60, -50, 20, 60, 'stone', 20);
  collisionWorld.addBox(50, 0, -60, 60, 20, 60, 'stone', 20);
  collisionWorld.addBox(-60, 0, 50, 60, 20, 60, 'stone', 20);
}

export function buildCollisionGrid() {
  collisionWorld.buildSpatialGrid();
}

export const collidables = [];

export function getSurfaceTypeAtFeet(pos) {
  return collisionWorld.getSurfaceAtFeet(pos.x, pos.y - 1.65, pos.z);
}

export function getCollisionBoxCount() { return collisionWorld.boxes.length; }

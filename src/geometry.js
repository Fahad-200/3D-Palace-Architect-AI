import * as THREE from 'three';
import { scene } from './state.js?v=2';
import { collisionWorld } from './collision.js?v=2';

;(function patchComputeBoundingSphere() {
  const origCBS = THREE.BufferGeometry.prototype.computeBoundingSphere;
  THREE.BufferGeometry.prototype.computeBoundingSphere = function() {
    const pos = this.getAttribute('position');
    if (pos) {
      const arr = pos.array;
      for (let i = 0; i < arr.length; i++) {
        if (!isFinite(arr[i])) arr[i] = 0;
      }
      pos.needsUpdate = true;
    }
    return origCBS.call(this);
  };
})();

export function makeTexture(w, h, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const tex = new THREE.DataTexture(data.data, w, h, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function guard(v, fallback) { return isFinite(v) ? v : (fallback !== undefined ? fallback : 0); }

function guardBox(w, h, d) {
  const bw = guard(w, 0.1), bh = guard(h, 0.1), bd = guard(d, 0.1);
  return new THREE.BoxGeometry(bw, bh, bd);
}

export function addWall(x, y, z, width, height, depth, mat, surfaceType) {
  const gx = guard(x), gy = guard(y), gz = guard(z), gw = guard(width, 0.1), gh = guard(height, 0.1), gd = guard(depth, 0.1);
  const geo = guardBox(gw, gh, gd);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(gx, gy + gh / 2, gz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  collisionWorld.addBox(
    gx - gw / 2, gy, gz - gd / 2,
    gx + gw / 2, gy + gh, gz + gd / 2,
    surfaceType, gh * 2
  );
  return mesh;
}

export function addFloor(x, y, z, width, depth, mat, surfaceType) {
  const gx = guard(x), gy = guard(y), gz = guard(z), gw = guard(width, 0.1), gd = guard(depth, 0.1);
  const geo = guardBox(gw, 0.25, gd);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(gx, gy + 0.125, gz);
  mesh.receiveShadow = true;
  scene.add(mesh);
  collisionWorld.addBox(
    gx - gw / 2, gy, gz - gd / 2,
    gx + gw / 2, gy + 0.25, gz + gd / 2,
    surfaceType, 0
  );
  return mesh;
}

export function addStep(x, y, z, width, height, depth, mat) {
  const gx = guard(x), gy = guard(y), gz = guard(z), gw = guard(width, 0.1), gh = guard(height, 0.1), gd = guard(depth, 0.1);
  const mesh = new THREE.Mesh(guardBox(gw, gh, gd), mat);
  mesh.position.set(gx, gy + gh / 2, gz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  const box = new THREE.Box3().setFromObject(mesh);
  collisionWorld.addBox(
    box.min.x, box.min.y, box.min.z,
    box.max.x, box.max.y, box.max.z,
    'stone', gh
  );
  return mesh;
}

export function lerpAlong3PointArc(p0, peak, p2, t) {
  const u = 1 - t;
  return new THREE.Vector3(
    u * u * p0.x + 2 * u * t * peak.x + t * t * p2.x,
    u * u * p0.y + 2 * u * t * peak.y + t * t * p2.y,
    u * u * p0.z + 2 * u * t * peak.z + t * t * p2.z
  );
}

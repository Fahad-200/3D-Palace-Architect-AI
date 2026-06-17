import * as THREE from 'three';
import { scene, camera } from './state.js?v=2';
import { registerUpdateCallback } from './callbacks.js?v=2';
import { resolvePlayerCollision, getSurfaceTypeAtFeet, collisionWorld } from './collision.js?v=2';
import { crouchZones as atticCrouchZones } from './world/floor4_attic.js?v=2';
import { crouchZones as basementCrouchZones } from './world/basement.js?v=2';

const allCrouchZones = [
  ...atticCrouchZones.map(z => ({ ...z, floorY: 13.5 })),
  ...basementCrouchZones.map(z => ({ ...z, floorY: -3.75 }))
];

let yawObject, pitchObject;

const keys = new Set();

let verticalVelocity = 0;
let onGround = false;
let isCrouching = false;
let isLocked = false;
let currentEyeHeight = 1.65;
let bobPhase = 0;
let bobAmplitude = 0;

let _velocityX = 0, _velocityY = 0, _velocityZ = 0, _isMoving = false, _surfaceType = 'stone';
let isPaused = false;

let showPos = false;
document.addEventListener('keydown', e => {
  keys.add(e.code);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyC' || e.code === 'ControlLeft') isCrouching = !isCrouching;
  if (e.code === 'Escape') {
    isPaused = !isPaused;
    const menu = document.getElementById('pause-menu');
    if (menu) menu.style.display = isPaused ? 'flex' : 'none';
    if (isPaused && document.pointerLockElement) document.exitPointerLock();
  }
  if (e.code === 'F3') showPos = !showPos;
  if (e.code === 'KeyR') { yawObject.position.set(0, 1.65, 30); verticalVelocity = 0; onGround = true; }
});
const posLabel = document.createElement('div');
posLabel.id = 'pos-label';
posLabel.style.cssText = 'position:fixed;top:4px;left:4px;color:#0f0;font:12px monospace;background:rgba(0,0,0,0.6);padding:4px 8px;z-index:999;pointer-events:none;display:none;';
document.body.appendChild(posLabel);

document.addEventListener('keyup', e => keys.delete(e.code));

function update(delta, elapsed) {
  if (!isLocked || isPaused) return;

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  yawObject.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  let moveX = 0, moveZ = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) { moveX += forward.x; moveZ += forward.z; }
  if (keys.has('KeyS') || keys.has('ArrowDown')) { moveX -= forward.x; moveZ -= forward.z; }
  if (keys.has('KeyA') || keys.has('ArrowLeft')) { moveX -= right.x; moveZ -= right.z; }
  if (keys.has('KeyD') || keys.has('ArrowRight')) { moveX += right.x; moveZ += right.z; }

  const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
  if (moveLength > 0) { moveX /= moveLength; moveZ /= moveLength; }

  const isSprinting = keys.has('ShiftLeft') || keys.has('ShiftRight');
  const speed = isSprinting ? 7.2 : 4.0;
  const isMovingHorizontally = moveLength > 0;

  if (keys.has('Space') && onGround) {
    verticalVelocity = 5.2;
    onGround = false;
  }

  verticalVelocity += -18.0 * delta;
  verticalVelocity = Math.max(verticalVelocity, -30);

  const pos = yawObject.position;
  const desiredX = pos.x + moveX * speed * delta;
  const desiredY = pos.y + verticalVelocity * delta;
  const desiredZ = pos.z + moveZ * speed * delta;

  const result = resolvePlayerCollision(
    yawObject.position,
    new THREE.Vector3(desiredX, desiredY, desiredZ),
    verticalVelocity,
    isCrouching
  );
  if (result.position.y > pos.y + 0.5) console.warn(`Y JUMP ${pos.y.toFixed(3)}->${result.position.y.toFixed(3)} at (${pos.x.toFixed(2)},${pos.z.toFixed(2)}) vv=${verticalVelocity.toFixed(3)} g=${onGround}`);
  yawObject.position.copy(result.position);
  verticalVelocity = result.verticalVelocity;
  onGround = result.onGround;
  _surfaceType = result.surfaceType;

  let inCrouchZone = false;
  const px = pos.x, py = pos.y, pz = pos.z;
  for (const z of allCrouchZones) {
    if (px >= z.minX && px <= z.maxX && pz >= z.minZ && pz <= z.maxZ && Math.abs(py - z.floorY) < 2.0) {
      inCrouchZone = true;
      break;
    }
  }
  if (inCrouchZone) isCrouching = true;

  const targetEyeHeight = isCrouching ? 1.1 : 1.65;
  currentEyeHeight += (targetEyeHeight - currentEyeHeight) * 0.15;
  pitchObject.position.y = currentEyeHeight - 1.65;

  const targetBobAmplitude = isMovingHorizontally && onGround
    ? (isSprinting ? 0.04 : 0.025)
    : 0;
  bobAmplitude += (targetBobAmplitude - bobAmplitude) * 0.1;
  const bobFreq = isSprinting ? 3.2 : 2.0;
  if (isMovingHorizontally && onGround) bobPhase += bobFreq * delta * Math.PI * 2;
  camera.position.y = Math.sin(bobPhase) * bobAmplitude;

  _velocityX = moveX * speed;
  _velocityY = verticalVelocity;
  _velocityZ = moveZ * speed;
  _isMoving = isMovingHorizontally && onGround;

  if (showPos) {
    posLabel.textContent = `X:${pos.x.toFixed(2)} Y:${pos.y.toFixed(2)} Z:${pos.z.toFixed(2)} VV:${verticalVelocity.toFixed(2)} G:${onGround?'Y':'N'} S:${_surfaceType}`;
    posLabel.style.display = 'block';
  } else {
    posLabel.style.display = 'none';
  }
}

export function init(sc, cam) {
  yawObject = new THREE.Object3D();
  pitchObject = new THREE.Object3D();

  pitchObject.add(camera);
  yawObject.add(pitchObject);
  sc.add(yawObject);

  yawObject.position.set(0, 1.65, 30);
  yawObject.rotation.y = 0;

  // Check if already standing on ground
  const initFeetY = yawObject.position.y - 1.65;
  for (const box of collisionWorld.boxes) {
    if (initFeetY <= box.maxY + 0.01 && initFeetY > box.maxY - 0.5) {
      onGround = true;
      break;
    }
  }

  const canvas = document.querySelector('canvas');
  canvas.addEventListener('click', () => {
    if (isPaused) {
      isPaused = false;
      const menu = document.getElementById('pause-menu');
      if (menu) menu.style.display = 'none';
      canvas.requestPointerLock();
      return;
    }
    canvas.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    isLocked = document.pointerLockElement === canvas;
    const prompt = document.getElementById('enter-prompt');
    if (prompt) prompt.style.display = isLocked ? 'none' : 'block';
  });

  document.addEventListener('mousemove', e => {
    if (!isLocked) return;
    const sensitivity = 0.002;
    yawObject.rotation.y -= e.movementX * sensitivity;
    pitchObject.rotation.x -= e.movementY * sensitivity;
    pitchObject.rotation.x = Math.max(-Math.PI * 0.47, Math.min(Math.PI * 0.47, pitchObject.rotation.x));
  });

  registerUpdateCallback(update);
}

export function getPlayerPosition() { return yawObject.position.clone(); }
export function getPlayerYaw() { return yawObject.rotation.y; }
export function isPlayerMoving() { return _isMoving; }
export function getPlayerSurface() { return _surfaceType; }
export function setOnGround(val) { onGround = val; }
export function setVerticalVelocity(val) { verticalVelocity = val; }
export function getVerticalVelocity() { return verticalVelocity; }
export function setPlayerPosition(x, y, z) { yawObject.position.set(x, y, z); }
export function isOnGround() { return onGround; }
export const collidables = [];

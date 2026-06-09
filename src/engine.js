import * as THREE from 'three';
import { setState } from './state.js?v=2';
import { init as initPlayer } from './player.js?v=2';
import { init as initCollision, buildCollisionGrid, collisionWorld } from './collision.js?v=2';
import { init as initMaterials } from './materials.js?v=2';
import { init as initLighting } from './lighting.js?v=2';
import { init as initAudio } from './audio.js?v=2';
import { init as initAtmosphere } from './atmosphere.js?v=2';
import { init as initShell } from './world/shell.js?v=2';
import { init as initExterior } from './world/exterior.js?v=2';
import { init as initStairs } from './world/stairs.js?v=2';
import { init as initFloor1Foyer } from './world/floor1_foyer.js?v=2';
import { init as initFloor1GreatHall } from './world/floor1_greathall.js?v=2';
import { init as initFloor1Gallery } from './world/floor1_gallery.js?v=2';
import { init as initFloor1Kitchen } from './world/floor1_kitchen.js?v=2';
import { init as initFloor2Ballroom } from './world/floor2_ballroom.js?v=2';
import { init as initFloor2Library } from './world/floor2_library.js?v=2';
import { init as initFloor2Chapel } from './world/floor2_chapel.js?v=2';
import { init as initFloor3Master } from './world/floor3_master.js?v=2';
import { init as initFloor3Guests } from './world/floor3_guests.js?v=2';
import { init as initFloor4Observatory } from './world/floor4_observatory.js?v=2';
import { init as initFloor4Attic } from './world/floor4_attic.js?v=2';
import { init as initBasement } from './world/basement.js?v=2';
import { updateCallbacks, registerUpdateCallback, lodObjects, registerLOD } from './callbacks.js?v=2';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2a3a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 0, 0);

const clock = new THREE.Clock();

setState(scene, camera, renderer, clock);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



let fpsFrameCount = 0;
let fpsLastTime = 0;
let currentFPS = 0;
const fpsEl = document.getElementById('fps');

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();
  updateCallbacks.forEach(fn => fn(delta, elapsed));
  lodObjects.forEach(lod => lod.update(camera));
  renderer.render(scene, camera);

  fpsFrameCount++;
  const now = performance.now();
  if (now - fpsLastTime >= 500) {
    currentFPS = Math.round(fpsFrameCount * 1000 / (now - fpsLastTime));
    fpsFrameCount = 0;
    fpsLastTime = now;
    if (fpsEl) fpsEl.textContent = `${currentFPS} FPS | DC: ${renderer.info.render.calls}`;
  }
}

initCollision(scene, camera);
initMaterials();
initShell(scene);
initExterior(scene);
initStairs(scene);
initFloor1Foyer(scene);
initFloor1GreatHall(scene);
initFloor1Gallery(scene);
initFloor1Kitchen(scene);
initFloor2Ballroom(scene);
initFloor2Library(scene);
initFloor2Chapel(scene);
initFloor3Master(scene);
initFloor3Guests(scene);
initFloor4Observatory(scene);
initFloor4Attic(scene);
initBasement(scene);
initLighting(scene);
initAtmosphere(scene);
initAudio();
initPlayer(scene, camera);

buildCollisionGrid();

console.log('Scene children after init:', scene.children.length);
console.log('Collision boxes:', collisionWorld.boxes.length);

const nanMeshes = [];
scene.traverse(obj => {
  if (obj.isMesh && obj.geometry) {
    const pos = obj.geometry.getAttribute('position');
    if (!pos) return;
    const arr = pos.array;
    let hasNaN = false;
    for (let i = 0; i < arr.length; i += 3) {
      if (isNaN(arr[i]) || isNaN(arr[i+1]) || isNaN(arr[i+2]) || !isFinite(arr[i]) || !isFinite(arr[i+1]) || !isFinite(arr[i+2])) {
        hasNaN = true;
        break;
      }
    }
    if (hasNaN) {
      const colorStr = obj.material ? (obj.material.color ? obj.material.color.getHexString() : 'no-color') : 'no-mat';
      const posStr = `${obj.position.x.toFixed(2)},${obj.position.y.toFixed(2)},${obj.position.z.toFixed(2)}`;
      console.warn(`NaN mesh ${obj.uuid.slice(0,8)} color=#${colorStr} pos=${posStr}`);
      nanMeshes.push(obj);
      const p = obj.geometry.getAttribute('position');
      for (let i = 0; i < p.array.length; i++) { if (isNaN(p.array[i])) p.array[i] = 0; }
      obj.geometry.computeBoundingSphere();
      obj.geometry.computeBoundingBox();
    }
  }
});
if (nanMeshes.length) console.warn(`Fixed ${nanMeshes.length} meshes with NaN vertices`);


(function optimizeShadowCasters() {
  const candidates = [];
  scene.traverse(obj => {
    if (obj.isMesh) candidates.push(obj);
  });
  const stack = new THREE.Vector3();
  for (let ci = 0; ci < candidates.length; ci++) {
    const obj = candidates[ci];
    obj.getWorldPosition(stack);
    const isExterior = stack.z > 10.0 || stack.z < -11.0 || stack.x > 18.0 || stack.x < -18.0;
    if (isExterior) continue;
    if (!obj.geometry || !obj.geometry.boundingBox) continue;
    const size = obj.geometry.boundingBox.getSize(new THREE.Vector3());
    if (size.length() > 3.0) continue;
    obj.castShadow = false;
  }
})();

/* TEMPORARY OBJECT CLEANUP */
(function removeTemporaryObjects() {
  const toRemove = [];
  scene.traverse(obj => {
    if (obj.userData && obj.userData.isTemporary) toRemove.push(obj);
  });
  toRemove.forEach(obj => {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
  if (toRemove.length) console.log(`Removed ${toRemove.length} temporary objects.`);
})();

/* DEBUG ROOM LABELS (Tab toggle) */
const roomLabels = [
  { text: 'Grand Foyer', pos: [0, 3.0, 4] },
  { text: 'Great Hall', pos: [0, 3.0, -7] },
  { text: 'Long Gallery', pos: [8.25, 2.5, -7] },
  { text: 'Kitchen', pos: [-12, 2.5, 2] },
  { text: 'Ballroom (F2)', pos: [0, 8.0, 2] },
  { text: 'Library (F2)', pos: [8.5, 8.0, -6.5] },
  { text: 'Chapel (F2)', pos: [-8, 8.0, -8] },
  { text: 'Master Bedroom (F3)', pos: [0, 12.5, 1] },
  { text: 'Guest Wing (F3)', pos: [0, 12.5, -9] },
  { text: 'Attic (F4)', pos: [0, 17.0, 0] },
  { text: 'Observatory', pos: [17.5, 25.5, -10] },
  { text: 'Wine Cellar', pos: [0, -1.5, -2] },
  { text: 'Dungeon', pos: [0, -1.5, 5] },
];
const labelContainer = document.createElement('div');
labelContainer.id = 'debug-labels';
labelContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:150;display:none;';
document.body.appendChild(labelContainer);
let debugMode = false;
document.addEventListener('keydown', e => {
  if (e.code === 'Tab') {
    e.preventDefault();
    debugMode = !debugMode;
    const el = document.getElementById('debug-labels');
    if (!debugMode) { el.style.display = 'none'; return; }
    el.style.display = 'block';
  }
});
let _labelEls = null;
registerUpdateCallback(function updateDebugLabels() {
  const el = document.getElementById('debug-labels');
  if (!debugMode) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  if (!_labelEls) {
    _labelEls = roomLabels.map(r => {
      const div = document.createElement('div');
      div.textContent = r.text;
      div.style.cssText = 'position:absolute;transform:translate(-50%,-50%);color:rgba(200,190,160,0.75);font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-shadow:0 0 4px rgba(0,0,0,0.9);white-space:nowrap;pointer-events:none;';
      el.appendChild(div);
      return div;
    });
  }
  const v3 = new THREE.Vector3();
  _labelEls.forEach((label, i) => {
    const r = roomLabels[i];
    v3.set(r.pos[0], r.pos[1], r.pos[2]);
    v3.project(camera);
    if (v3.z < 1) {
      label.style.display = 'block';
      label.style.left = ((v3.x * 0.5 + 0.5) * window.innerWidth) + 'px';
      label.style.top = ((-v3.y * 0.5 + 0.5) * window.innerHeight) + 'px';
    } else {
      label.style.display = 'none';
    }
  });
});

/* NAVIGATION HINTS */
const navHint = document.createElement('div');
navHint.id = 'nav-hint';
navHint.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);color:rgba(200,190,170,0.5);font-family:Georgia,serif;font-size:13px;letter-spacing:2px;text-align:center;pointer-events:none;z-index:100;transition:opacity 0.5s;opacity:0;';
navHint.textContent = 'Enter the palace — stairs to all floors are ahead';
document.body.appendChild(navHint);
let navHintTimeout = null;
registerUpdateCallback(function updateNavHint(delta, elapsed) {
  if (elapsed < 3) { navHint.style.opacity = '1'; return; }
  if (elapsed < 8) return;
  navHint.style.opacity = '0';
});

animate();

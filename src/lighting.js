import * as THREE from 'three';
import { scene } from './state.js?v=2';
import { registerUpdateCallback } from './callbacks.js?v=2';

const flickerLights = [];
const glassPatchMeshes = [];

function makeWindowShaft(x, y, z, targetX, targetY, targetZ, intensity) {
  const sl = new THREE.SpotLight(0xb8c4cc, intensity * 1.5);
  sl.position.set(x, y, z);
  sl.target.position.set(targetX, targetY, targetZ);
  sl.angle = 0.28;
  sl.penumbra = 0.65;
  sl.decay = 1.8;
  sl.distance = 14;
  sl.castShadow = false;
  scene.add(sl);
  scene.add(sl.target);
  return sl;
}

function makeGlassShaft(x, y, z, tx, ty, tz, color) {
  const sl = new THREE.SpotLight(color, 1.2);
  sl.position.set(x, y, z);
  sl.target.position.set(tx, ty, tz);
  sl.angle = 0.22;
  sl.penumbra = 0.8;
  sl.decay = 2.0;
  sl.distance = 10;
  sl.castShadow = false;
  scene.add(sl);
  scene.add(sl.target);
  return sl;
}

function makeSconce(x, y, z, baseIntensity, range) {
  const pl = new THREE.PointLight(0xff8c30, baseIntensity, range, 2);
  pl.position.set(x, y, z);
  pl.castShadow = false;
  pl.userData.baseIntensity = baseIntensity;
  pl.userData.flickerSpeed = 8 + Math.random() * 6;
  pl.userData.flickerAmp = 0.28 + Math.random() * 0.15;
  pl.userData.flickerOffset = Math.random() * Math.PI * 2;
  scene.add(pl);
  flickerLights.push(pl);
  return pl;
}

function makeShaftVolume(x, y, z, rotX, length) {
  const geo = new THREE.ConeGeometry(0.6, length, 12, 1, true);
  const mesh = new THREE.Mesh(geo, shaftMat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = rotX;
  scene.add(mesh);
}

function makeGlassPatch(x, y, z, colorHex, w, d, angle) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({
      color: colorHex, transparent: true,
      opacity: 0.35, depthWrite: false
    })
  );
  mesh.position.set(x, y + 0.005, z);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.userData.baseOpacity = 0.35;
  scene.add(mesh);
  glassPatchMeshes.push(mesh);
}

const shaftMat = new THREE.MeshStandardMaterial({
  color: 0xe0e8f0,
  transparent: true,
  opacity: 0.08,
  side: THREE.DoubleSide,
  depthWrite: false
});

const coloredShaftMats = [0x1a3a6a, 0x8a2a2a, 0x1a6a3a, 0x9a7a20].map(c =>
  new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.08, depthWrite: false })
);

export function init(sc) {
  // ═════════════════════════════════════════════
  // SECTION A: GLOBAL AMBIENT
  // ═════════════════════════════════════════════

  const ambientLight = new THREE.AmbientLight(0x556677, 0.45);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x6a8cae, 0x605070, 0.7);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // ═════════════════════════════════════════════
  // SECTION B: EXTERIOR MOONLIGHT (SHADOW-CASTING)
  // ═════════════════════════════════════════════

  const moonLight = new THREE.DirectionalLight(0x90a0c0, 2.5);
  moonLight.position.set(-15, 40, 30);
  moonLight.target.position.set(0, 0, 0);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 512;
  moonLight.shadow.mapSize.height = 512;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 120;
  moonLight.shadow.camera.left = -40;
  moonLight.shadow.camera.right = 40;
  moonLight.shadow.camera.top = 40;
  moonLight.shadow.camera.bottom = -40;
  moonLight.shadow.bias = -0.0008;
  moonLight.shadow.normalBias = 0.05;
  scene.add(moonLight);
  scene.add(moonLight.target);

  // ═════════════════════════════════════════════
  // SECTION D: WINDOW LIGHT SHAFTS — FLOOR 1
  // ═════════════════════════════════════════════

  // Foyer south windows — moonlight shafts
  makeWindowShaft(-4.0, 2.8, 12.0, -4.0, 1.2, 8.0, 0.8);
  makeWindowShaft(+4.0, 2.8, 12.0, +4.0, 1.2, 8.0, 0.8);

  // Great Hall south embrasures (stained glass)
  makeGlassShaft(+5.4, 3.5, -5.0, -2.0, 1.5, -5.0, 0x1a3a6a);
  makeGlassShaft(+5.4, 3.5, -9.0, -2.0, 1.5, -9.0, 0x6a1a1a);
  makeGlassShaft(-5.4, 3.5, -5.0, +2.0, 1.5, -5.0, 0x1a4a2a);
  makeGlassShaft(-5.4, 3.5, -9.0, +2.0, 1.5, -9.0, 0x7a6010);

  // ═════════════════════════════════════════════
  // SECTION D: IRON SCONCE FLICKER LIGHTS
  // ═════════════════════════════════════════════

  // Grand Foyer — flanking north doorway
  makeSconce(-5.4, 3.5, -1.6, 2.5, 10.0);
  makeSconce(+5.4, 3.5, -1.6, 2.5, 10.0);

  // Great Hall — flanking throne
  makeSconce(-1.3, 2.2, -11.8, 2.0, 10.0);
  makeSconce(+1.3, 2.2, -11.8, 2.0, 10.0);

  // Great Hall — mid columns (2 surviving sconces)
  makeSconce(-4.3, 2.8, -5.0, 1.5, 9.0);
  makeSconce(+4.3, 2.8, -8.5, 1.5, 9.0);

  // Long Gallery
  makeSconce(+8.25, 3.8, -5.5, 1.2, 9.0);
  makeSconce(+8.25, 3.8, -9.0, 1.2, 9.0);

  // Kitchen — 1 surviving sconce
  makeSconce(-15.5, 2.5, +3.0, 1.2, 9.0);

  // Grand Staircase mezzanine landing
  makeSconce(-2.5, 3.5, -2.0, 1.5, 9.0);
  makeSconce(+2.5, 3.5, -2.0, 1.5, 9.0);

  // ═════════════════════════════════════════════
  // SECTION E: KITCHEN HEARTH EMBER (SHADOW-CASTING 2 of 4)
  // ═════════════════════════════════════════════

  const emberLight = new THREE.PointLight(0xff6a30, 0.8, 12.0, 2);
  emberLight.position.set(-12, 0.28, -1.9);
  emberLight.castShadow = false;
  emberLight.userData.baseIntensity = 5.0;
  emberLight.userData.flickerSpeed = 0.9 + Math.random() * 0.4;
  emberLight.userData.flickerAmp = 0.18;
  emberLight.userData.flickerOffset = 0;
  scene.add(emberLight);
  flickerLights.push(emberLight);

  // ═════════════════════════════════════════════
  // SECTION F: FOYER CHANDELIER REMNANT (non-shadow)
  // ═════════════════════════════════════════════

  const chandelierRemnantLight = new THREE.PointLight(0xc8d0e0, 0.8, 10.0, 2);
  chandelierRemnantLight.position.set(0, 0.35, 4.0);
  chandelierRemnantLight.castShadow = false;
  scene.add(chandelierRemnantLight);

  // ═════════════════════════════════════════════
  // SECTION G: BALLROOM AMBIENT (SHADOW-CASTING 3 of 4)
  // ═════════════════════════════════════════════

  const ballroomLight = new THREE.PointLight(0xd0c8b8, 3.0, 35, 1.5);
  ballroomLight.position.set(0, 10.9, 2.0);
  ballroomLight.castShadow = true;
  ballroomLight.shadow.mapSize.width = 256;
  ballroomLight.shadow.mapSize.height = 256;
  ballroomLight.shadow.camera.near = 0.5;
  ballroomLight.shadow.camera.far = 25;
  ballroomLight.shadow.bias = -0.001;
  scene.add(ballroomLight);

  // ═════════════════════════════════════════════
  // SECTION H: FILL LIGHTS — F3, F4, BASEMENT
  // ═════════════════════════════════════════════

  // Floor 3 master corridor (warmer, brighter)
  const f3Light = new THREE.PointLight(0xffa060, 2.2, 28, 2);
  f3Light.position.set(0, 11.2, 1);
  f3Light.castShadow = false;
  scene.add(f3Light);

  // Floor 3 guest wing
  const f3GuestLight = new THREE.PointLight(0xff9040, 1.6, 20, 2);
  f3GuestLight.position.set(0, 11.5, -7);
  f3GuestLight.castShadow = false;
  scene.add(f3GuestLight);

  // Floor 4 attic (warmer, brighter)
  const atticLight = new THREE.PointLight(0xffa050, 2.0, 28, 2);
  atticLight.position.set(0, 15.8, 1);
  atticLight.castShadow = false;
  scene.add(atticLight);

  // Floor 4 attic north
  const atticNorthLight = new THREE.PointLight(0xff9040, 1.5, 20, 2);
  atticNorthLight.position.set(0, 16.5, -7);
  atticNorthLight.castShadow = false;
  scene.add(atticNorthLight);

  // Floor 4 attic east wing
  const atticEastLight = new THREE.PointLight(0xffa060, 1.5, 22, 2);
  atticEastLight.position.set(12, 16.0, 0);
  atticEastLight.castShadow = false;
  scene.add(atticEastLight);

  // Stairwell light — mezzanine (curved section midpoint)
  const stairLightMezz = new THREE.PointLight(0xffb060, 1.8, 14, 2);
  stairLightMezz.position.set(1.5, 2.5, 4.9);
  stairLightMezz.castShadow = false;
  scene.add(stairLightMezz);

  // Stairwell light — mid-flight F2→F3 (at Z=-4.32 landing)
  const stairLight2 = new THREE.PointLight(0xffa050, 1.5, 12, 2);
  stairLight2.position.set(0, 6.5, -4.3);
  stairLight2.castShadow = false;
  scene.add(stairLight2);

  // Stairwell light — mid-flight F3→F4 (at Z=-10.48 landing)
  const stairLight3 = new THREE.PointLight(0xff9040, 1.3, 12, 2);
  stairLight3.position.set(0, 11.0, -10.5);
  stairLight3.castShadow = false;
  scene.add(stairLight3);

  // Observatory tower (brighter)
  const obsLight = new THREE.PointLight(0x8090a8, 2.5, 30, 2);
  obsLight.position.set(17.5, 22.5, -10.0);
  obsLight.castShadow = false;
  scene.add(obsLight);

  // Observatory additional fill
  const obsFillLight = new THREE.PointLight(0x90a0b8, 1.5, 20, 2);
  obsFillLight.position.set(17.5, 20.0, -8.0);
  obsFillLight.castShadow = false;
  scene.add(obsFillLight);

  // Observatory moonbeam shaft (brighter)
  const moonBeam = new THREE.SpotLight(0xd0dce8, 2.0);
  moonBeam.position.set(17.5, 26, -10.0);
  moonBeam.target.position.set(17.5, 18.5, -9.5);
  moonBeam.angle = 0.12;
  moonBeam.penumbra = 0.3;
  moonBeam.decay = 1.2;
  moonBeam.distance = 14;
  moonBeam.castShadow = false;
  scene.add(moonBeam);
  scene.add(moonBeam.target);

  // Basement wine cellar
  const cellarLight = new THREE.PointLight(0x405060, 0.8, 22, 2);
  cellarLight.position.set(0, -1.2, -2.0);
  cellarLight.castShadow = false;
  scene.add(cellarLight);

  // Dungeon
  const dungeonLight = new THREE.PointLight(0x304050, 0.6, 20, 2);
  dungeonLight.position.set(0, -1.5, 4.0);
  dungeonLight.castShadow = false;
  scene.add(dungeonLight);

  // ═════════════════════════════════════════════
  // SECTION I: FLICKER UPDATE CALLBACK
  // ═════════════════════════════════════════════

  registerUpdateCallback(function (delta, elapsed) {
    for (const light of flickerLights) {
      const base = light.userData.baseIntensity;
      const amp = light.userData.flickerAmp;
      const speed = light.userData.flickerSpeed;
      const offset = light.userData.flickerOffset;
      const flicker1 = Math.sin(elapsed * speed * Math.PI * 2 + offset) * amp;
      const flicker2 = Math.sin(elapsed * speed * 3.7 * Math.PI * 2 + offset * 1.3) * amp * 0.3;
      const dip = (Math.sin(elapsed * 0.31 + offset * 0.7) > 0.92)
        ? -amp * 0.6
        : 0;
      light.intensity = Math.max(base * 0.1, base + flicker1 + flicker2 + dip);
    }

    for (const p of glassPatchMeshes) {
      const base = p.userData.baseOpacity || 0.35;
      p.material.opacity = base * (0.7 + 0.3 * Math.sin(elapsed * 0.08 + p.position.z));
    }
  });

  // ═════════════════════════════════════════════
  // SECTION J: LIGHT SHAFT VISUAL VOLUMES
  // ═════════════════════════════════════════════

  // Foyer south window shafts
  makeShaftVolume(-4.0, 2.5, 10.5, Math.PI * 0.08, 5.0);
  makeShaftVolume(+4.0, 2.5, 10.5, Math.PI * 0.08, 5.0);

  // Great Hall colored shaft volumes
  function makeColoredShaft(x, y, z, rotZ, matIdx, length) {
    const geo = new THREE.ConeGeometry(0.5, length, 10, 1, true);
    const mesh = new THREE.Mesh(geo, coloredShaftMats[matIdx]);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotZ;
    scene.add(mesh);
  }
  makeColoredShaft(+4.5, 3.2, -5.0, -Math.PI / 2, 0, 6.0);
  makeColoredShaft(+4.5, 3.2, -9.0, -Math.PI / 2, 1, 6.0);
  makeColoredShaft(-4.5, 3.2, -5.0, +Math.PI / 2, 2, 6.0);
  makeColoredShaft(-4.5, 3.2, -9.0, +Math.PI / 2, 3, 6.0);

  // ═════════════════════════════════════════════
  // SECTION K: COLORED FLOOR PATCHES FROM STAINED GLASS
  // ═════════════════════════════════════════════

  // Great Hall floor patches below each embrasure
  makeGlassPatch(-2.0, 0.0, -5.0, 0x1a3a6a, 1.8, 2.2, 0.15);
  makeGlassPatch(-2.0, 0.0, -9.0, 0x6a1a1a, 1.4, 1.8, -0.1);
  makeGlassPatch(+2.0, 0.0, -5.0, 0x1a4a2a, 1.6, 2.0, 0.08);
  makeGlassPatch(+2.0, 0.0, -9.0, 0x7a6010, 1.3, 1.6, -0.12);

  // Chapel F2 (pre-registered — geometry comes later)
  makeGlassPatch(-8.0, 4.5, -7.5, 0x1a2a7a, 2.2, 3.5, 0);
  makeGlassPatch(-9.5, 4.5, -7.0, 0x8a1a1a, 1.0, 2.0, 0.2);
  makeGlassPatch(-6.5, 4.5, -7.0, 0x1a7a2a, 0.9, 1.8, -0.15);
}

import { registerUpdateCallback } from './callbacks.js?v=2';
import { getPlayerPosition, isPlayerMoving, getPlayerSurface } from './player.js?v=2';

// Audio triggers are registered by world modules via a shared registry
export const audioTriggers = [];
export function registerAudioTrigger(id, position, radius, callback) {
  audioTriggers.push({ id, position, radius, callback, fired: false });
}

// Silence zone data (hard-coded constants — originally from world files)
const _dungeonSilenceZone = { minX: -10, maxX: 10, minZ: 0, maxZ: 10 };
const _windTriggers = [
  { position: { x: -7.5, y: 10.65, z: -7.0 }, radius: 3.5 }
];

let audioCtx = null;
let masterGain = null;
let isInitialized = false;

function ensureResumed() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

document.addEventListener('click', function initAudio() {
  if (isInitialized) { ensureResumed(); return; }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.8;
  masterGain.connect(audioCtx.destination);
  isInitialized = true;
  buildAllAudioNodes();
  document.removeEventListener('click', initAudio);
});
document.addEventListener('pointerdown', ensureResumed);
document.addEventListener('keydown', ensureResumed);

function createNoiseBuffer(duration, sampleRate) {
  const bufferSize = sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
  return buffer;
}

function createFilteredNoise(lowFreq, highFreq, gainValue) {
  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer(2, audioCtx.sampleRate);
  noise.loop = true;
  const lpf = audioCtx.createBiquadFilter();
  lpf.type = 'lowpass'; lpf.frequency.value = highFreq;
  const hpf = audioCtx.createBiquadFilter();
  hpf.type = 'highpass'; hpf.frequency.value = lowFreq;
  const gain = audioCtx.createGain();
  gain.gain.value = gainValue;
  noise.connect(hpf); hpf.connect(lpf); lpf.connect(gain); gain.connect(masterGain);
  noise.start();
  return { source: noise, gain, lpf, hpf };
}

let windLow, windMid, windHigh;

function buildWindLayers() {
  windLow = createFilteredNoise(20, 80, 0.015);
  windMid = createFilteredNoise(180, 750, 0.008);
  windHigh = createFilteredNoise(1400, 3200, 0.003);
}

function createWhistle(freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.018, audioCtx.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0.012, audioCtx.currentTime + 0.8);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(); osc.stop(audioCtx.currentTime + 1.3);
}

let lastStepPos = null;
let stepDistance = 0;
let lastStepTime = 0;
const STEP_INTERVAL = 1.5;

const surfaceFootstepProfiles = {
  marble: { freq: 280, decay: 0.08, gain: 0.09, filterFreq: 4000, type: 'square' },
  stone: { freq: 180, decay: 0.12, gain: 0.08, filterFreq: 2000, type: 'square' },
  wood: { freq: 220, decay: 0.09, gain: 0.07, filterFreq: 3500, type: 'triangle' },
  carpet: { freq: 120, decay: 0.18, gain: 0.025, filterFreq: 800, type: 'sine' },
  rubble: { freq: 150, decay: 0.06, gain: 0.06, filterFreq: 1500, type: 'square' },
  metal: { freq: 320, decay: 0.15, gain: 0.1, filterFreq: 6000, type: 'sawtooth' },
  earth: { freq: 100, decay: 0.2, gain: 0.03, filterFreq: 500, type: 'sine' },
  tile: { freq: 260, decay: 0.07, gain: 0.085, filterFreq: 3800, type: 'square' }
};

function playFootstep(surfaceType) {
  if (!isInitialized) return;
  const profile = surfaceFootstepProfiles[surfaceType] || surfaceFootstepProfiles.stone;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = profile.filterFreq * (0.9 + Math.random() * 0.2);
  osc.type = profile.type;
  osc.frequency.setValueAtTime(profile.freq * (1 + (Math.random() - 0.5) * 0.1), audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(profile.freq * 0.4, audioCtx.currentTime + profile.decay);
  gain.gain.setValueAtTime(profile.gain * (0.9 + Math.random() * 0.2), audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + profile.decay * 2);
  osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
  osc.start(); osc.stop(audioCtx.currentTime + profile.decay * 3);
  if (surfaceType === 'stone' || surfaceType === 'rubble' || surfaceType === 'marble') {
    const nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(profile.gain * 0.4, audioCtx.currentTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.1, audioCtx.sampleRate);
    const nFilt = audioCtx.createBiquadFilter();
    nFilt.type = 'bandpass'; nFilt.frequency.value = 1200; nFilt.Q.value = 0.8;
    noise.connect(nFilt); nFilt.connect(nGain); nGain.connect(masterGain);
    noise.start();
  }
}

let nextCreakTime = 0;

function scheduleNextCreak() {
  nextCreakTime = audioCtx.currentTime + 45 + Math.random() * 45;
}

function playCreakTone(freq, duration, gain) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq * (1 + Math.random() * 0.15), audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.7, audioCtx.currentTime + duration);
  g.gain.setValueAtTime(0, audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  const lpf = audioCtx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 400;
  osc.connect(lpf); lpf.connect(g); g.connect(masterGain);
  osc.start(); osc.stop(audioCtx.currentTime + duration + 0.05);
}

function playCreak() {
  const isFloorCreak = Math.random() > 0.4;
  if (isFloorCreak) {
    playCreakTone(60 + Math.random() * 30, 0.4, 0.06);
    setTimeout(() => playCreakTone(50 + Math.random() * 20, 0.3, 0.05), 180);
  } else {
    playCreakTone(35 + Math.random() * 25, 0.6, 0.12);
  }
  scheduleNextCreak();
}

function playPianoChord() {
  const frequencies = [146.83, 174.61, 220.0, 261.63, 155.56];
  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 25;
    gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + i * 0.06 + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.015, audioCtx.currentTime + i * 0.06 + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.06 + 5.0);
    const delay = audioCtx.createDelay(0.05);
    delay.delayTime.value = 0.018 + Math.random() * 0.005;
    const feedGain = audioCtx.createGain(); feedGain.gain.value = 0.25;
    osc.connect(gain); gain.connect(masterGain); gain.connect(delay);
    delay.connect(feedGain); feedGain.connect(delay);
    osc.start(); osc.stop(audioCtx.currentTime + i * 0.06 + 5.5);
  });
}

let nextDripTime = 0;
const DRIP_INTERVAL_MIN = 2.2, DRIP_INTERVAL_MAX = 6.5;

function playDrip() {
  if (!isInitialized) return;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const g1 = audioCtx.createGain(); const g2 = audioCtx.createGain();
  osc1.type = 'sine'; osc1.frequency.setValueAtTime(900, audioCtx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
  g1.gain.setValueAtTime(0.07, audioCtx.currentTime);
  g1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  osc2.type = 'sine'; osc2.frequency.value = 650 + Math.random() * 100;
  g2.gain.setValueAtTime(0.03, audioCtx.currentTime + 0.02);
  g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
  osc1.connect(g1); g1.connect(masterGain);
  osc2.connect(g2); g2.connect(masterGain);
  osc1.start(); osc1.stop(audioCtx.currentTime + 0.1);
  osc2.start(audioCtx.currentTime + 0.02); osc2.stop(audioCtx.currentTime + 0.4);
  nextDripTime = audioCtx.currentTime + DRIP_INTERVAL_MIN + Math.random() * (DRIP_INTERVAL_MAX - DRIP_INTERVAL_MIN);
}

function buildAllAudioNodes() {
  buildWindLayers();
  scheduleNextCreak();
  nextDripTime = audioCtx.currentTime + 3;
}

registerUpdateCallback(function(delta, elapsed) {
  if (!isInitialized) return;
  const playerPos = getPlayerPosition();
  const moving = isPlayerMoving();
  const surface = getPlayerSurface();

  if (moving && elapsed - lastStepTime > 0.1) {
    if (lastStepPos) {
      stepDistance += playerPos.distanceTo(lastStepPos);
      if (stepDistance >= STEP_INTERVAL) {
        playFootstep(surface);
        stepDistance = 0;
        lastStepTime = elapsed;
      }
    }
    lastStepPos = playerPos.clone();
  } else {
    lastStepPos = null;
    stepDistance = 0;
  }

  if (audioCtx.currentTime >= nextCreakTime) playCreak();

  for (const trig of audioTriggers) {
    if (!trig.fired && playerPos.distanceTo(trig.position) < trig.radius) {
      trig.fired = true;
      if (trig.callback === 'playPianoChord') playPianoChord();
      else if (typeof trig.callback === 'function') trig.callback();
    }
  }

  const inBasement = playerPos.y < 0;
  if (inBasement && audioCtx.currentTime >= nextDripTime) {
    playDrip();
  }

  const ds = _dungeonSilenceZone || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  const inDungeon = ds ? (playerPos.x > ds.minX && playerPos.x < ds.maxX &&
                    playerPos.z > ds.minZ && playerPos.z < ds.maxZ) : false;
  const targetWindGain = inDungeon ? 0.0 : 0.8;
  masterGain.gain.setTargetAtTime(targetWindGain, audioCtx.currentTime, 0.5);

  const nearWindow = _windTriggers.some(wt =>
    playerPos.distanceTo(wt.position) < wt.radius
  );
  windMid.gain.gain.setTargetAtTime(nearWindow ? 0.06 : 0.022, audioCtx.currentTime, 0.4);
  windHigh.gain.gain.setTargetAtTime(nearWindow ? 0.025 : 0.008, audioCtx.currentTime, 0.3);

  const gustLevel = 0.5 + 0.5 * Math.sin(elapsed * 0.12) * Math.sin(elapsed * 0.07 + 1.3);
  windMid.gain.gain.setTargetAtTime(0.015 + 0.015 * gustLevel, audioCtx.currentTime, 0.5);
  windHigh.gain.gain.setTargetAtTime(0.004 + 0.008 * gustLevel, audioCtx.currentTime, 0.4);
  if (Math.random() < 0.001) {
    createWhistle(200 + Math.random() * 400);
  }
});

export function init() {}

export function getActiveTriggerCount() { return audioTriggers.length; }

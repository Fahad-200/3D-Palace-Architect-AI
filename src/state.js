let _scene = null;
let _camera = null;
let _renderer = null;
let _clock = null;

export function getScene() { return _scene; }
export function getCamera() { return _camera; }
export function getRenderer() { return _renderer; }
export function getClock() { return _clock; }

export function setState(s, c, r, cl) { _scene=s; _camera=c; _renderer=r; _clock=cl; }

export { _scene as scene, _camera as camera, _renderer as renderer, _clock as clock };

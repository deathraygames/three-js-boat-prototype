// import { clamp } from 'three/src/math/mathutils.js';
const clamp = (v, min = 0, max = 1) => v < min ? min : v > max ? max : v;
export default clamp;

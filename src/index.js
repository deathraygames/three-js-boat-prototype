import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { BoxHelper } from 'three/src/helpers/BoxHelper.js';
import Renderer from './Renderer.js';
import RealityGrid from './RealityGrid.js';
import GameSky from './GameSky.js';
import GameWater from './GameWater.js';
import Stats from 'three/addons/libs/stats.module.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Boat from './Boat.js';
import Crate from './Crate.js';
import GridEntity from './GridEntity.js';
import BrainBoat from './BrainBoat.js';
import ThirdPersonCamera from './ThirdPersonCamera.js';
// Using little.js for it's keyboard inputs
import { keyIsDown } from './libs/engine.all.js';
import MouseWheelWatcher from './MouseWheelWatcher.js';

// const NOOP = () => {};
const MAP_SIZE = 5000; // Modify this as needed
const MAP_MAX = MAP_SIZE/2;
const MAP_MIN = -MAP_MAX;
const FOV = 60; // 55? 75?

const { Vector3, PerspectiveCamera } = THREE;

const renderer = new Renderer({
	// Enable this to make the scene look like 240p (PS1)
	// width: 320, height: 240,
	container: 'container', pixelated: true,
});

const camera = new PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(30, 30, 100);

const grid = new RealityGrid({ renderer, camera });

 
// Needed for wireframe - See https://stackoverflow.com/a/31541369
// const materialFixes = {
// 	polygonOffset: true,
// 	polygonOffsetFactor: 1, // positive value pushes polygon further away
// 	polygonOffsetUnits: 1
// };


// Enable for orbit controls
// const controls = new OrbitControls(camera, grid.renderer.domElement);
// controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set( 0, 10, 0 );
// controls.minDistance = 40.0;
// controls.maxDistance = 10000.0;
// controls.update();

let stats;
let water;
let pcBoat;
let thirdPersonCamera;
let enemyBoats = [];
let mouseWheelWatcher;

function getRandomCoordinates() {
	const r = () => Math.random() * MAP_MIN / 2 + Math.random() * MAP_MAX / 2;
	return [r(), r()];
}

function init() {
	// Water
	water = new GameWater({
		textureImage: 'images/waternormals.jpg',
		fog: grid.scene.fog !== undefined,
		size: { width: MAP_SIZE, height: MAP_SIZE },
	});
	// grid.scene.add(water);
	const waterEntity = new GridEntity({ mesh: water, wireframe: false });
	// waterEntity.move = NOOP;
	grid.add(waterEntity);

	// Set grid size
	grid.setBoundaries([MAP_MIN, MAP_MAX], [MAP_MIN, MAP_MAX], [MAP_MIN, MAP_MAX]);
	
	// Skybox
	const sky = new GameSky(grid.scene, grid.renderer);
	grid.scene.add(sky);

	// Boats
	pcBoat = new Boat({
		color: 0xffffff, worldGrid: grid,
		gravity: new Vector3(0, -8, 0),
		// gravity: new Vector3(0, 0, 0),
	});
	pcBoat.isPC = true;
	grid.add(pcBoat);

	// Crates
	const crates = [];
	[1,1,1,1,1,1,1].forEach(() => {
		const crate = new Crate();
		grid.add(crate);
		crates.push(crate);
		const coords = getRandomCoordinates();
		crate.setX(coords[0]);
		crate.setZ(coords[1]);
	});
	console.log(crates);

	// Stats (debug)
	stats = new Stats();
	renderer.container.appendChild( stats.dom );
	{ // GUI
		// const gui = new GUI();
		// const folderSky = gui.addFolder( 'Sky' );
		// folderSky.add( sky.parameters, 'elevation', 0, 90, 0.1 ).onChange(() => sky.update(water));
		// folderSky.add( sky.parameters, 'azimuth', - 180, 180, 0.1 ).onChange(() => sky.update(water));
		// folderSky.open();
		const waterUniforms = water.material.uniforms;
		// const folderWater = gui.addFolder( 'Water' );
		// folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
		// folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
		// folderWater.open();
	}

	// Fix
	window.addEventListener('resize', () => renderer.fixSize(camera));

	mouseWheelWatcher = new MouseWheelWatcher({ min: -100, max: 100 });

	// Camera
	thirdPersonCamera = new ThirdPersonCamera({ camera, target: pcBoat });
	window.thirdPersonCamera = thirdPersonCamera;
	console.log(thirdPersonCamera);

	// Enemies
	[1,1,1,1,1,1,1,1,1].forEach(() => {
		const enemyBoat = new BrainBoat();
		enemyBoats.push(enemyBoat);
		grid.add(enemyBoat);
		const coords = getRandomCoordinates();
		enemyBoat.setX(coords[0]);
		enemyBoat.setZ(coords[1]);
	});
}

function handleBoatCollision(boat1, boat2) {
	boat1.applyFriction();
	boat2.applyFriction();
}

// NOTE: Collision checks are not yet working
function checkCollisions() {
	const pcBoatBox3 = pcBoat.getBoundingBoxHelperBox();
	let hits = 0;
	enemyBoats.forEach((b) => {
		// const hit = b.bbox.intersectsBox(pcBoat.bbox);
		const box3 = b.getBoundingBoxHelperBox();
		const hit = box3.intersectsBox(pcBoatBox3);
		if (hit) {
			hits += 1;
			handleBoatCollision(pcBoat, b);
		}
	});
	// Debugging
	console.log(hits);
}

let nowTime;
let t; // last time delta

function animate() {
	const lastTimeNow = nowTime;
	nowTime = performance.now();
	t = (lastTimeNow) ? nowTime - lastTimeNow : 0.000001;
	t = t / 1000; // Convert from ms to seconds

	// Movement controls
	if (keyIsDown(38)) pcBoat.throttleUp(); // w
	if (keyIsDown(40)) pcBoat.throttleDown(); // s
	const turnAmount = (keyIsDown(37) - keyIsDown(39)); // a and d
	pcBoat.turn(turnAmount);
	// Cannon controls
	if (keyIsDown(69)) pcBoat.cannon.fire(); // e
	// if (keyIsDown(81))  // q
	if (keyIsDown(90)) pcBoat.cannon.raise(.01); // z
	if (keyIsDown(88)) pcBoat.cannon.lower(.01); // x
	
	// Enable for orbit controls
	// controls.update();
	
	// Update everything
	grid.update(t, nowTime);
	water.update(t);
	thirdPersonCamera.update(t, mouseWheelWatcher.percent);

	stats.update();
	grid.render();
	mouseWheelWatcher.update();
	checkCollisions();

	requestAnimationFrame(animate);
}

// Expose things on the window for debugging
window.boat = pcBoat;
window.grid = grid;
window.water = water;
window.boats = enemyBoats;

init();
animate();

import Grid from './Grid.js';
import Cooldown from './Cooldown.js';
import * as THREE from 'three';
import Cannon from './Cannon.js';

const THROTTLE_UP_PER = 1;
const THROTTLE_ACC_SCALE = .5;

class Boat extends Grid {
	constructor(options = {}) {
		const color = options.color || Boat.getRandomBoatColor();
		const geometry = new THREE.BoxGeometry( 30, 20, 40 );
		const material = new THREE.MeshStandardMaterial({ roughness: .9, color });
		const mesh = new THREE.Mesh(geometry, material);
		options.mesh = mesh;
		super(options);
		// this.mesh = mesh;
		this.bob = { t: Math.random() * 999, y: 0 };
		this.throttle = 0;
		this.throttleSpeed = 0;
		this.maxThrottle = 10;
		this.throttleCooldown = new Cooldown(0, .3);
		this.team = options.team || 'neutral';
		this.worldGrid = options.worldGrid;
		this.cannon = new Cannon({ worldGrid: this.worldGrid, gravity: this.gravity, mass: 0 });
		this.add(this.cannon);
	}

	static getRandomBoatColor() {
		const rand = (n) => Math.random() * n;
		const r = rand(1);
		const g = rand(1);
		const b = rand(1);
		return new THREE.Color(r, g, b);
	}

	throttleUp() {
		if (this.throttleCooldown.isHot()) return;
		this.throttle = Math.min(this.maxThrottle, this.throttle + THROTTLE_UP_PER);
		this.throttleCooldown.heat();
		// console.log(this.throttle);
	}

	throttleDown() {
		if (this.throttleCooldown.isHot()) return;
		this.throttle = Math.max(0, this.throttle - 1);
		this.throttleCooldown.heat();
		// console.log(this.throttle);
	}

	applyThrottleVelocity() {
		// const direction = new THREE.Vector3(this.throttle, 0, 0);
		// this.velocity.add(direction.multiplyScalar(0.1));

		const directionVec2 = this.getFacingVector2(); 
		const throttleDirectionVec3 = new THREE.Vector3(directionVec2.y, 0, directionVec2.x);
		const throttleScale = this.throttle * THROTTLE_ACC_SCALE;
		this.applyAcceleration(throttleDirectionVec3.multiplyScalar(throttleScale));
	}

	updateBob(t) {
		this.bob.t += t * 1;
		this.bob.y = Math.sin(this.bob.t) * .02;
		const y = this.position.y + this.bob.y;
		// const y = Math.sin(this.bob) * 2;
		// const y = Math.sin(now * .002) * 10 + 0;
		const newPos = this.position.clone().setY(y);
		this.setPosition(newPos);
	}

	turn(turnAmount) {
		// this.rotate(0, turnAmount * .01, 0);
		// console.log(turnAmount);
		const angAcc = new THREE.Vector3(0, turnAmount * .02, 0);
		this.applyAngularAcceleration(angAcc);
	}

	update(t, now) {
		this.throttleSpeed = this.throttle; // TODO: Make this ramp up and down
		if (this.throttle) this.applyThrottleVelocity();
		// 	const directionVec2 = this.getFacingVector2(); 
		// 	const throttleDirectionVec3 = new THREE.Vector3(directionVec2.y, 0, directionVec2.x);
		// 	this.velocity.add(throttleDirectionVec3.multiplyScalar(1));
		// }
		this.updatePhysics(t);
		// this.applyFriction(.01);
		this.applyAngularFriction(.02);
		this.updateBob(t);
		this.updateChildren(t, now);
		// Cool downs
		this.throttleCooldown.cool(t);
	}
}

export default Boat;

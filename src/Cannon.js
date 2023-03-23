import GridEntity from './GridEntity.js';
import Cannonball from './Cannonball.js';
import Cooldown from './Cooldown.js';
import clamp from 'rocket-boots-three-toolbox/src/clamp.js';
import * as THREE from 'three';

const HALF_PI = Math.PI / 2;

function degreesToRadians(d) {
	return d * (Math.PI / 180);
}

class Cannon extends GridEntity {
	constructor(options = {}) {
		const geometry = new THREE.CylinderGeometry(5, 5, 20, 12);
		const material = new THREE.MeshStandardMaterial({ roughness: .5, color: 0x444444 });
		const mesh = new THREE.Mesh(geometry, material);
		options.mesh = mesh;
		super(options);
		this.setPosition({ x: 0, y: 15, z: 0});
		this.angle = .6;
		this.angleRange = [.1, 1.4];
		this.rotate(this.angle, 0, 0);
		this.worldGrid = options.worldGrid;
		this.fireCooldown = new Cooldown(0, .5);
	}

	setAngle(a) {
		this.angle = clamp(a, this.angleRange[0], this.angleRange[1]);
		console.log('angle', this.angle);
		this.setRotation(this.angle, 0, 0);
	}

	raise(a = .1) {
		this.setAngle(this.angle - a); // degreesToRadians(a));
	}

	lower(a = .1) {
		this.setAngle(this.angle + a); // degreesToRadians(a));
	}

	getCannonDirection() {
		let dir = new THREE.Vector3(0, 1, 0);
		// const cannonOffset = this.mesh.clone(); // .rotateOnAxis(new THREE.Vector3(1, 0, 0), -HALF_PI);
		// console.log(cannonOffset.rotation);
		// dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), -HALF_PI);
		// dir = cannonOffset.getWorldDirection(dir);
		const q = new THREE.Quaternion();
		this.mesh.getWorldQuaternion(q);
		dir.applyQuaternion(q);
		return dir.normalize();
	}

	fire() {
		// console.log('timeLeft', this.fireCooldown.timeLeft);
		const isHot = this.fireCooldown.isHot();
		// console.log('hot?', isHot);
		if (isHot) return false;
		this.fireCooldown.heat();
		const position = this.worldGrid.getPosition(this.position, this.mesh);
		const velocity = this.velocity.clone();
		const { gravity } = this;
		const cannonball = new Cannonball({ position, velocity, gravity });
		this.worldGrid.add(cannonball);
		const acc = this.getCannonDirection().clone().multiplyScalar(500);
		cannonball.applyAcceleration(acc);
	}

	update(t) {
		super.update(t);
		this.fireCooldown.cool(t);
	}
}

export default Cannon;

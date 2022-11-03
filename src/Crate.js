import * as THREE from 'three';
import GridEntity from './GridEntity.js';

class Crate extends GridEntity {
	constructor(options = {}) {
		const color = options.color || 0x997744;
		const geometry = new THREE.BoxGeometry( 20, 20, 20 );
		const material = new THREE.MeshStandardMaterial({ roughness: .9, color });
		const mesh = new THREE.Mesh(geometry, material);
		options.mesh = mesh;
		super(options);
		this.bob = Math.random() * 999;
	}

	updateBob(t) {
		this.bob += t * 0.001;
		const y = Math.sin(this.bob) * 8 + 0;
		// const y = Math.sin(now * .002) * 10 + 0;
		const newPos = this.position.clone().setY(y);
		this.setPosition(newPos);
	}

	update(t, now) {
		this.updatePhysics(t);
		this.updateBob(t);
		const rotateAmount = now * 0.001 * 0.05;
		this.rotate(.001, 0, .002)
		// this.rotation.x = t * 0.05;
		// this.rotation.z = t * 0.052;
	}
}

export default Crate;

import GridEntity from './GridEntity.js';
import * as THREE from 'three';

class Cannonball extends GridEntity {
	constructor(options = {}) {
		const geometry = new THREE.SphereGeometry(4.9, 32, 16);
		const color = new THREE.Color(1, .3, .2); // heated color
		const material = new THREE.MeshStandardMaterial({ roughness: .2, color });
		const mesh = new THREE.Mesh(geometry, material);
		options.mesh = mesh
		super(options);
		this.baseColor = new THREE.Color(.1, .1, .1); // cool color
	}

	update(t, now) {
		super.update(t, now);
		this.mesh.material.color.lerp(this.baseColor, .05);
	}
}

export default Cannonball;

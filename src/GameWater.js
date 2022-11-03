import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

const TIME_INCREMENT = 1.0 / 100.0; // originall 1/60

class GameWater extends Water {
	constructor(options = {}) {
		const size = options.size || { width: 10000, height: 10000 };
		const waterGeometry = new THREE.PlaneGeometry(size.width, size.height, 4, 4);
		const waterOptions = {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load(options.textureImage, function (texture) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			}),
			sunDirection: new THREE.Vector3(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: options.fog,
		};
		super(waterGeometry, waterOptions);
		this.rotation.x = - Math.PI / 2;
		// this.material.wireframe = true;
		this.material.uniforms.size.value = 5;
	}

	move() {

	}

	update(t) {
		this.material.uniforms['time'].value += TIME_INCREMENT;

		// this.material.uniforms['size'].value += .01;
		// this.material.defaultAttributeValues.uv[0] += 1;
		// this.position.setZ(this.position.z + 10);
	}
}

export default GameWater;

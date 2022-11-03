import { PMREMGenerator, MathUtils, Vector3 } from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

class GameSky extends Sky {
	constructor(scene, renderer) {
		super();
		this.scene = scene;
		this.scale.setScalar( 10000 );
		
		this.sun = new Vector3();
		const skyUniforms = this.material.uniforms;

		skyUniforms[ 'turbidity' ].value = 10;
		skyUniforms[ 'rayleigh' ].value = 2;
		skyUniforms[ 'mieCoefficient' ].value = 0.005;
		skyUniforms[ 'mieDirectionalG' ].value = 0.8;

		this.parameters = {
			elevation: 2,
			azimuth: 180
		};

		this.pmremGenerator = new PMREMGenerator(renderer);
		this.renderTarget;
		this.update();
	}

	update(water) {
		const phi = MathUtils.degToRad( 90 - this.parameters.elevation );
		const theta = MathUtils.degToRad( this.parameters.azimuth );

		this.sun.setFromSphericalCoords( 1, phi, theta );

		this.material.uniforms[ 'sunPosition' ].value.copy(this.sun);
		if (water) water.material.uniforms[ 'sunDirection' ].value.copy(this.sun).normalize();

		if (this.renderTarget !== undefined) this.renderTarget.dispose();

		this.renderTarget = this.pmremGenerator.fromScene(this);

		this.scene.environment = this.renderTarget.texture;
	}
}

export default GameSky;
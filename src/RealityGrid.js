import { Scene, WireframeGeometry, LineSegments } from 'three';
import GridEntity from './GridEntity.js';
import Grid from './Grid.js';

class RealityGrid extends Grid {
	constructor(options = {}) {
		super(options);
		this.scene = options.scene || new Scene();
		this.renderer = options.renderer;
		this.camera = options.camera;
		this.grid = null; // Reality grid cannot be a child of another grid
		this.addDestination = 'scene';
	}

	makeGridEntity(...args) {
		const gridObj = new GridEntity(...args);
		this.add(gridObj);
		return gridObj;
	}

	addGeometryWireframe(geometry) {
		const wireframe = new WireframeGeometry(geometry);
		const line = new LineSegments(wireframe);
		line.material.depthTest = false;
		line.material.opacity = 0.25;
		line.material.transparent = true;
		this.scene.add(line);
	}

	getPosition(pos, mesh) {
		this.scene.updateMatrixWorld(true);
		const globalPos = pos.clone().setFromMatrixPosition(mesh.matrixWorld);
		return globalPos;
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}
}

export default RealityGrid;

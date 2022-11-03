import GridEntity from './GridEntity.js';

class Grid extends GridEntity {
	constructor(options = {}) {
		super(options);
		this.children = [];
		this.addDestination = 'mesh';
		this.boundaries = { x: [-Infinity, Infinity], y: [-Infinity, Infinity], z: [-Infinity, Infinity] };
	}

	setBoundaries(x, y, z) {
		if (x) this.boundaries.x = x;
		if (y) this.boundaries.y = y;
		if (z) this.boundaries.z = z;
	}

	add(gridObj) {
		if (!(gridObj instanceof GridEntity)) console.warn(gridObj, 'not a GridEntity');
		this.children.push(gridObj);
		gridObj.grid = this;
		if (gridObj.mesh) {
			// this.scene.add(gridObj.mesh);
			this[this.addDestination].add(gridObj.mesh);
			// this.addGeometryWireframe(gridObj.mesh.geometry);
		}
	}

	updateChildren(t, now) {
		this.children.forEach((child) => {
			if (child.update) child.update(t, now);
		});
	}

	update(t, now) {
		this.updateChildren(t, now);
	}

	moveChildren(vec3, options = {}) {
		this.children.forEach((child) => {
			if (options.except) {
				if (options.except.includes(child)) return;
			}
			child.move(vec3);
		});
	}
}

export default Grid;

import * as THREE from 'three';
import { Vector2 } from 'three';

// from little.js engine.all.js
const clamp = (v, min = 0, max = 1) => v < min ? min : v > max ? max : v;

// Similar in concept to Little.js's EngineObject
class GridEntity {
	constructor({
		grid,
		mesh,
		position,
		velocity,
		wireframe = false,
		name,
		gravity,
		mass = 1,
		worldGrid,
	} = {}) {
		this.worldGrid = worldGrid; // shouldn't be needed, but sometimes we need to reach out to the world
		this.grid = grid;
		this.mesh = mesh;
		if (wireframe && mesh) this.addWireframe();
		this.position = position || new THREE.Vector3();
		this.velocity = velocity || new THREE.Vector3();
		this.rotation = new THREE.Vector3();
		this.angularVelocity = new THREE.Vector3();
		this.gravity = gravity || new THREE.Vector3();
		this.setPosition(position);
		this.name = name || Math.round(Math.random() * 99999);
		this.mass = mass;


		this.bbox = new THREE.Box3(); // bounding box
		this.updateBoundingBox();
		this.visibleBoundingBoxMesh = this.getBoundingBoxMesh();
		if (this.mesh) this.mesh.add(this.visibleBoundingBoxMesh);

		this.boxHelper = new THREE.BoxHelper(this.mesh, 0x00ff00);
		if (worldGrid) worldGrid.scene.add(this.boxHelper);
	}

	static getXYZArguments(args) {
		if (typeof args[0] === 'object') {
			const { x, y, z } = args[0];
			return { x, y, z };
		}
		return { x: args[0] || 0, y: args[1] || 0, z: args[2] || 0 };
	}

	setRotation(...args) {
		const { x, y, z } = GridEntity.getXYZArguments(args);
		// console.log('set rotation', x, y, z);
		this.rotation.set(x, y, z);
		if (!this.mesh) return;
		this.mesh.rotation.set(x, y, z);
	}

	rotate(x = 0, y = 0, z = 0) {
		// this.setRotation({ x: this.rotation.x + x, y: this.rotation.y + y, z: this.rotation.z + z });
		this.rotation.x += x;
		this.rotation.y += y;
		this.rotation.z += z;
		if (!this.mesh) return;
		this.mesh.rotation.x += x;
		this.mesh.rotation.y += y;
		this.mesh.rotation.z += z;
	}

	setPosition(pos = {}) {
		this.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
		if (!this.mesh) return;
		this.mesh.position.set(this.position.x, this.position.y, this.position.z);
	}

	setX(x) { this.setPosition(this.position.clone().setX(x)); }
	setY(y) { this.setPosition(this.position.clone().setY(y)); }
	setZ(z) { this.setPosition(this.position.clone().setZ(z)); }

	getFacingVector2() {
		return (new Vector2(1, 0)).rotateAround(new Vector2(), this.rotation.y);
	}

	getBoundingBox() {
		if (!this.mesh) return;
		this.mesh.geometry.computeBoundingBox(); // TODO: this should be done only once assuming static geometeries
		return this.mesh.geometry.boundingBox;
	}

	getBoundingBoxHelperBox() {
		this.boxHelper.update();
		const box3 = new THREE.Box3();
		box3.setFromObject(this.boxHelper);
		return box3;
	}

	getBoundingBoxMesh() {
		this.updateBoundingBox();
		const geometry = new THREE.BoxGeometry(
			this.bbox.max.x - this.bbox.min.x,
			this.bbox.max.y - this.bbox.min.y,
			this.bbox.max.z - this.bbox.min.z,
		);
		// const material = new THREE.MeshStandardMaterial({ roughness: .9, color: 0xeeeeee });
		// material.opacity = .5;
		// material.transparent = true;
		// return new THREE.Mesh(geometry, material);
		return GridEntity.getWireframe(geometry);
	}

	move(vec3 = {}) {
		this.position.add(vec3);
		this.setPosition(this.position);
	}

	static getWireframe(geometry, color = 0xffffff, opacity = .5) {
		const geo = new THREE.WireframeGeometry(geometry);
		const mat = new THREE.LineBasicMaterial({ color }); // color: 0xffffff });
		const line = new THREE.LineSegments(geo, mat);
		// line.material.depthTest = false;
		line.material.opacity = opacity;
		line.material.transparent = true;
		return line; // mesh
	}

	addWireframe() {
		this.mesh.add(GridEntity.getWireframe(this.mesh.geometry));
	}

	// TODO: apply friction in updatePhysics and use time as a param
	applyFriction(amount = 0.05) {
		const acc = this.velocity.clone().multiplyScalar(clamp(amount) * -1);
		this.applyAcceleration(acc);
		// this.velocity this.velocity.clone()
	}

	applyAngularFriction(amount = .05) {
		const acc = this.angularVelocity.clone().multiplyScalar(clamp(amount) * -1);
		this.applyAngularAcceleration(acc);
	}

	applyAcceleration(acc) {
		if (this.mass) this.velocity.add(acc);
	}

	applyAngularAcceleration(acc) {
		if (this.mass) this.angularVelocity.add(acc);
	}

	applyForce(force) {
		// TODO
		// little js's
		// this.applyAcceleration(force.scale(1/this.mass)); }
	}

	updatePhysics(t) {
		// const newPos = 
		if (!t) return;

		if (this.gravity) {
			if (this.position.y > 0) this.applyAcceleration(this.gravity);
			else this.applyFriction();
		}
		const velPerTime = this.velocity.clone().multiplyScalar(t);
		// if (this.isPC) console.log(velPerTime);
		this.move(velPerTime);
		const angVelPerTime = this.angularVelocity.clone().multiplyScalar(t);
		this.rotate(angVelPerTime.x, angVelPerTime.y, angVelPerTime.z);
	}

	updateBoundingBox() {
		if (!this.mesh) return;
		this.bbox.copy(this.getBoundingBox()).applyMatrix4(this.mesh.matrixWorld);
	}

	update(t) {
		this.updatePhysics(t);
		this.boxHelper.update();
		this.updateBoundingBox();
		this.updateHook(t);
	}

	updateHook(t) {}
}

export default GridEntity;

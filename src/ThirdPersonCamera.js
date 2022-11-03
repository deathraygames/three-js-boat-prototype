// Based on https://www.youtube.com/watch?v=UuNPHOJ_V5o
import { Quaternion, Vector3 } from 'three';

class ThirdPersonCamera {
	constructor({ camera, target } = {}) {
		this.camera = camera;
		this.target = target;
		this.currentPosition = new Vector3();
		this.currentLookAt = new Vector3();
	}

	calculateTargetVec3(vec3) {
		// Method from simon dev + guesses - didn't work
		// const quaternion = new Quaternion();
		// quaternion.setFromAxisAngle(this.target.rotation, Math.PI / 2 );
		// vec3.applyQuaternion(quaternion);

		// Method using rotations - https://stackoverflow.com/a/10747728/1766230
		const axis = new Vector3(0, 1, 0);
		vec3.applyAxisAngle(axis, this.target.rotation.y)

		// Center on the target's position
		vec3.add(this.target.position);
		return vec3;	
	}

	calculateIdealOffset(mouseWheelPercent) { // This should be behind the "person's" back or head, possibly offset
		const offset = new Vector3(
			-50, // off to the side a little bit
			150 + (120 * mouseWheelPercent), // above
			-300 + (-250 * mouseWheelPercent), // behind
		);
		return this.calculateTargetVec3(offset);
	}

	calculateIdealLookAt() { // Should be ahead of the "person" - where they would naturally be looking
		const lookAt = new Vector3(0, 0, 200);
		return this.calculateTargetVec3(lookAt);
	}

	update(t, mouseWheelPercent) {
		const idealOffset = this.calculateIdealOffset(mouseWheelPercent);
		const idealLookAt = this.calculateIdealLookAt(mouseWheelPercent);
		// console.log(mouseWheelPercent);

		// const q = 0.05;
		// This is from simon dev but needs some tweaking
		const q = 1.0 - Math.pow(0.24, t);
		// console.log(q, t);

		this.currentPosition.lerp(idealOffset, q);
		this.currentLookAt.lerp(idealLookAt, q);

		this.camera.position.copy(this.currentPosition);
		this.camera.lookAt(this.currentLookAt);
	}
}

export default ThirdPersonCamera;

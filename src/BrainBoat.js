import Boat from './Boat.js';

class BrainBoat extends Boat {
	constructor(options = {}) {
		super(options);
		this.isBrainOn = true;
	}

	thinkAction() {

	}

	update(t, now) {
		super.update(t, now);
		this.thinkAction(t);
	}
}

export default BrainBoat;

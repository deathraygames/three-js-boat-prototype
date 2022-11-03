import clamp from './clamp.js';

const WHEEL_PX = 25;
const WHEEL_EVENT = 'wheel';

class MouseWheelWatcher {
	constructor({ y = 0, watch = true, min = -1000, max = 1000 } = {}) {
		this.y = y;
		this.min = min;
		this.max = max;
		this.lastMouseWheelDeltaY = 0;
		this.listener = () => {};
		if (watch) this.watch();
	}

	get mouseWheel() {
		return this.lastMouseWheelDeltaY;
	}

	set mouseWheel(n) {
		this.lastMouseWheelDeltaY = n;
		this.y = clamp(this.y + n, this.min, this.max);
	}

	get percent() { return this.getPercent(); }
	set percent(n) { throw new Error('cannot set percent'); }

	getPercent() {
		const d = (this.y > 0) ? this.max : this.min * -1;
		return (d === 0) ? 0 : this.y / d;
	}

	watch() {
		const listener = (e) => {
			if (e.ctrlKey) return;
			this.mouseWheel = e.deltaY / WHEEL_PX;
		};
		this.listener = listener;
		window.addEventListener(WHEEL_EVENT, listener);
	}

	unwatch() {
		window.removeEventListener(WHEEL_EVENT, this.listener);
	}

	clear() {
		this.mouseWheel = 0;
	}

	update() {
		this.clear();
	}
}

export default MouseWheelWatcher;

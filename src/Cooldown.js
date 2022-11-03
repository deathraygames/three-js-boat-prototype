class Cooldown {
	constructor(timeLeft = 0, usualHeatTime) {
		this.lastTime = this.setTime(); // in milliseconds
		this.timeLeft = timeLeft; // in seconds
		this.timeLeftSet = timeLeft;
		this.usualHeatTime = usualHeatTime || timeLeft; // in seconds
	}

	static getTime() {
		return Date.now();
	}

	setTime() {
		this.lastTime = Cooldown.getTime();
		return this.lastTime;
	}

	isHot() {
		this.cool();
		return (this.timeLeft > 0);
	}

	getTimePassed() { // in seconds
		return (Cooldown.getTime() - this.lastTime) / 1000;
	}

	// getTotalTimePassed() { // in seconds
	// 	return (Cooldown.getTime() - this.timeLeftSet) / 1000;
	// }

	/** Get percentage elapsed based on time it was set to, returns 0 if not set */
	getPercent() {
		const isHot = this.isHot();
		return isHot ? percent(this.time - time, this.setTime, 0) : 0; }

	/** Heat to a # of seconds */
	heat(heatUpTime = this.usualHeatTime) {
		this.timeLeft = heatUpTime;
		if (this.timeLeft > this.usualHeatTime) this.timeLeft = this.usualHeatTime;
		this.timeLeftSet = this.timeLeft;
		this.setTime();
	}

	/** Heat by a # of seconds */
	heatBy(t = 0) {
		this.cool();
		this.heat(this.timeLeft + t);
	}

	/* Cool by a # of seconds */
	cool(t) {
		const coolTime = (t === undefined) ? this.getTimePassed() : t;
		// console.log('cool by', coolTime);
		this.timeLeft -= coolTime;
		if (this.timeLeft < 0) this.timeLeft = 0;
		this.setTime();
	}
}

export default Cooldown;

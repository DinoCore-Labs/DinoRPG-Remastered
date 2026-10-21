import { MT_STAGE } from './types.js';
/** Real time -> bounded, deterministic simulation steps (fixed 25 FPS). */
export class CombatClock {
	advance;
	accumulator = 0;
	duration = 1000 / MT_STAGE.framesPerSecond;
	maxStepsPerTick = 5;
	constructor(advance) {
		this.advance = advance;
	}
	step(deltaMs, multiplier = 1) {
		if (!Number.isFinite(deltaMs) || deltaMs <= 0 || multiplier <= 0) return 0;
		this.accumulator += Math.min(deltaMs, 250) * multiplier;
		let count = 0;
		while (this.accumulator >= this.duration && count < this.maxStepsPerTick) {
			this.accumulator -= this.duration;
			this.advance();
			count++;
		}
		// Deliberately drop excess rendering lag instead of playing hundreds of frames at once.
		if (count === this.maxStepsPerTick) this.accumulator = Math.min(this.accumulator, this.duration);
		return count;
	}
	reset() {
		this.accumulator = 0;
	}
}

import { actionName, identifier, MT_STAGE, numeric } from './types.js';

const record = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
const duration = (value, fallback) => Math.max(1, Math.ceil(numeric(value, fallback)));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (from, to, t) => from + (to - from) * t;
const ease = t => 1 - (1 - t) ** 3;
/**
 * A standalone rendering timeline: consumes the *result* of an already resolved combat.
 * Never calculates combat outcome, hit chances or skill mechanics.
 *
 * Reference behaviour: Motion Twin WebGamesArchives/DinoRPG/gfx/fight/src/
 * (Main.hx, Scene.hx, ac/*). Algorithms here are independently written.
 */
export class CombatTimeline {
	fighters = new Map();
	history;
	data;
	events = [];
	frame = 0;
	cursor = 0;
	finished = false;
	paused = false;
	active = null;
	listener;
	previousPositions = new Map();
	constructor(data, onEvent) {
		this.data = data;
		this.listener = onEvent;
		if (!Array.isArray(data.history)) throw new Error('Combat history must be an array');
		this.history = data.history.map((entry, i) => {
			const name = actionName(entry.action);
			if (!name) throw new Error(`Invalid combat action at index ${i}: ${String(entry.action)}`);
			return { ...entry, action: name };
		});
	}
	emit(event) {
		this.events.push(event);
		this.listener?.(event);
	}
	get snapshot() {
		return {
			frame: this.frame,
			cursor: this.cursor,
			finished: this.finished,
			paused: this.paused,
			fighters: Array.from(this.fighters.values(), f => ({
				fid: f.fid,
				x: f.x,
				y: f.y,
				hp: f.hp,
				pose: f.pose,
				dead: f.dead
			})).sort((a, b) => a.fid - b.fid)
		};
	}
	play() {
		this.paused = false;
	}
	pause() {
		this.paused = true;
	}
	/** One 25 Hz simulation step, independent of monitor refresh rate. */
	tick() {
		if (this.paused || this.finished) return;
		this.frame++;
		if (this.active) {
			this.advanceTransition();
			return;
		}
		// Process instantaneous events together, but cap to guard against malformed histories.
		for (let count = 0; count < 128 && !this.active && !this.finished; count++) {
			const index = this.cursor;
			const entry = this.history[index];
			if (!entry) {
				this.complete();
				break;
			}
			this.cursor++;
			this.emit({ type: 'actionStart', index, action: entry.action });
			this.apply(entry, index);
			if (!this.active) this.emit({ type: 'actionEnd', index, action: entry.action });
		}
	}
	/** Useful for offline tests, replay and frame-accurate captures. */
	runFrames(count) {
		if (!Number.isInteger(count) || count < 0 || count > 500_000) throw new RangeError('Invalid frame count');
		for (let i = 0; i < count; i++) this.tick();
	}
	complete() {
		if (this.finished) return;
		this.finished = true;
		this.emit({ type: 'finish' });
	}
	transition(transition) {
		this.active = { ...transition, duration: duration(transition.duration, 1), age: 0 };
	}
	advanceTransition() {
		const t = this.active;
		if (!t) return;
		t.age++;
		t.onProgress?.(ease(Math.min(1, t.age / t.duration)));
		if (!t.impacted && t.impactFrame !== undefined && t.age >= t.impactFrame) {
			t.impacted = true;
			t.onImpact?.();
		}
		if (t.age >= t.duration) {
			t.onEnd?.();
			this.active = null;
			this.emit({ type: 'actionEnd', index: t.index, action: t.action });
		}
	}
	fighter(value, action) {
		const id = identifier(value);
		const actor = id === null ? undefined : this.fighters.get(id);
		if (!actor) throw new Error(`${action}: unknown fighter ${String(value)}`);
		return actor;
	}
	add(info) {
		if (!Number.isSafeInteger(info.fid) || this.fighters.has(info.fid))
			throw new Error(`Add: invalid or duplicate fighter id ${String(info.fid)}`);
		const sameSide = [...this.fighters.values()].filter(a => a.side === info.side).length;
		const yMin = clamp(numeric(this.data.top, 50), 0, MT_STAGE.battlefieldHeight - 30);
		const yMax = Math.max(yMin, MT_STAGE.battlefieldHeight - clamp(numeric(this.data.bottom, 20), 0, 240) - 20);
		const home = {
			x: clamp(
				numeric(info.x, info.side ? 110 : 290) + (info.x === undefined ? (sameSide % 3) * (info.side ? -20 : 20) : 0),
				8,
				MT_STAGE.battlefieldWidth - 8
			),
			y: clamp(numeric(info.y, (yMin + yMax) / 2 + ((sameSide % 4) - 1.5) * 30), yMin, yMax)
		};
		const hp = Math.max(0, numeric(info.life, 0));
		const actor = {
			fid: info.fid,
			name: info.name || String(info.fid),
			side: Boolean(info.side),
			dino: Boolean(info.dino),
			gfx: String(info.gfx ?? ''),
			x: home.x,
			y: home.y,
			home,
			hp,
			maxHp: Math.max(hp, numeric(info.maxLife, hp)),
			energy: 100,
			maxEnergy: 100,
			scale: clamp(numeric(info.scale, 1), 0.1, 10),
			facing: info.side ? 1 : -1,
			opacity: 1,
			pose: 'stand',
			dead: hp <= 0,
			statuses: new Set()
		};
		this.fighters.set(actor.fid, actor);
		this.emit({ type: 'add', fid: actor.fid });
		return actor;
	}
	health(actor, delta) {
		const previous = actor.hp;
		actor.hp = clamp(actor.hp + delta, 0, actor.maxHp);
		this.emit({ type: 'health', fid: actor.fid, delta: actor.hp - previous, hp: actor.hp });
	}
	move(actor, target, index, action, frames, returnHome = true) {
		const from = { x: actor.x, y: actor.y };
		const to = {
			x: clamp(target.x, -60, MT_STAGE.battlefieldWidth + 60),
			y: clamp(target.y, 0, MT_STAGE.battlefieldHeight)
		};
		const dist = Math.hypot(to.x - from.x, to.y - from.y);
		const travel = duration(frames, Math.max(5, Math.ceil(dist / 8)));
		actor.pose = 'run';
		if (returnHome) this.previousPositions.set(actor.fid, from);
		this.transition({
			action,
			index,
			duration: travel,
			onProgress: p => {
				actor.x = lerp(from.x, to.x, p);
				actor.y = lerp(from.y, to.y, p);
			},
			onEnd: () => {
				actor.x = to.x;
				actor.y = to.y;
				actor.pose = 'stand';
			}
		});
	}
	attack(entry, index) {
		const attacker = this.fighter(entry.fid, entry.action);
		const target = this.fighter(entry.tid, entry.action);
		const dist = Math.hypot(attacker.x - target.x, attacker.y - target.y);
		const from = { x: attacker.x, y: attacker.y };
		const reach = (36 * (attacker.scale + target.scale)) / 2;
		const toward = attacker.x <= target.x ? 1 : -1;
		const dest = { x: target.x - toward * reach, y: target.y };
		const approachFrames = dist > reach ? Math.max(1, Math.ceil((dist - reach) / 8)) : 0;
		const windup = 7;
		const impactFrame = approachFrames + windup;
		const total = impactFrame + 9;
		attacker.pose = approachFrames > 0 ? 'run' : 'attack';
		this.transition({
			action: entry.action,
			index,
			duration: total,
			impactFrame,
			onProgress: () => {
				const t = this.active;
				if (!t) return;
				if (t.age <= approachFrames && approachFrames > 0) {
					const p = ease(t.age / approachFrames);
					attacker.x = lerp(from.x, dest.x, p);
					attacker.y = lerp(from.y, dest.y, p);
					attacker.pose = 'run';
				} else {
					attacker.pose = 'attack';
				}
			},
			onImpact: () => {
				const damage = entry.damages;
				this.emit({
					type: 'effect',
					name: damage === null ? 'miss' : 'impact',
					fid: attacker.fid,
					targetIds: [target.fid]
				});
				if (typeof damage === 'number' && Number.isFinite(damage)) this.health(target, -Math.max(0, damage));
				target.pose = damage === null ? 'stand' : 'hit';
			},
			onEnd: () => {
				attacker.pose = 'stand';
				if (!target.dead) target.pose = 'stand';
			}
		});
	}
	apply(a, index) {
		switch (a.action) {
			case 'Add': {
				const f = this.add(a.fighter);
				const entrance = a.fighter ? record(a.fighter).entrance : undefined;
				if (entrance === 2 || entrance === 'Run' || entrance === 1 || entrance === 'Jump') {
					const home = { ...f.home };
					f.x = f.side ? -30 : MT_STAGE.battlefieldWidth + 30;
					this.move(f, home, index, a.action, 24, false);
				}
				return;
			}
			case 'Display':
				return;
			case 'Energy':
			case 'MaxEnergy': {
				for (const row of Array.isArray(a.fighters) ? a.fighters : []) {
					const item = record(row);
					const f = this.fighter(item.fid, a.action);
					if (a.action === 'Energy') f.energy = clamp(numeric(item.energy, f.energy), 0, f.maxEnergy);
					else {
						f.maxEnergy = Math.max(1, numeric(item.energy, f.maxEnergy));
						f.energy = Math.min(f.energy, f.maxEnergy);
					}
					this.emit({ type: 'energy', fid: f.fid, energy: f.energy, maxEnergy: f.maxEnergy });
				}
				return;
			}
			case 'Lost':
			case 'Regen': {
				const f = this.fighter(a.fid, a.action);
				this.health(f, (a.action === 'Regen' ? 1 : -1) * Math.abs(numeric(a.amount)));
				this.emit({ type: 'effect', name: a.action === 'Regen' ? 'heal' : 'lost', fid: f.fid });
				return;
			}
			case 'Status':
			case 'NoStatus': {
				const f = this.fighter(a.fid, a.action);
				const status = numeric(a.status, -1);
				if (a.action === 'Status') f.statuses.add(status);
				else f.statuses.delete(status);
				this.emit({ type: 'status', fid: f.fid, status, enabled: a.action === 'Status' });
				return;
			}
			case 'Goto': {
				const f = this.fighter(a.fid, a.action);
				const target = this.fighter(a.tid, a.action);
				const facing = f.x <= target.x ? 1 : -1;
				f.facing = facing;
				this.move(f, { x: target.x - facing * (30 * f.scale + 12 * target.scale), y: target.y }, index, a.action);
				return;
			}
			case 'Return': {
				const f = this.fighter(a.fid, a.action);
				this.move(f, this.previousPositions.get(f.fid) ?? f.home, index, a.action, undefined, false);
				return;
			}
			case 'MoveTo': {
				const f = this.fighter(a.fid, a.action);
				this.move(f, { x: numeric(a.x, f.x), y: numeric(a.y, f.y) }, index, a.action);
				return;
			}
			case 'Damages':
				this.attack(a, index);
				return;
			case 'Dead': {
				const f = this.fighter(a.fid, a.action);
				f.dead = true;
				f.pose = 'dead';
				f.hp = 0;
				this.emit({ type: 'effect', name: 'death', fid: f.fid });
				this.transition({
					action: a.action,
					index,
					duration: 12,
					onProgress: p => {
						f.opacity = 1 - 0.65 * p;
					}
				});
				return;
			}
			case 'Announce':
			case 'Talk':
			case 'Text': {
				const message = typeof a.message === 'string' ? a.message : '';
				const id = identifier(a.fid);
				this.emit({ type: 'message', message, ...(id === null ? {} : { fid: id }) });
				this.transition({ action: a.action, index, duration: duration(a.time, Math.max(30, message.length * 2)) });
				return;
			}
			case 'Object':
				this.emit({ type: 'effect', name: `item:${String(a.item ?? '')}`, fid: numeric(a.fid) });
				return;
			case 'Skill': {
				const details = record(a.details);
				const f = identifier(details.fid);
				if (f !== null) this.fighter(f, a.action).pose = 'cast';
				const targets = Array.isArray(details.targets)
					? details.targets.map(t => identifier(record(t).id)).filter(n => n !== null)
					: [];
				this.emit({
					type: 'effect',
					name: `skill:${String(a.skill ?? 'unknown')}`,
					...(f === null ? {} : { fid: f }),
					targetIds: targets
				});
				this.transition({
					action: a.action,
					index,
					duration: 22,
					onEnd: () => {
						if (f !== null) this.fighter(f, a.action).pose = 'stand';
					}
				});
				// Skill particle/special animations will be expanded in subsequent milestones.
				this.emit({
					type: 'unsupported',
					index,
					action: a.action,
					reason: 'Specific skill animation not implemented yet'
				});
				return;
			}
			case 'Pause':
				this.transition({ action: a.action, index, duration: duration(a.time, 1) });
				return;
			case 'Wait':
				this.transition({ action: a.action, index, duration: duration(numeric(a.time, 0) / 40, 1) });
				return;
			case 'Flip': {
				const f = this.fighter(a.fid, a.action);
				f.facing = f.facing === 1 ? -1 : 1;
				return;
			}
			case 'Escape': {
				const f = this.fighter(a.fid, a.action);
				this.move(f, { x: f.side ? -50 : MT_STAGE.battlefieldWidth + 50, y: f.y }, index, a.action, 20);
				return;
			}
			case 'Finish': {
				this.transition({ action: a.action, index, duration: 24, onEnd: () => this.complete() });
				return;
			}
			case 'Notify':
				this.emit({ type: 'effect', name: `notification:${String(a.notification ?? '')}` });
				return;
			case 'Emote':
				this.emit({ type: 'effect', name: `emote:${String(a.emote ?? '')}` });
				return;
			case 'Shake':
				this.emit({ type: 'effect', name: 'shake' });
				return;
			case 'Log':
				return;
			default:
				this.emit({ type: 'unsupported', index, action: a.action, reason: 'Action requires a dedicated renderer' });
				return;
		}
	}
}

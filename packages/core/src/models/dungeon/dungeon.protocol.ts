import type { DungeonCommand } from './dungeon.types.js';

export interface MtOriginalDungeonCommand {
	_x: number;
	_y: number;
	_l: number;
	_dx: number;
	_dy: number;
	_dl: number;
}

export function toMtOriginalCommand(command: DungeonCommand): MtOriginalDungeonCommand {
	return {
		_x: command.x,
		_y: command.y,
		_l: command.l,
		_dx: command.dx,
		_dy: command.dy,
		_dl: command.dl
	};
}

export function fromMtOriginalCommand(value: unknown): DungeonCommand {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new TypeError('Original MT dungeon command must be an object.');
	const v = value as Record<string, unknown>;
	const names = ['_x', '_y', '_l', '_dx', '_dy', '_dl'];
	if (Object.keys(v).length !== names.length || names.some(k => !Number.isSafeInteger(v[k])))
		throw new TypeError('Original MT command must contain exactly six integer fields.');
	const [_x, _y, _l, _dx, _dy, _dl] = names.map(k => v[k] as number);
	return { x: _x!, y: _y!, l: _l!, dx: _dx!, dy: _dy!, dl: _dl! };
}

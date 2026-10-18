/** Constructor order of MT DungeonItem; do not reorder (the codec writes its ordinal). */
export const DUNGEON_ITEM_KIND = {
	IKey: 0,
	IGold: 1,
	IHeal: 2,
	IScenario: 3
} as const;

export type DungeonItemKind = keyof typeof DUNGEON_ITEM_KIND;

export interface DungeonPoint {
	x: number;
	y: number;
	l: number;
}

export interface DungeonDoor {
	x: number;
	y: number;
	/** null means a horizontal/vertical door or guardian; otherwise stairs. */
	up: boolean | null;
	/** null for unlocked doors, monster positions and stairs. */
	key: number | null;
}

export interface DungeonItem {
	x: number;
	y: number;
	kind: DungeonItemKind;
	value: number;
}

export interface DungeonRoom {
	id: number;
	x: number;
	y: number;
	w: number;
	h: number;
	doors: DungeonDoor[];
	item: DungeonItem | null;
}

export interface DungeonLevel {
	/** MT column-major table: table[x][y] */
	table: boolean[][];
	rooms: DungeonRoom[];
}

export interface DungeonStructure {
	width: number;
	height: number;
	levels: DungeonLevel[];
	start: DungeonPoint;
	exit: DungeonPoint;
}

/** `_DIcon` from DungeonData.hx, as a discriminated TS union. */
export type DungeonIcon =
	| { kind: 'DINothing' }
	| { kind: 'DIBlock' }
	| { kind: 'DIIcon'; icon: string }
	| { kind: 'DIMonster'; monster: string };

export interface DungeonGroupMember {
	/** Original `_n`: Dinoz name. */
	name: string;
	/** Original `_g`: Dinoz graphical encoding. */
	gfx: string;
}

/** Normalized equivalent of original server-to-Flash DungeonData. */
export interface DungeonClientData {
	encoded: string;
	position: DungeonPoint;
	levelDelta: number;
	directionRight: boolean;
	sDinoUrl: string;
	sMonsterUrl: string;
	/** Indexed by the exact flag formula of MT View.hx. */
	flags: number[];
	keys: boolean[];
	group: DungeonGroupMember[];
	monsters: string[];
	url: string | null;
	locked: boolean;
	skin: string;
	scenarioIcons: DungeonIcon[];
	tower: boolean;
	text: string | null;
	levelLabel: string;
	/** Original `_fog` is raw bytes, not a 2D boolean array. */
	fog: Uint8Array | null;
}

/** `_x,_y,_l,_dx,_dy,_dl` from MT DungeonCommand. */
export interface DungeonCommand {
	x: number;
	y: number;
	l: number;
	dx: number;
	dy: number;
	dl: number;
}

/** Normalized `_DResponse`: DOk, DUrl(url), DMessage(text, icon?, url?). */
export type DungeonResponse =
	| { kind: 'DOk' }
	| { kind: 'DUrl'; url: string }
	| { kind: 'DMessage'; text: string; icon: string | null; url: string | null };

export const DUNGEON_TILE_SIZE = 40;
export const DUNGEON_VIEW_COLUMNS = 9;
export const DUNGEON_VIEW_ROWS = 9;
export const DUNGEON_GROUND_FRAMES = 30;
export const DUNGEON_WALL_FRAMES = 10;
export const DUNGEON_DEFAULT_SKIN = 'labo';

export type DungeonPerlinType = 'PNormal' | 'PDense' | 'PFew';

export interface DungeonSkin {
	key: string;
	/** Original `w`, Flash timeline label on wall symbols. */
	wall: string;
	/** Original `g`, Flash timeline label on ground symbol. */
	ground: string;
	/** Original `mask`, opacity percentage. */
	mask: number;
	/** Original `fog` integer RGB color. */
	fog: number;
	perlin: DungeonPerlinType;
	/** Exactly two original `over` timeline labels, nullable. */
	over: readonly [string | null, string | null];
}

export const DUNGEON_SKINS = [
	{
		key: 'crypt',
		wall: 'crypt',
		ground: 'crypt',
		mask: 100,
		fog: 0x27191c,
		perlin: 'PNormal',
		over: [null, 'ruinPurple']
	},
	{
		key: 'crypt2',
		wall: 'crypt',
		ground: 'sewer',
		mask: 100,
		fog: 0x27191c,
		perlin: 'PDense',
		over: ['ruinPurple', 'square']
	},
	{
		key: 'cavern',
		wall: 'cavern',
		ground: 'cavern',
		mask: 100,
		fog: 0x392429,
		perlin: 'PNormal',
		over: ['ruin', 'grass']
	},
	{
		key: 'cavern2',
		wall: 'cavern',
		ground: 'hell',
		mask: 70,
		fog: 0x27191c,
		perlin: 'PNormal',
		over: ['dirt', 'grass']
	},
	{
		key: 'cavern3',
		wall: 'cavern',
		ground: 'desert',
		mask: 70,
		fog: 0x27191c,
		perlin: 'PDense',
		over: ['ruinPurple', 'dirt']
	},
	{ key: 'desert', wall: 'cavern', ground: 'desert', mask: 50, fog: 0x3d3325, perlin: 'PFew', over: ['dirt', 'grass'] },
	{ key: 'sewer', wall: 'sewer', ground: 'sewer', mask: 70, fog: 0x37321e, perlin: 'PFew', over: ['creep', 'dirt'] },
	{ key: 'sewer2', wall: 'sewer', ground: 'sewer', mask: 100, fog: 0x37321e, perlin: 'PFew', over: [null, 'creep'] },
	{ key: 'sewer3', wall: 'sewer', ground: 'cavern', mask: 100, fog: 0x37321e, perlin: 'PFew', over: [null, 'creep'] },
	{ key: 'mine', wall: 'mine', ground: 'desert', mask: 60, fog: 0x352c20, perlin: 'PDense', over: ['dirt', null] },
	{
		key: 'mine2',
		wall: 'mine',
		ground: 'cavern',
		mask: 100,
		fog: 0x352c20,
		perlin: 'PNormal',
		over: ['dirt', 'grassDark']
	},
	{
		key: 'ruin',
		wall: 'ruin',
		ground: 'cavern',
		mask: 100,
		fog: 0x252730,
		perlin: 'PNormal',
		over: ['square', 'grass']
	},
	{ key: 'ruin2', wall: 'ruin', ground: 'sewer', mask: 100, fog: 0x27191c, perlin: 'PNormal', over: [null, 'ruin'] },
	{ key: 'ruin3', wall: 'ruin', ground: 'grass', mask: 60, fog: 0x30371e, perlin: 'PNormal', over: ['ruin', 'grass'] },
	{
		key: 'ruin4',
		wall: 'ruin',
		ground: 'hell',
		mask: 100,
		fog: 0x27191c,
		perlin: 'PDense',
		over: ['ruinPurple', 'square']
	},
	{ key: 'hell', wall: 'hell', ground: 'hell', mask: 100, fog: 0x330d0d, perlin: 'PNormal', over: ['ruin', 'creep'] },
	{ key: 'hell2', wall: 'hell', ground: 'cavern', mask: 100, fog: 0x330d0d, perlin: 'PDense', over: ['creep', 'ruin'] },
	{
		key: 'forest',
		wall: 'forest',
		ground: 'grass',
		mask: 0,
		fog: 0x30371e,
		perlin: 'PDense',
		over: ['dirt', 'grassDark']
	},
	{
		key: 'forest2',
		wall: 'forest',
		ground: 'cavern',
		mask: 30,
		fog: 0x30371e,
		perlin: 'PFew',
		over: ['ruinPurple', 'grassDark']
	},
	{
		key: 'forest3',
		wall: 'forest',
		ground: 'grass',
		mask: 60,
		fog: 0x30371e,
		perlin: 'PNormal',
		over: ['grassDark', 'grass']
	},
	{
		key: 'forest4',
		wall: 'forest',
		ground: 'cavern',
		mask: 100,
		fog: 0x2e2431,
		perlin: 'PNormal',
		over: ['ruinPurple', 'grassDark']
	},
	{ key: 'oasis', wall: 'forest', ground: 'desert', mask: 30, fog: 0x433023, perlin: 'PNormal', over: [null, 'dirt'] },
	{ key: 'oasis2', wall: 'forest', ground: 'desert', mask: 30, fog: 0x433023, perlin: 'PDense', over: [null, 'grass'] },
	{
		key: 'cave',
		wall: 'cavern',
		ground: 'grass',
		mask: 100,
		fog: 0x222615,
		perlin: 'PDense',
		over: ['grassDark', 'grass']
	},
	{
		key: 'hell_oasis',
		wall: 'hell',
		ground: 'desert',
		mask: 0,
		fog: 0x330d0d,
		perlin: 'PNormal',
		over: ['dirt', 'grass']
	},
	{ key: 'pyramid', wall: 'egypt', ground: 'desert', mask: 60, fog: 0x433023, perlin: 'PNormal', over: ['dirt', null] },
	{
		key: 'pyramid2',
		wall: 'egypt',
		ground: 'hell',
		mask: 60,
		fog: 0x433023,
		perlin: 'PNormal',
		over: ['ruinPurple', null]
	},
	{
		key: 'tomb',
		wall: 'egypt',
		ground: 'crypt',
		mask: 100,
		fog: 0x433023,
		perlin: 'PFew',
		over: ['ruinPurple', 'square']
	},
	{ key: 'tomb2', wall: 'ruin', ground: 'desert', mask: 100, fog: 0x3d3325, perlin: 'PDense', over: [null, 'square'] },
	{
		key: 'tomb3',
		wall: 'ruin',
		ground: 'crypt',
		mask: 100,
		fog: 0x330d0d,
		perlin: 'PDense',
		over: [null, 'ruinPurple']
	},
	{ key: 'cuzco', wall: 'forest', ground: 'sewer', mask: 20, fog: 0x30371e, perlin: 'PDense', over: ['ruin', null] },
	{ key: 'labo', wall: 'labo', ground: 'labo', mask: 100, fog: 0x0d1127, perlin: 'PDense', over: [null, 'grassLabo'] }
] as const satisfies readonly DungeonSkin[];

/** Deliberately returns null for unknown skins; MT default is only for debug data. */
export function getDungeonSkin(key: string): DungeonSkin | null {
	return DUNGEON_SKINS.find(skin => skin.key === key) ?? null;
}

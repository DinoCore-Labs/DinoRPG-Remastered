export const CEF_PROGRAM_KEYS = ['easy', 'intermediate', 'advanced'] as const;

export type CefProgramKey = (typeof CEF_PROGRAM_KEYS)[number];

export type CefProgram = {
	key: CefProgramKey;
	nameKey: string;
	descriptionKey: string;
	monsterCount: number;
	minLevelOffset: number;
	maxLevelOffset: number;
	goldCost: number;
	xpMultiplier: number;
};

/**
 * Les valeurs peuvent être ajustées ici sans toucher au backend ou au frontend.
 *
 * easy:
 * - programme de base
 * - coût faible
 * - XP normale
 *
 * intermediate / advanced:
 * - coût en or plus élevé
 * - XP valorisée
 */
export const CEF_PROGRAMS = {
	easy: {
		key: 'easy',
		nameKey: 'cef.program.easy.name',
		descriptionKey: 'cef.program.easy.description',
		monsterCount: 2,
		minLevelOffset: -1,
		maxLevelOffset: 0,
		goldCost: 500,
		xpMultiplier: 1
	},
	intermediate: {
		key: 'intermediate',
		nameKey: 'cef.program.intermediate.name',
		descriptionKey: 'cef.program.intermediate.description',
		monsterCount: 3,
		minLevelOffset: 0,
		maxLevelOffset: 1,
		goldCost: 650,
		xpMultiplier: 1.35
	},
	advanced: {
		key: 'advanced',
		nameKey: 'cef.program.advanced.name',
		descriptionKey: 'cef.program.advanced.description',
		monsterCount: 5,
		minLevelOffset: 1,
		maxLevelOffset: 3,
		goldCost: 800,
		xpMultiplier: 1.75
	}
} as const satisfies Record<CefProgramKey, CefProgram>;

export const cefProgramList = Object.values(CEF_PROGRAMS);

export function isCefProgramKey(value: unknown): value is CefProgramKey {
	return typeof value === 'string' && CEF_PROGRAM_KEYS.includes(value as CefProgramKey);
}

export function getCefProgram(value: string): CefProgram {
	if (!isCefProgramKey(value)) {
		throw new Error(`Unknown CEF program "${value}"`);
	}

	return CEF_PROGRAMS[value];
}

import { DayKey } from '../enums/DayType.js';

export type CompareMode = 'eq' | 'gte' | 'lte';

export type MissionConditionStatus = { type: 'done' } | { type: 'current'; step?: number };

export type RandomBasis = 'day' | 'hour' | 'dialog' | 'dino' | 'user';

export type Condition =
	| { type: 'true' }
	| { type: 'false' }
	| { type: 'not'; condition: Condition }
	| { type: 'or'; left: Condition; right: Condition }
	| { type: 'and'; left: Condition; right: Condition }
	| { type: 'date'; value: string; compare: CompareMode }
	| { type: 'day'; key: DayKey }
	| { type: 'caushrock'; direction: number }
	| { type: 'level'; value: number }
	| { type: 'effect'; key: string }
	| { type: 'collection'; key: string }
	| { type: 'time'; value: number; user: boolean }
	| { type: 'mission'; key: string; status: MissionConditionStatus }
	| { type: 'skill'; key: string }
	| { type: 'canfight'; key: string }
	| { type: 'position'; key: string }
	| { type: 'hasobject'; key: string }
	| { type: 'hasingredient'; key: string; qty: number; compare: CompareMode }
	| { type: 'random'; max: number; target: number; seeded: boolean; basis?: RandomBasis; compare: CompareMode }
	| { type: 'admin' }
	| { type: 'scenario'; key: string; phase: number; compare: CompareMode }
	| { type: 'uvar'; key: string; value: number; compare: CompareMode }
	| { type: 'gvar'; key: string; value: number; compare: CompareMode }
	| { type: 'life'; value: number; compare: CompareMode }
	| { type: 'dinoz'; value: number }
	| { type: 'race'; key: string }
	| { type: 'equip'; key: string }
	| { type: 'hour'; value: number; compare: CompareMode }
	| { type: 'swait'; key: string; hours: number }
	| { type: 'dungeon'; key: string }
	| { type: 'active'; key: string }
	| { type: 'clanact'; key: string }
	| { type: 'status'; value: number }
	| { type: 'friend'; key?: string }
	| { type: 'event'; key: string }
	| { type: 'promo'; key: string }
	| { type: 'war'; key: string }
	| { type: 'config'; key: string }
	| { type: 'tag'; key: string }
	| { type: 'tab'; key: string };

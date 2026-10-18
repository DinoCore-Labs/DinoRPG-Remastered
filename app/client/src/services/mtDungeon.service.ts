import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonCommand, DungeonPoint } from '@dinorpg/core/models/dungeon/dungeon.types.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';

import { api } from '../utils/http';

export interface MtDungeonCurrentView {
	mapId: string;
	revision: number;
	position: DungeonPoint;
	skin: string;
	stage: number;
	scene: MtDungeonScene;
	limitations: readonly string[];
}

export interface MtDungeonEncounter {
	kind: string;
	status: string;
	text?: string | null;
	messageIcon?: string | null;
	languageUsed?: string;
}

export const MtDungeonService = {
	getSession(id: number): Promise<MtDungeonSession> {
		return api.get(`/dungeon/mt/${id}`, { silent: true });
	},
	getView(id: number): Promise<MtDungeonCurrentView> {
		return api.get(`/dungeon/mt/${id}/view`, { silent: true });
	},
	startMagneticCaverns(id: number): Promise<MtDungeonSession> {
		return api.post('/dungeon/mt/start', { leaderDinozId: id, dungeonId: 'stepp' });
	},
	move(
		id: number,
		revision: number,
		command: DungeonCommand
	): Promise<{
		ok: boolean;
		session: MtDungeonSession;
		pending: MtDungeonSession['pending'];
		accepted?: number;
	}> {
		return api.post(`/dungeon/mt/${id}/commands`, { revision, commands: [command] }, { silent: true });
	},
	transition(id: number, revision: number, action: 'forward' | 'backward'): Promise<MtDungeonSession> {
		return api.post(`/dungeon/mt/${id}/transition`, { revision, action });
	},
	getEncounter(id: number, language: string): Promise<{ encounter: MtDungeonEncounter | null }> {
		return api.get(`/dungeon/mt/${id}/encounter`, { params: { lang: language }, silent: true });
	},
	resolveScenario(
		id: number,
		revision: number,
		language: string
	): Promise<{
		session: MtDungeonSession;
		message: string | null;
		reward: { type: string; quantity?: number };
	}> {
		return api.post(`/dungeon/mt/${id}/scenario/resolve`, { revision, lang: language });
	},
	prepareFight(id: number, revision: number): Promise<{ token: string }> {
		return api.post(`/dungeon/mt/${id}/fight/prepare`, { revision });
	},
	resolveFight(id: number, token: string): Promise<FightResult> {
		return api.post(`/dungeon/mt/${id}/fight/resolve`, { token });
	}
};

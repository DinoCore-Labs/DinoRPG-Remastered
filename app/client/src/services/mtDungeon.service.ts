import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonCommand, DungeonPoint } from '@dinorpg/core/models/dungeon/dungeon.types.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';

import { api } from '../utils/http';

export interface MtDungeonGuardianVisual {
	x: number;
	y: number;
	gfx: string;
	source: 'door' | 'scenario';
}

export interface MtDungeonCurrentView {
	mapId: string;
	revision: number;
	position: DungeonPoint;
	skin: string;
	stage: number;
	scene: MtDungeonScene;
	guardianSprites: MtDungeonGuardianVisual[];
	limitations: readonly string[];
}

export interface MtDungeonEncounter {
	kind: string;
	status: string;
	text?: string | null;
	messageIcon?: string | null;
	languageUsed?: string;
}

export interface MtGuardianTrialPreview {
	mapId: string;
	revision: number;
	monsterKey: string;
	experimental: true;
	note: string;
}

export interface MtDungeonDevCapabilities {
	guardianFight?: boolean;
	guardianSkip: boolean;
	surfaceExit: boolean;
}

export const MtDungeonService = {
	getGuardianTrialPreview(id: number): Promise<MtGuardianTrialPreview> {
		return api.get(`/dungeon/mt/${id}/dev/guardian/fight/preview`, { silent: true });
	},
	prepareGuardianTrial(id: number, revision: number): Promise<{ token: string; experimental: true }> {
		return api.post(`/dungeon/mt/${id}/dev/guardian/fight/prepare`, { revision });
	},
	resolveGuardianTrial(id: number, token: string): Promise<FightResult> {
		return api.post(`/dungeon/mt/${id}/dev/guardian/fight/resolve`, { token });
	},
	getDevCapabilities(): Promise<MtDungeonDevCapabilities> {
		return api.get('/dungeon/mt/dev/capabilities', { silent: true });
	},
	devSkipGuardian(id: number, revision: number): Promise<MtDungeonSession> {
		return api.post(`/dungeon/mt/${id}/dev/guardian/skip`, { revision });
	},
	devLeaveToSurface(id: number, revision: number): Promise<{ ok: true }> {
		return api.post(`/dungeon/mt/${id}/dev/surface/exit`, { revision });
	},
	/** Escape a session stranded by a pre-fix total defeat (server verifies all HP). */
	evacuateDefeatedGroup(id: number, revision: number): Promise<{ evacuated: true }> {
		return api.post(`/dungeon/mt/${id}/defeat/evacuate`, { revision });
	},
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
		goldAwarded?: number;
		walletGold?: number;
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

import type {
	MissionAvatarKey,
	MissionBackgroundKey,
	MissionDialectKey,
	MissionFrameKey,
	MissionNpcKey
} from './missionKey.js';

export type MissionInteractionStartResponse =
	| {
			mode: 'modal';
			goalType: 'TALK' | 'ACTION';
			npcKey?: MissionNpcKey;
			nameKey: string;
			textKey: string;
			avatar?: MissionAvatarKey | null;
			frame?: MissionFrameKey | null;
			background?: MissionBackgroundKey | null;
			dialect?: MissionDialectKey | null;
	  }
	| {
			mode: 'dialog';
			goalType: 'TALK';
			npcKey?: MissionNpcKey;
			nameKey: string;
			dialogId: string;
	  }
	| {
			mode: 'fight';
			goalType: 'FIGHT';
			fight: unknown;
	  };

export type MissionInteractionCompleteResponse = {
	ok: true;
};

export type CompleteMissionInteractionInput = {
	userId: string;
	dinozId: number;
	trigger: 'manual' | 'fight_victory';
};

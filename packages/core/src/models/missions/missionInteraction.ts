import type { MissionAvatarKey, MissionDialectKey, MissionKey, MissionNpcKey } from './missionKey.js';
import type { MissionReward } from './missionReward.js';

export type MissionInteractionStartResponse =
	| {
			mode: 'modal';
			goalType: 'TALK' | 'ACTION' | 'VALIDATE';
			npcKey?: MissionNpcKey;
			nameKey: string;
			textKey?: string;
			avatar?: MissionAvatarKey | null;
			dialect?: MissionDialectKey | null;
	  }
	| {
			mode: 'dialog';
			goalType: 'TALK';
			npcKey?: MissionNpcKey;
			npcNameKey: string;
			nameKey: string;
			dialogId: string;
			textKey: string;
			gfx?: string | null;
			dialect?: MissionDialectKey | null;
	  }
	| {
			mode: 'fight';
			goalType: 'FIGHT';
			fight: unknown;
	  };

export type MissionInteractionRewardModal = {
	missionKey: MissionKey;
	missionNameKey: string;
	endKey: string;
	rewards: MissionReward[];
};

export type MissionInteractionCompleteResponse = {
	ok: true;
	completed: boolean;
	rewardModal: MissionInteractionRewardModal | null;
};

export type CompleteMissionInteractionInput = {
	userId: string;
	dinozId: number;
	trigger: 'manual' | 'fight_victory';
};

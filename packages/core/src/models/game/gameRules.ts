export const GAME_RULES_VERSION = '1.0' as const;

export const GAME_RULES_UPDATED_AT = '2026-06-24' as const;

export const GAME_RULES_ACCEPTANCE_REQUIRED_CODE = 'RULES_ACCEPTANCE_REQUIRED' as const;

export interface GameRulesAcceptance {
	currentVersion: string;
	acceptedVersion: string | null;
	acceptedAt: string | null;
	required: boolean;
}

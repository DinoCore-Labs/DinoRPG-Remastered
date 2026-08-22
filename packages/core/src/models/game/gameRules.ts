export const GAME_RULES_VERSION = '1.1' as const;

export const GAME_RULES_UPDATED_AT = '2026-08-22' as const;

export const GAME_RULES_ACCEPTANCE_REQUIRED_CODE = 'RULES_ACCEPTANCE_REQUIRED' as const;

export interface GameRulesAcceptance {
	currentVersion: string;
	acceptedVersion: string | null;
	acceptedAt: string | null;
	required: boolean;
}

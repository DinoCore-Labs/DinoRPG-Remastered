import { appDiscordClient } from '../appDiscordClient.js';

export function logServiceError(scope: string, error: unknown, data?: Record<string, unknown>): void {
	console.error(`[${scope}]`, error);
	appDiscordClient.sendError(error, {
		scope,
		data
	});
}

import { appDiscordClient } from '../appDiscordClient.js';

type SchedulerLogData = Record<string, unknown>;

export function logSchedulerSuccess(scope: string, data: SchedulerLogData = {}): void {
	const message = `✅ Scheduler job succeeded: ${scope}`;
	console.info(message, data);
	void appDiscordClient.sendMessage(message, [data]).catch(error => {
		console.error('[scheduler.discord] Failed to send scheduler success log', error);
	});
}

export function logSchedulerError(scope: string, error: unknown, data: SchedulerLogData = {}): void {
	console.error(`❌ Scheduler job failed: ${scope}`, error, data);
	appDiscordClient.sendError(error, {
		scope,
		data
	});
}

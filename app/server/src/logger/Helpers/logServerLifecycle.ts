import { appDiscordClient } from '../appDiscordClient.js';

type ServerLifecycleData = Record<string, unknown>;

export function logServerStart(data: ServerLifecycleData = {}): void {
	const message = '🟢 DinoRPG server started';

	console.info(message, data);

	void appDiscordClient.sendMessage(message, [data]).catch(error => {
		console.error('[server.discord] Failed to send server start log', error);
	});
}

export async function logServerStop(data: ServerLifecycleData = {}): Promise<void> {
	const message = '🔴 DinoRPG server stopped';

	console.info(message, data);

	try {
		await appDiscordClient.sendMessage(message, [data]);
	} catch (error) {
		console.error('[server.discord] Failed to send server stop log', error);
	}
}

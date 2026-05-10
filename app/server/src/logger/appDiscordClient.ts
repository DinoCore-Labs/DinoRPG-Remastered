import { loadConfig } from '../config/config.js';
import { NetworkDiscordClient, NOOP_DISCORD_CLIENT } from './discordClient.js';

const cfg = loadConfig();

export const appDiscordClient = cfg.discord.logWebhookUrl
	? new NetworkDiscordClient({
			logWebhookUrl: cfg.discord.logWebhookUrl,
			server: cfg.selfUrl,
			environment: cfg.env,
			onError: error => {
				console.error('[discord] Failed to send error log', error);
			}
		})
	: NOOP_DISCORD_CLIENT;

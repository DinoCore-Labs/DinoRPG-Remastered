import { inspect } from 'node:util';

import { AttachmentBuilder, EmbedBuilder, WebhookClient } from 'discord.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

const DEFAULT_TIMEOUT = 5000;

const MAX_EMBED_TITLE_LENGTH = 256;
const MAX_EMBED_DESCRIPTION = 4096;
const MAX_FIELD_VALUE_LENGTH = 1024;
const MAX_CONTENT_LENGTH = 2000;

const ELLIPSIS = '…';

const SEND_MESSAGE_PREFIX = '```\n';
const SEND_MESSAGE_SUFFIX = '\n```';
const SEND_MESSAGE_SUFFIX_TRUNCATED = `\n${ELLIPSIS}\n\`\`\``;

export interface DiscordErrorContext {
	scope?: string;
	errorId?: string;
	req?: FastifyRequest;
	reply?: FastifyReply;
	data?: Record<string, unknown>;
}

export interface DiscordClient {
	sendError(error: unknown, context?: DiscordErrorContext): void;
	sendMessage(message: string, data?: Record<string, unknown>[]): Promise<void>;
}

export const NOOP_DISCORD_CLIENT: DiscordClient = {
	sendError() {
		// Nothing to do
	},

	sendMessage() {
		return Promise.resolve();
	}
};

export interface NetworkDiscordClientOptions {
	logWebhookUrl: string;
	timeout?: number;
	server: URL;
	environment: string;
	onError?: (error: Error) => void;
}

function truncate(value: string, maxLength: number): string {
	if (value.length <= maxLength) {
		return value;
	}

	return value.slice(0, maxLength - ELLIPSIS.length) + ELLIPSIS;
}

function formatEmbedTitle(title: string): string {
	return truncate(title, MAX_EMBED_TITLE_LENGTH);
}

function formatEmbedDescription(text: string): string {
	return truncate(text, MAX_EMBED_DESCRIPTION);
}

function formatFieldValue(value: unknown): string {
	const raw =
		typeof value === 'string'
			? value
			: (JSON.stringify(value, null, 2) ??
				inspect(value, {
					depth: 5,
					colors: false
				}));

	return truncate(`\`\`\`json\n${raw}\n\`\`\``, MAX_FIELD_VALUE_LENGTH);
}

function normalizeError(error: unknown): Error {
	if (error instanceof Error) {
		return error;
	}

	return new Error(
		typeof error === 'string'
			? error
			: inspect(error, {
					depth: 5,
					colors: false
				})
	);
}

function redactSensitiveData(value: unknown): unknown {
	if (!value || typeof value !== 'object') {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(redactSensitiveData);
	}

	const result: Record<string, unknown> = {};

	for (const [key, rawValue] of Object.entries(value)) {
		const normalizedKey = key.toLowerCase();

		if (
			normalizedKey.includes('password') ||
			normalizedKey.includes('token') ||
			normalizedKey.includes('cookie') ||
			normalizedKey.includes('authorization') ||
			normalizedKey.includes('secret')
		) {
			result[key] = '[REDACTED]';
			continue;
		}

		result[key] = redactSensitiveData(rawValue);
	}

	return result;
}

export class NetworkDiscordClient implements DiscordClient {
	readonly #logClient: WebhookClient;
	readonly #server: URL;
	readonly #environment: string;
	readonly #onError: ((error: Error) => void) | null;

	public constructor(options: NetworkDiscordClientOptions) {
		this.#logClient = new WebhookClient(
			{
				url: options.logWebhookUrl
			},
			{
				rest: {
					timeout: options.timeout ?? DEFAULT_TIMEOUT
				}
			}
		);

		this.#server = options.server;
		this.#environment = options.environment;
		this.#onError = options.onError ?? null;
	}

	public sendError(error: unknown, context: DiscordErrorContext = {}): void {
		const normalizedError = normalizeError(error);
		const req = context.req;
		const reply = context.reply;

		const title = context.scope
			? `[${context.scope}] ${normalizedError.message}`
			: req
				? `${req.method} ${req.url}`
				: normalizedError.message;

		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(formatEmbedTitle(title))
			.setAuthor({
				name: `DinoRPG Remastered - ${this.#environment}`,
				iconURL: new URL('/favicon.png', this.#server).toString()
			})
			.setDescription(formatEmbedDescription(`\`\`\`\n${normalizedError.stack ?? normalizedError.message}\n\`\`\``))
			.setTimestamp();

		if (context.errorId) {
			embed.addFields({
				name: 'Error ID',
				value: context.errorId,
				inline: true
			});
		}

		if (req) {
			embed.addFields(
				{
					name: 'Method',
					value: req.method,
					inline: true
				},
				{
					name: 'URL',
					value: truncate(req.url, MAX_FIELD_VALUE_LENGTH),
					inline: true
				}
			);

			const user = req.user as { id?: string; role?: string } | undefined;

			if (user?.id) {
				embed.addFields({
					name: 'User ID',
					value: user.id,
					inline: true
				});
			}

			if (user?.role) {
				embed.addFields({
					name: 'Role',
					value: user.role,
					inline: true
				});
			}

			if (Object.keys(req.params as object).length) {
				embed.addFields({
					name: 'Params',
					value: formatFieldValue(redactSensitiveData(req.params))
				});
			}

			if (Object.keys(req.query as object).length) {
				embed.addFields({
					name: 'Query',
					value: formatFieldValue(redactSensitiveData(req.query))
				});
			}

			if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
				embed.addFields({
					name: 'Body',
					value: formatFieldValue(redactSensitiveData(req.body))
				});
			}
		}

		if (reply) {
			embed.addFields({
				name: 'Status code',
				value: String(reply.statusCode || 500),
				inline: true
			});
		}

		if (context.data && Object.keys(context.data).length) {
			embed.addFields({
				name: 'Data',
				value: formatFieldValue(redactSensitiveData(context.data))
			});
		}

		this.#logClient.send({ embeds: [embed] }).catch(error => {
			this.#handleError(error);
		});
	}

	public async sendMessage(message: string, data: Record<string, unknown>[] = []): Promise<void> {
		let content = SEND_MESSAGE_PREFIX + message + SEND_MESSAGE_SUFFIX;

		if (content.length > MAX_CONTENT_LENGTH) {
			const shortLen = MAX_CONTENT_LENGTH - SEND_MESSAGE_PREFIX.length - SEND_MESSAGE_SUFFIX_TRUNCATED.length;
			const short = message.substring(0, shortLen);

			content = SEND_MESSAGE_PREFIX + short + SEND_MESSAGE_SUFFIX_TRUNCATED;
		}

		const files = data.map((item, index) => {
			return new AttachmentBuilder(Buffer.from(JSON.stringify(redactSensitiveData(item), null, 2)), {
				name: `error-${index}.json`
			});
		});

		await this.#logClient.send({
			content,
			files
		});
	}

	#handleError(error: unknown): void {
		const normalizedError = normalizeError(error);

		if (this.#onError) {
			this.#onError(normalizedError);
			return;
		}

		console.error('[discord] Failed to send log', normalizedError);
	}
}

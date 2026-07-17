import * as dotenv from 'dotenv';

export interface Secrets {
	jwt: string;
	cookie: string;
	deviceCookie: string;
}

export interface DiscordConfig {
	logWebhookUrl: string;
}

export interface Config {
	readonly env: 'development' | 'production' | 'test';
	readonly isProduction: boolean;
	readonly port: number;
	readonly apiUrl: URL;
	readonly selfUrl: URL;
	readonly databaseUrl: string;
	readonly salt: string;
	readonly secrets: Secrets;
	readonly discord: DiscordConfig;
}

const MIN_SECRET_LENGTH = 32;

/* -----------------------------------------------------
 * Helpers
 * ---------------------------------------------------*/

export function readPort(envValue: string | undefined, defaultPort: number): number {
	if (envValue) {
		const num = Number(envValue);
		if (!Number.isNaN(num)) return num;
	}
	return defaultPort;
}

export function readUrl(envValue: string | undefined, defaultValue: string): URL {
	try {
		if (envValue) return new URL(envValue);
	} catch {}
	return new URL(defaultValue);
}

export function readBoolean(envValue: string | undefined): boolean {
	if (!envValue) return false;
	try {
		return JSON.parse(envValue);
	} catch {
		return false;
	}
}

export function requireSecret(
	name: string,
	value: string | undefined,
	isProduction: boolean,
	developmentFallback: string
): string {
	if (!isProduction) {
		return value ?? developmentFallback;
	}
	if (!value || value.trim().length < MIN_SECRET_LENGTH) {
		throw new Error(
			`[config] ${name} manquant ou trop court en production ` + `(minimum ${MIN_SECRET_LENGTH} caractères)`
		);
	}
	return value;
}

/* -----------------------------------------------------
 * Main config builder
 * ---------------------------------------------------*/

export function config(env: Record<string, string | undefined>): Config {
	dotenv.config();

	const environment = (env.NODE_ENV as 'development' | 'production' | 'test') ?? 'development';
	const isProduction = env.NODE_ENV === 'production';

	const port = readPort(env.PORT, 8081);

	const apiUrl = readUrl(env.API_URL, 'http://localhost:8081/');
	const selfUrl = readUrl(env.SELF_URL, 'http://localhost:8080/');

	const databaseUrl = env.DATABASE_URL ?? '';

	// Internal keys
	const salt = requireSecret('SALT', env.SALT, isProduction, 'dev_salt');

	const secrets: Secrets = {
		jwt: requireSecret('DINORPG_SECRET_KEY_JWT', env.DINORPG_SECRET_KEY_JWT, isProduction, 'dev_jwt_secret'),
		cookie: requireSecret(
			'DINORPG_SECRET_KEY_COOKIE',
			env.DINORPG_SECRET_KEY_COOKIE,
			isProduction,
			'dev_cookie_secret'
		),
		deviceCookie: env.DEVICE_COOKIE ?? 'dz_device_cookie'
	};

	const discord: DiscordConfig = {
		logWebhookUrl: env.DISCORD_LOG_WEBHOOK_URL ?? ''
	};

	return {
		env: environment,
		isProduction,
		port,
		apiUrl,
		selfUrl,
		databaseUrl,
		salt: salt,
		secrets,
		discord
	};
}

export function loadConfig(): Config {
	dotenv.config();
	return config(process.env);
}

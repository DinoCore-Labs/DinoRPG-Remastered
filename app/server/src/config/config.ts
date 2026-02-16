import * as dotenv from 'dotenv';

export interface Secrets {
	jwt: string;
	cookie: string;
	deviceCookie: string;
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
}

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
	const salt = env.SALT ?? 'dev_salt';

	const secrets: Secrets = {
		jwt: env.DINORPG_SECRET_KEY_JWT ?? 'dev_jwt_secret',
		cookie: env.DINORPG_SECRET_KEY_COOKIE ?? 'dev_cookie_secret',
		deviceCookie: env.DEVICE_COOKIE ?? 'dz_device_cookie'
	};

	return {
		env: environment,
		isProduction,
		port,
		apiUrl,
		selfUrl,
		databaseUrl,
		salt: salt,
		secrets
	};
}

export function loadConfig(): Config {
	dotenv.config();
	return config(process.env);
}

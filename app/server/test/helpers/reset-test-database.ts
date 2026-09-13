import { spawnSync } from 'node:child_process';

function fail(message: string): never {
	throw new Error(`[test-db] ${message}`);
}

const databaseUrl = process.env.DATABASE_URL;

if (process.env.NODE_ENV !== 'test') {
	fail(`Refusing to reset database because NODE_ENV is "${process.env.NODE_ENV ?? 'undefined'}" instead of "test".`);
}

if (!databaseUrl) {
	fail('DATABASE_URL is missing.');
}

const parsedUrl = new URL(databaseUrl);

const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));

if (!databaseName) {
	fail('Unable to determine database name from DATABASE_URL.');
}

if (!databaseName.endsWith('_test')) {
	fail(
		`Refusing to reset database "${databaseName}". ` +
			'Automated tests may only reset databases whose name ends with "_test".'
	);
}

console.log(`[test-db] Resetting PostgreSQL database "${databaseName}" on "${parsedUrl.hostname}"...`);

const result = spawnSync('pnpm', ['exec', 'prisma', 'migrate', 'reset', '--force'], {
	stdio: 'inherit',
	env: process.env,
	shell: true
});
if (result.error) {
	throw result.error;
}
if (result.status !== 0) {
	process.exit(result.status ?? 1);
}

console.log('[test-db] Database ready.');

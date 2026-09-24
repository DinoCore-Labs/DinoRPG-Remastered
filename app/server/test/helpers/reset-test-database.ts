import { spawnSync } from 'node:child_process';

const EXPECTED_TEST_DATABASE = 'dinorpg_test';

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

/**
 * Ne pas simplement tester "_test".
 *
 * Une seule base est autorisée à être détruite
 * automatiquement par les tests.
 */
if (databaseName !== EXPECTED_TEST_DATABASE) {
	fail(
		[
			`Refusing to reset database "${databaseName}".`,
			'',
			`The only database allowed for automated tests is "${EXPECTED_TEST_DATABASE}".`
		].join('\n')
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

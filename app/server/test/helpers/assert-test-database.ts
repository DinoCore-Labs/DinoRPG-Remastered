import { prisma } from '../../src/prisma.js';

export const EXPECTED_TEST_DATABASE = 'dinorpg_test';

type CurrentDatabaseResult = {
	databaseName: string;
};

export async function assertTestDatabase(): Promise<void> {
	const result = await prisma.$queryRaw<CurrentDatabaseResult[]>`
			SELECT current_database()
				AS "databaseName"
		`;
	const databaseName = result[0]?.databaseName;
	if (!databaseName) {
		throw new Error('[test-db] Unable to determine the connected PostgreSQL database.');
	}
	if (databaseName !== EXPECTED_TEST_DATABASE) {
		throw new Error(
			[
				'',
				'============================================================',
				'🚨 TEST DATABASE SAFETY CHECK FAILED',
				'============================================================',
				'',
				`Connected database: "${databaseName}"`,
				`Expected database:  "${EXPECTED_TEST_DATABASE}"`,
				'',
				'Integration tests are refusing to continue.',
				'No database cleanup has been performed.',
				'',
				'Check app/server/.env.test and DATABASE_URL.',
				'============================================================'
			].join('\n')
		);
	}
}

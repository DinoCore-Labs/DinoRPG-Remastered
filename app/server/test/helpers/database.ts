import { waitForPendingGameLogs } from '../../src/Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../src/prisma.js';
import { assertTestDatabase } from './assert-test-database.js';

type PostgreSQLTable = {
	tablename: string;
};

function quoteIdentifier(identifier: string): string {
	return `"${identifier.replaceAll('"', '""')}"`;
}

export async function cleanDatabase(): Promise<void> {
	await assertTestDatabase();
	/**
	 * Certains GameLogs sont volontairement créés
	 * en arrière-plan.
	 *
	 * On attend leur terminaison avant de TRUNCATE
	 * afin d'éviter un deadlock PostgreSQL entre
	 * une insertion encore en cours et le nettoyage.
	 */
	await waitForPendingGameLogs();
	const tables = await prisma.$queryRaw<PostgreSQLTable[]>`
			SELECT tablename
			FROM pg_tables
			WHERE schemaname = 'public'
			  AND tablename <> '_prisma_migrations'
		`;
	if (tables.length === 0) {
		return;
	}
	const tableNames = tables.map(table => quoteIdentifier(table.tablename)).join(', ');
	await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`);
}

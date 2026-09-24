import { prisma } from '../../src/prisma.js';
import { assertTestDatabase } from './assert-test-database.js';

type PostgreSQLTable = {
	tablename: string;
};

function quoteIdentifier(identifier: string): string {
	return `"${identifier.replaceAll('"', '""')}"`;
}

export async function cleanDatabase(): Promise<void> {
	/**
	 * CRITIQUE :
	 *
	 * On vérifie la base RÉELLEMENT utilisée
	 * par la connexion Prisma avant tout TRUNCATE.
	 *
	 * Même si :
	 * - .env.test est oublié ;
	 * - DATABASE_URL est incorrect ;
	 * - Vitest est lancé directement ;
	 * - NODE_ENV est incorrect ;
	 *
	 * drpg_remastered ne pourra pas être nettoyée.
	 */
	await assertTestDatabase();
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

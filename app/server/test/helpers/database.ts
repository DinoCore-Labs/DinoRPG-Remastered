import { prisma } from '../../src/prisma.js';

type PostgreSQLTable = {
	tablename: string;
};

function quoteIdentifier(identifier: string): string {
	return `"${identifier.replaceAll('"', '""')}"`;
}

export async function cleanDatabase(): Promise<void> {
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

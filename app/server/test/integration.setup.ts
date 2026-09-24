import { afterAll } from 'vitest';

import { prisma } from '../src/prisma.js';
import { assertTestDatabase } from './helpers/assert-test-database.js';

/**
 * Vérification exécutée AVANT les tests
 * d'intégration.
 *
 * Aucun test d'intégration n'a le droit de
 * fonctionner sur une autre base que
 * dinorpg_test.
 */
await assertTestDatabase();

afterAll(async () => {
	await prisma.$disconnect();
});

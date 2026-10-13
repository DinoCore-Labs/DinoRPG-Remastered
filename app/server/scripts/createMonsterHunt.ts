import { DARK_WORLD_INVASION_MONSTER_HUNT } from '@dinorpg/core/src/models/monsterHunt/monsterHuntEditions';

import { MonsterHuntManager } from '../src/MonsterHunt/Controller/monsterHuntManager.controller';
import { prisma } from '../src/prisma';

const startAt = new Date(Date.now() + 5 * 60 * 1000);

const endAt = new Date(Date.now() + 30 * 60 * 1000);

const hunt = await MonsterHuntManager.createEdition({
	config: DARK_WORLD_INVASION_MONSTER_HUNT,

	startAt,
	endAt
});

console.log({
	id: hunt.id,
	name: hunt.name,
	status: hunt.status,
	startAt: hunt.startAt,
	endAt: hunt.endAt
});

await prisma.$disconnect();

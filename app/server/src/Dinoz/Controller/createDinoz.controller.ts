import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function createDinoz(dinoz: Prisma.DinozCreateInput) {
	if (!dinoz.user?.connect?.id) {
		throw new ExpectedError('Missing user id');
	}

	const newDinoz = await prisma.dinoz.create({
		data: dinoz as Prisma.DinozCreateInput
	});

	//await createLog(LogType.CreateDinoz, dinoz.user.connect.id, newDinoz.id);

	//GLOBAL.liveStats.incrementDinoz();

	return newDinoz;
}

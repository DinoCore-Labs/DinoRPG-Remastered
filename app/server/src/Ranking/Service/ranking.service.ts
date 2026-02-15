import { FastifyRequest } from 'fastify';

import { getAverageRanking } from '../Controller/getAverageRanking.controller.js';
import { getClassicRanking } from '../Controller/getClassicRanking.controller.js';
import { getCompletionRanking } from '../Controller/getCompletionRanking.controller.js';

export async function getRanking(
	req: FastifyRequest<{
		Params: { sort: string; page: string };
	}>
) {
	const { sort, page } = req.params;
	const pageNum = Number(page);

	let ranking;

	switch (sort) {
		case 'classic':
			ranking = await getClassicRanking(pageNum);
			break;
		case 'average':
			ranking = await getAverageRanking(pageNum);
			break;
		case 'completion':
			ranking = await getCompletionRanking(pageNum);
			break;
		default:
			ranking = await getClassicRanking(pageNum);
			break;
	}

	return ranking;
}

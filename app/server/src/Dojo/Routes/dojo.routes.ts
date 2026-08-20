import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import {
	challengeFightSchema,
	createMyTeamSchema,
	dojoHistoryPageSchema,
	dojoTournamentRequestSchema,
	fightTestSchema,
	sharedFightSchema,
	skipOpponentSchema
} from '../Schema/dojo.schema.js';
import { buildDojo, getMyDojo } from '../Service/dojo.service.js';
import { createMyTeam, fightChallenge, getMyTeam, skipOpponent } from '../Service/dojoChallenge.service.js';
import { getArchivedFight, getMyHistory, tournamentsHistory } from '../Service/dojoHistory.service.js';
import { dojoTest } from '../Service/dojoTest.service.js';
import {
	createTournamentTeam,
	deleteTournamentTeam,
	getDojoTournamentFights,
	getTournamentInfo,
	getTournamentTeam,
	readAllFightFromPool
} from '../Service/dojoTournament.service.js';

export async function dojoRoutes(app: FastifyInstance) {
	app.post(
		'/create',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'] }
		},
		buildDojo
	);
	app.get(
		'/my',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'] }
		},
		getMyDojo
	);

	app.post(
		'/fightTest',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], body: fightTestSchema }
		},
		dojoTest
	);
	//History
	app.get(
		'/history/:page',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], params: dojoHistoryPageSchema }
		},
		getMyHistory
	);
	app.get(
		'/history/shared/:id',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], params: sharedFightSchema }
		},
		getArchivedFight
	);
	app.get(
		'/history/tournament/:page',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], params: dojoHistoryPageSchema }
		},
		tournamentsHistory
	);
	//Challenge
	(app.put(
		'/challenge/skip',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], body: skipOpponentSchema }
		},
		skipOpponent
	),
		app.put(
			'/challenge/createMyTeam',
			{
				preHandler: app.authenticate,
				schema: { tags: ['Dojo'], body: createMyTeamSchema }
			},
			createMyTeam
		));
	app.put(
		'/challenge/fight',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], body: challengeFightSchema }
		},
		fightChallenge
	);
	app.get(
		'/challenge/myTeam',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'] }
		},
		getMyTeam
	);

	//Tournament
	app.get(
		'/tournament/info',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'] }
		},
		getTournamentInfo
	);
	app.get(
		'/tournament/team',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'] }
		},
		getTournamentTeam
	);
	app.get(
		'/tournament/:phase/:id/:pool',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], params: dojoTournamentRequestSchema }
		},
		getDojoTournamentFights
	);
	app.patch(
		'/tournament/:phase/:id/:pool',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], params: dojoTournamentRequestSchema }
		},
		readAllFightFromPool
	);
	app.post(
		'/tournament/team',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'], body: createMyTeamSchema }
		},
		createTournamentTeam
	);
	app.delete(
		'/tournament/team',
		{
			preHandler: app.authenticate,
			schema: { tags: ['Dojo'] }
		},
		deleteTournamentTeam
	);
}

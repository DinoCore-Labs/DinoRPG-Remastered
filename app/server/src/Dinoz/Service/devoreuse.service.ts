import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, type FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { calculateFightBetweenPlayers } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { STANDARD_PVP_RULES } from '../../utils/fight/fight.mapper.js';

type DevoreuseParams = {
	id: string;
};

const DEVOREUSE_PLACES = [PlaceEnum.DEVOREUSE_DE_L_EST, PlaceEnum.DEVOREUSE_DU_NORD, PlaceEnum.DEVOREUSE_DE_L_OUEST];

export async function devoreuseAttackHandler(req: FastifyRequest<{ Params: DevoreuseParams }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	const userId = req.user.id;

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		throw new ExpectedError('User not found');
	}

	const team = await prisma.dinoz.findMany({
		where: { userId, OR: [{ id: dinozId }, { leaderId: dinozId }] },
		include: { items: true, skills: true, status: true, catches: true, user: true }
	});

	const leader = team.find(d => d.id === dinozId);
	if (!leader) throw new ExpectedError('Dinoz not found');
	if (leader.leaderId) throw new ExpectedError('Only leaders can attack');
	if (!DEVOREUSE_PLACES.includes(leader.placeId)) throw new ExpectedError('Not on a Devoreuse place');

	// Verify everyone is alive and available
	for (const d of team) {
		if (!isAlive(d)) throw new ExpectedError('Dead dinoz in team');
		if (d.state !== null) throw new ExpectedError('Dinoz is busy');
		if (d.placeId !== leader.placeId) throw new ExpectedError('Dinoz not on same place');
	}

	const placeId = leader.placeId;

	// Verify team has action
	for (const d of team) {
		if (!d.fight) throw new ExpectedError('Dinoz does not have an action available');
	}

	// Fetch current control
	const currentControl = await prisma.devoreuseControl.findUnique({
		where: { placeId },
		include: { dinozs: { include: { items: true, skills: true, status: true, catches: true, user: true } } }
	});

	if (currentControl && currentControl.dinozs.length > 0) {
		if (user.devoreuseAttacksLeft <= 0) {
			throw new ExpectedError('No more attacks left');
		}
		// Remove an attack point
		await prisma.user.update({ where: { id: userId }, data: { devoreuseAttacksLeft: { decrement: 1 } } });
	}

	// Consume fight action
	for (const d of team) {
		await prisma.dinoz.update({
			where: { id: d.id },
			data: { fight: false }
		});
	}

	if (!currentControl || currentControl.dinozs.length === 0) {
		// Take control directly
		if (currentControl) {
			await prisma.devoreuseControl.delete({ where: { placeId } });
		}
		await prisma.devoreuseControl.create({
			data: {
				placeId,
				userId,
				dinozs: { connect: team.map(d => ({ id: d.id })) }
			}
		});
		return reply.send({ success: true, fight: null, victory: true });
	}

	// Opponent exists, trigger Hardcore PvP fight!
	const attackers = team;
	const defenders = currentControl.dinozs;

	const fightResult = calculateFightBetweenPlayers(
		STANDARD_PVP_RULES,
		attackers,
		user.cooker,
		defenders,
		defenders[0]?.user?.cooker ?? false,
		placeId
	);

	const victory = fightResult.outcome === FightOutcome.AttackerWin;

	// Apply Hardcore HP loss
	await prisma.$transaction(async tx => {
		// Attackers HP loss
		for (const fighter of fightResult.attackers) {
			if (fighter.hpLost > 0) {
				await tx.dinoz.update({
					where: { id: fighter.dinozId },
					data: { life: { decrement: fighter.hpLost } }
				});
			}
		}
		// Defenders HP loss
		for (const fighter of fightResult.defenders) {
			if (fighter.hpLost > 0) {
				await tx.dinoz.update({
					where: { id: fighter.dinozId },
					data: { life: { decrement: fighter.hpLost } }
				});
			}
		}

		if (victory) {
			// Attacker wins, take control
			await tx.devoreuseControl.delete({ where: { placeId } });
			await tx.devoreuseControl.create({
				data: {
					placeId,
					userId,
					dinozs: { connect: team.map(d => ({ id: d.id })) }
				}
			});
		}
	});

	const clientFightResult: FightResult = {
		fighters: fightResult.fighters,
		goldEarned: 0,
		xpEarned: 0,
		levelUp: false,
		totalHpLost: fightResult.attackers.reduce((acc, f) => acc + f.hpLost, 0),
		result: victory,
		history: fightResult.steps,
		hpLost: fightResult.attackers.map(f => ({ id: f.dinozId, hpLost: f.hpLost })),
		itemsUsed: fightResult.attackers.map(f => ({ id: f.dinozId, itemsUsed: f.itemsUsed })),
		place: placeId,
		endText: victory ? { type: 'message', text: 'scenarios.devoreuse.texts.tower_won' } : undefined
	};

	return reply.send({ success: true, fight: clientFightResult, victory });
}

export async function devoreuseDefendStopHandler(
	req: FastifyRequest<{ Params: DevoreuseParams }>,
	reply: FastifyReply
) {
	const dinozId = Number(req.params.id);
	const userId = req.user.id;

	const dinoz = await prisma.dinoz.findUnique({ where: { id: dinozId } });
	if (!dinoz || dinoz.userId !== userId) throw new ExpectedError('Dinoz not found');
	if (dinoz.leaderId) throw new ExpectedError('Only leaders can stop defend');

	const placeId = dinoz.placeId;
	if (!DEVOREUSE_PLACES.includes(placeId)) throw new ExpectedError('Not on a Devoreuse place');

	const currentControl = await prisma.devoreuseControl.findUnique({ where: { placeId } });
	if (!currentControl || currentControl.userId !== userId) {
		throw new ExpectedError('You do not control this devoreuse');
	}

	await prisma.devoreuseControl.delete({ where: { placeId } });

	return reply.send({ success: true });
}

export async function devoreuseGetDefendersHandler(
	req: FastifyRequest<{ Params: { placeId: string } }>,
	reply: FastifyReply
) {
	const placeId = Number(req.params.placeId);
	if (!DEVOREUSE_PLACES.includes(placeId)) throw new ExpectedError('Not on a Devoreuse place');

	const currentControl = await prisma.devoreuseControl.findUnique({
		where: { placeId },
		include: {
			user: {
				select: { id: true, name: true, clan: { select: { name: true } } }
			},
			dinozs: {
				select: {
					id: true,
					name: true,
					level: true,
					raceId: true,
					display: true
				}
			}
		}
	});

	const user = await prisma.user.findUnique({
		where: { id: req.user.id },
		select: { devoreuseAttacksLeft: true }
	});

	if (!currentControl) return reply.send({ defenders: null, attacksLeft: user?.devoreuseAttacksLeft || 0 });

	return reply.send({
		defenders: {
			userId: currentControl.user.id,
			username: currentControl.user.name,
			clanName: currentControl.user.clan?.name || null,
			dinozs: currentControl.dinozs.map(d => ({
				id: d.id,
				name: d.name,
				level: d.level,
				type: d.raceId,
				apparence: d.display
			}))
		},
		attacksLeft: user?.devoreuseAttacksLeft || 0
	});
}

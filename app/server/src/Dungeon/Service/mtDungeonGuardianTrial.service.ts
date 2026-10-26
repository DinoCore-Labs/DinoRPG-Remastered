/**
 * STEP 19 - Development-only guardian combat adapter.
 * This runs the REAL Remastered combat engine, but the ONE-monster team is
 * EXPERIMENTAL. MT's server-side door encounter composition is not archived.
 *
 * Off in production; separate explicit opt-in in addition to step 18 tools.
 * Durable attempt records prevent repeat payouts after partial failures.
 * Note: rewardFightVsMonsters is not transaction-aware. REVIEW is fail-closed.
 */
import { randomUUID } from 'node:crypto';

import {
	assertMtGuardianTrialBinding,
	createMtGuardianTrialIntent,
	MT_GUARDIAN_TRIAL_INDEX
} from '@dinorpg/core/models/dungeon/dungeon.guardianTrial.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { settleMtDungeonInteraction } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { getMonsterKeyById, monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { Prisma } from '../../../../prisma/index.js';
import { GLOBAL } from '../../context.js';
import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import {
	calculateFightVsMonsters,
	generateMonsterList,
	rewardFightVsMonsters
} from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { detachDeadMtDungeonFollowers, mtDungeonLeaderIsDead } from './mtDungeonCasualties.service.js';
import { isWipedMtDungeonParty } from './mtDungeonDefeat.service.js';
import { saveMtDungeonProgress } from './mtDungeonProgress.service.js';
import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonGuardianTrialError extends Error {
	constructor(
		public readonly code:
			| 'disabled'
			| 'not-found'
			| 'not-ready'
			| 'stale-revision'
			| 'unknown-monster'
			| 'group-unavailable'
			| 'conflict'
			| 'already-processing'
			| 'review-required'
	) {
		super(`MT guardian trial: ${code}`);
	}
}

export function mtDungeonGuardianTrialEnabled(): boolean {
	return (
		GLOBAL.config.env === 'development' &&
		!GLOBAL.config.isProduction &&
		process.env.MT_DUNGEON_DEV_TOOLS === 'true' &&
		process.env.MT_DUNGEON_DEV_GUARDIAN_FIGHTS === 'true'
	);
}
function ensureEnabled(): void {
	if (!mtDungeonGuardianTrialEnabled()) throw new MtDungeonGuardianTrialError('disabled');
}
function intentFor(session: MtDungeonSession) {
	const archive = getMtDungeonArchive();
	try {
		return createMtGuardianTrialIntent({
			session,
			configuration: archive.configuration(session.mapId),
			definition: archive.definition(session.mapId.slice(0, session.mapId.lastIndexOf('_')))
		});
	} catch {
		throw new MtDungeonGuardianTrialError('not-ready');
	}
}
function knownMonster(key: string): MonsterFiche {
	const monster = (monsterByKey as Readonly<Record<string, MonsterFiche | undefined>>)[key];
	if (!monster || key === 'any') throw new MtDungeonGuardianTrialError('unknown-monster');
	return monster;
}
function wrongAttemptStatus(status: string): MtDungeonGuardianTrialError {
	return new MtDungeonGuardianTrialError(status === 'REVIEW' ? 'review-required' : 'already-processing');
}

/** Read-only and only if the current user owns the validated pending guardian. */
export async function getMtGuardianTrialPreview(identity: MtSessionIdentity) {
	const session = await mtDungeonDependencies().repository.load(identity);
	if (!session) throw new MtDungeonGuardianTrialError('not-found');
	const intent = intentFor(session);
	knownMonster(intent.monsterKeys[0]);
	return {
		mapId: intent.mapId,
		revision: intent.revision,
		monsterKey: intent.monsterKeys[0],
		experimental: true as const,
		note: 'Combat de test Remastered : composition exacte des gardiens MT inconnue.'
	};
}

export async function prepareMtGuardianTrial(identity: MtSessionIdentity, revision: number) {
	if (!Number.isSafeInteger(revision) || revision < 0) throw new MtDungeonGuardianTrialError('stale-revision');
	const deps = mtDungeonDependencies();
	return deps.withLock(identity.userId, async () => {
		const run = await prisma.mtDungeonRun.findFirst({
			where: {
				userId: identity.userId,
				leaderDinozId: identity.leaderDinozId,
				leaderDinoz: { userId: identity.userId }
			}
		});
		if (!run) throw new MtDungeonGuardianTrialError('not-found');
		const session = await deps.repository.load(identity);
		if (!session) throw new MtDungeonGuardianTrialError('not-found');
		if (session.revision !== revision) throw new MtDungeonGuardianTrialError('stale-revision');
		const intent = intentFor(session);
		const old = await prisma.mtDungeonFightAttempt.findUnique({
			where: { runId_revision: { runId: run.id, revision } }
		});
		if (old) {
			if (old.status !== 'PREPARED') throw wrongAttemptStatus(old.status);
			if (
				old.mapId !== intent.mapId ||
				old.scenarioIndex !== MT_GUARDIAN_TRIAL_INDEX ||
				old.pendingJson !== intent.pendingJson ||
				!old.monsterKeys.length ||
				old.monsterKeys.some(
					key =>
						!getMtDungeonArchive()
							.definition(session.mapId.slice(0, session.mapId.lastIndexOf('_')))
							.monsters.includes(key)
				)
			)
				throw new MtDungeonGuardianTrialError('conflict');
			return { token: old.token, revision, monsterKeys: [...old.monsterKeys], experimental: true as const };
		}
		// Generate enemy party using normal Remastered level/power/group rules,
		// limited to the exact MT dungeon XML monster keys.
		const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
		const definition = getMtDungeonArchive().definition(dungeonId);
		const entrance = Object.values(placeListv2).find(place => place.name === definition.enter.place);
		/* MT20N PREPARE GUARDIAN: remove legacy deceased followers */
		await prisma.$transaction(tx => detachDeadMtDungeonFollowers(tx, identity));
		const user = await getDinozFightDataRequest(identity.leaderDinozId, identity.userId);
		const party = user?.dinoz ?? [];
		const leader = party.find(d => d.id === identity.leaderDinozId);
		// A dungeon battle must never accidentally include an unrelated Dinoz.
		const validParty =
			!!leader && leader.leaderId === null && party.every(d => d.id === leader.id || d.leaderId === leader.id);
		if (
			!entrance ||
			!leader ||
			!validParty ||
			!party.length ||
			party.some(
				d => d.placeId !== entrance.placeId || d.life <= 0 || !d.fight || d.state !== null || d.concentration !== null
			)
		)
			throw new MtDungeonGuardianTrialError('group-unavailable');
		// The original XML can refer to monsters absent from the Remastered fight engine.
		// Never pass unsupported identifiers into generateMonsterList or silently
		// substitute unrelated overworld monsters.
		const supportedKeys = definition.monsters.filter(
			key => key !== 'any' && Object.prototype.hasOwnProperty.call(monsterByKey, key)
		);
		if (!supportedKeys.length) throw new MtDungeonGuardianTrialError('unknown-monster');
		const generated = await generateMonsterList(
			[leader, ...party.filter(d => d.id !== leader.id)],
			entrance.placeId,
			undefined,
			supportedKeys
		);
		const monsterKeys = generated.map(monster => getMonsterKeyById(monster.id));
		if (!monsterKeys.length || monsterKeys.some(key => !key || !definition.monsters.includes(key)))
			throw new MtDungeonGuardianTrialError('unknown-monster');
		const token = randomUUID();
		try {
			await prisma.mtDungeonFightAttempt.create({
				data: {
					token,
					runId: run.id,
					mapId: intent.mapId,
					revision,
					scenarioIndex: MT_GUARDIAN_TRIAL_INDEX,
					pendingJson: intent.pendingJson,
					monsterKeys: monsterKeys as string[],
					fightSeed: token,
					status: 'PREPARED'
				}
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
				throw new MtDungeonGuardianTrialError('conflict');
			throw error;
		}
		return { token, revision, monsterKeys: monsterKeys as string[], experimental: false as const };
	});
}

/** Execute once. An uncertain reward application is never automatically retried. */
export async function resolveMtGuardianTrial(identity: MtSessionIdentity, token: string): Promise<FightResult> {
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))
		throw new MtDungeonGuardianTrialError('not-found');
	const deps = mtDungeonDependencies();
	return deps.withLock(identity.userId, async () => {
		const attempt = await prisma.mtDungeonFightAttempt.findUnique({
			where: { token },
			include: { run: { include: { leaderDinoz: { select: { userId: true } } } } }
		});
		if (
			!attempt ||
			attempt.run.userId !== identity.userId ||
			attempt.run.leaderDinozId !== identity.leaderDinozId ||
			attempt.run.leaderDinoz.userId !== identity.userId ||
			attempt.scenarioIndex !== MT_GUARDIAN_TRIAL_INDEX
		)
			throw new MtDungeonGuardianTrialError('not-found');
		if (attempt.status === 'COMPLETED') {
			if (!attempt.result) throw new MtDungeonGuardianTrialError('review-required');
			return attempt.result as unknown as FightResult;
		}
		if (attempt.status !== 'PREPARED') throw wrongAttemptStatus(attempt.status);
		const session = await deps.repository.load(identity);
		if (!session) throw new MtDungeonGuardianTrialError('not-found');
		const intent = intentFor(session);
		try {
			assertMtGuardianTrialBinding(session, {
				...intent,
				revision: attempt.revision,
				mapId: attempt.mapId,
				scenarioIndex: MT_GUARDIAN_TRIAL_INDEX,
				pendingJson: attempt.pendingJson,
				monsterKeys: [attempt.monsterKeys[0] ?? '']
			});
		} catch {
			throw new MtDungeonGuardianTrialError('conflict');
		}
		const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
		const allowed = new Set(getMtDungeonArchive().definition(dungeonId).monsters);
		if (
			!attempt.monsterKeys.length ||
			attempt.monsterKeys.length > 24 ||
			attempt.monsterKeys.some(key => !allowed.has(key))
		)
			throw new MtDungeonGuardianTrialError('unknown-monster');
		const monsters = attempt.monsterKeys.map(knownMonster);
		const dungeonPlace = Object.values(placeListv2).find(
			place =>
				place.name ===
				getMtDungeonArchive().definition(session.mapId.slice(0, session.mapId.lastIndexOf('_'))).enter.place
		)?.placeId;
		/* MT20N RESOLVE GUARDIAN: remove deceased followers */
		await prisma.$transaction(tx => detachDeadMtDungeonFollowers(tx, identity));
		const user = await getDinozFightDataRequest(identity.leaderDinozId, identity.userId);
		const team = user?.dinoz;
		const leader = team?.find(d => d.id === identity.leaderDinozId);
		if (
			!user ||
			!team?.length ||
			!leader ||
			leader.leaderId !== null ||
			leader.placeId === null ||
			dungeonPlace === undefined ||
			leader.placeId !== dungeonPlace ||
			team.some(
				d =>
					d.life <= 0 ||
					d.state !== null ||
					d.canRename ||
					!d.fight ||
					d.concentration !== null ||
					d.placeId !== leader.placeId ||
					(d.id !== leader.id && d.leaderId !== leader.id)
			)
		)
			throw new MtDungeonGuardianTrialError('group-unavailable');
		const claim = await prisma.mtDungeonFightAttempt.updateMany({
			where: { id: attempt.id, status: 'PREPARED' },
			data: { status: 'PROCESSING' }
		});
		if (claim.count !== 1) throw new MtDungeonGuardianTrialError('already-processing');
		try {
			const squad = [leader, ...team.filter(d => d.id !== leader.id)];
			const fight = calculateFightVsMonsters(squad, user, leader.placeId, monsters, attempt.fightSeed);
			// Trial battles have genuine effects and may award XP/loot, as in the
			// existing engine. Disable the unsupported dungeon gold and hunt rewards.
			const result = await rewardFightVsMonsters(squad, monsters, fight, leader.placeId, user, {
				disableGoldReward: true,
				disableMonsterHuntReward: true
			});
			const cfg = deps.getConfiguration(session.mapId);
			const settled = settleMtDungeonInteraction(cfg, session, result.result);
			// Include the verified dungeon origin in stored and returned fight results.
			const dungeonResult: FightResult = {
				...result,
				dungeonReturn: { leaderDinozId: identity.leaderDinozId, mapId: session.mapId }
			};
			const stored = JSON.parse(JSON.stringify(dungeonResult)) as Prisma.InputJsonValue;
			await prisma.$transaction(async tx => {
				// Exactly one fight action per party member, whether won or lost.
				const consumed = await tx.dinoz.updateMany({
					where: { userId: identity.userId, id: { in: squad.map(d => d.id) }, fight: true },
					data: { fight: false }
				});
				if (consumed.count !== squad.length) throw new MtDungeonGuardianTrialError('conflict');
				// The fight engine has already persisted all HP losses.
				// A full-party wipe ends the run; resurrection is possible outside.
				if ((await isWipedMtDungeonParty(tx, identity)) || (await mtDungeonLeaderIsDead(tx, identity))) {
					await saveMtDungeonProgress(tx, identity, settled, cfg);
					const removed = await tx.mtDungeonRun.deleteMany({
						where: {
							id: attempt.runId,
							userId: identity.userId,
							leaderDinozId: identity.leaderDinozId,
							revision: session.revision
						}
					});
					if (removed.count !== 1) throw new MtDungeonGuardianTrialError('conflict');
					// FK cascade deletes the fight attempt; a replay cannot award rewards again.
					return;
				}
				// MT20N: persist the group reduction together with run settlement.
				await detachDeadMtDungeonFollowers(tx, identity);
				const updated = await tx.mtDungeonRun.updateMany({
					where: {
						id: attempt.runId,
						userId: identity.userId,
						leaderDinozId: identity.leaderDinozId,
						revision: session.revision
					},
					data: {
						revision: settled.revision,
						x: settled.position.x,
						y: settled.position.y,
						l: settled.position.l,
						keys: [...settled.keys],
						flags: [...settled.flags],
						fog: settled.fog === null ? null : Uint8Array.from(settled.fog),
						locked: settled.locked,
						pending: Prisma.DbNull,
						stageStates: settled.stageStates as unknown as Prisma.InputJsonValue
					}
				});
				if (updated.count !== 1) throw new MtDungeonGuardianTrialError('conflict');
				await tx.mtDungeonFightAttempt.update({
					where: { id: attempt.id },
					data: { status: 'COMPLETED', result: stored }
				});
			});
			return dungeonResult;
		} catch (error) {
			// Reward service is not part of the above transaction. Fail closed.
			try {
				await prisma.mtDungeonFightAttempt.updateMany({
					where: { id: attempt.id, status: 'PROCESSING' },
					data: { status: 'REVIEW' }
				});
			} catch {
				/* PROCESSING also prevents replay */
			}
			throw error;
		}
	});
}

import { GameLogRetention, GameLogType, Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

type GameLogDb = {
	gameLog: {
		create(args: Prisma.GameLogCreateArgs): Promise<unknown>;
	};
	user: {
		findUnique(args: Prisma.UserFindUniqueArgs): Promise<{ name: string } | null>;
	};
	dinoz: {
		findUnique(args: Prisma.DinozFindUniqueArgs): Promise<{ name: string } | null>;
	};
};

export type CreateGameLogInput = {
	type: GameLogType;
	retention?: GameLogRetention;
	values?: string[];
	metadata?: Prisma.InputJsonValue;
	userId?: string | null;
	dinozId?: number | null;
	actorUserId?: string | null;
	userNameSnapshot?: string | null;
	dinozNameSnapshot?: string | null;
	actorNameSnapshot?: string | null;
	createdAt?: Date;
};

const AUDIT_LOG_TYPES = new Set<GameLogType>([
	GameLogType.PlayerCreated,
	GameLogType.PlayerReset,
	GameLogType.PlayerDeleted,
	GameLogType.PlayerBanned,
	GameLogType.PlayerUnbanned,

	GameLogType.AdminUpdateDinoz,
	GameLogType.AdminAddStatus,
	GameLogType.AdminRemoveStatus,
	GameLogType.AdminAddSkill,
	GameLogType.AdminRemoveSkill,
	GameLogType.AdminAddUnlockableSkill,
	GameLogType.AdminRemoveUnlockableSkill,
	GameLogType.AdminAddMoney,
	GameLogType.AdminRemoveMoney,
	GameLogType.AdminAddReward,
	GameLogType.AdminRemoveReward,
	GameLogType.AdminAddItem,
	GameLogType.AdminRemoveItem,
	GameLogType.AdminAddIngredient,
	GameLogType.AdminRemoveIngredient,
	GameLogType.AdminUpdateMission,
	GameLogType.AdminUpdateScenario,
	GameLogType.AdminUpdateUser,
	GameLogType.AdminUpdateSecret
]);

export function resolveGameLogRetention(type: GameLogType) {
	return AUDIT_LOG_TYPES.has(type) ? GameLogRetention.AUDIT : GameLogRetention.TEMPORARY;
}

async function resolveUserName(db: GameLogDb, userId?: string | null) {
	if (!userId) return null;
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { name: true }
	});
	return user?.name ?? null;
}

async function resolveDinozName(db: GameLogDb, dinozId?: number | null) {
	if (!dinozId) return null;
	const dinoz = await db.dinoz.findUnique({
		where: { id: dinozId },
		select: { name: true }
	});
	return dinoz?.name ?? null;
}

export async function createGameLog(input: CreateGameLogInput, db: GameLogDb = prisma) {
	const [userNameSnapshot, dinozNameSnapshot, actorNameSnapshot] = await Promise.all([
		input.userNameSnapshot !== undefined ? input.userNameSnapshot : resolveUserName(db, input.userId),
		input.dinozNameSnapshot !== undefined ? input.dinozNameSnapshot : resolveDinozName(db, input.dinozId),
		input.actorNameSnapshot !== undefined ? input.actorNameSnapshot : resolveUserName(db, input.actorUserId)
	]);
	return db.gameLog.create({
		data: {
			type: input.type,
			retention: input.retention ?? resolveGameLogRetention(input.type),
			values: input.values ?? [],
			createdAt: input.createdAt ?? new Date(),
			userId: input.userId ?? null,
			dinozId: input.dinozId ?? null,
			actorUserId: input.actorUserId ?? null,
			userNameSnapshot,
			dinozNameSnapshot,
			actorNameSnapshot,
			...(input.metadata !== undefined ? { metadata: input.metadata } : {})
		}
	});
}

export function safeCreateGameLog(input: CreateGameLogInput, log?: { error: Function }) {
	return createGameLog(input).catch(error => {
		log?.error?.({ error, gameLogType: input.type }, '[game-log] failed to create log');
	});
}

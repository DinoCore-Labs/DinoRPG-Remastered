import { Prisma } from '../../../../prisma/client.js';

type ScenarioTransaction = Prisma.TransactionClient;

export type UserScenarioProgression = {
	progression: number;
	tracking: number;
	state: Prisma.JsonValue | null;
};

const getUserScenarioWhere = (userId: string, scenarioKey: string) => ({
	scenarioKey_userId: {
		scenarioKey,
		userId
	}
});

export async function getUserScenarioProgression(
	tx: ScenarioTransaction,
	userId: string,
	scenarioKey: string
): Promise<UserScenarioProgression> {
	const scenario = await tx.userScenario.findUnique({
		where: getUserScenarioWhere(userId, scenarioKey),
		select: {
			progression: true,
			tracking: true,
			state: true
		}
	});
	return {
		progression: scenario?.progression ?? 0,
		tracking: scenario?.tracking ?? 0,
		state: scenario?.state ?? null
	};
}

export async function setUserScenarioProgression(
	tx: ScenarioTransaction,
	input: {
		userId: string;
		scenarioKey: string;
		progression: number;
		tracking?: number;
		state?: Prisma.InputJsonValue;
	}
) {
	const data = {
		progression: input.progression,
		...(input.tracking !== undefined ? { tracking: input.tracking } : {}),
		...(input.state !== undefined ? { state: input.state } : {})
	};
	return tx.userScenario.upsert({
		where: getUserScenarioWhere(input.userId, input.scenarioKey),
		create: {
			userId: input.userId,
			scenarioKey: input.scenarioKey,
			...data
		},
		update: data
	});
}

export async function incrementUserScenarioProgression(
	tx: ScenarioTransaction,
	input: {
		userId: string;
		scenarioKey: string;
		delta: number;
	}
) {
	const current = await getUserScenarioProgression(tx, input.userId, input.scenarioKey);
	return setUserScenarioProgression(tx, {
		userId: input.userId,
		scenarioKey: input.scenarioKey,
		progression: current.progression + input.delta,
		tracking: current.tracking
	});
}

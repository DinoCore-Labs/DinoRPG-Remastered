import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { rewardKeyById } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';

import { prisma } from '../../prisma.js';
import {
	BOT_LANTERN_PROGRESSION,
	BotProgressionAction,
	BotProgressionNode,
	BotProgressionRequirement
} from './botProgressionGraph.service.js';

export type BotProgressionStep =
	| BotProgressionAction
	| { type: 'move'; placeId: number }
	| { type: 'level'; value: number };

type BotProgressionState = {
	level: number;
	placeId: number;
	statusKeys: Set<string>;
	collections: Set<string>;
};

function requirementKey(requirement: BotProgressionRequirement): string {
	switch (requirement.type) {
		case 'status':
			return `status:${requirement.key}`;
		case 'collection':
			return `collection:${requirement.key}`;
		case 'place':
			return `place:${requirement.placeId}`;
		case 'level':
			return `level:${requirement.value}`;
	}
}

function isRequirementSatisfied(
	state: BotProgressionState,
	requirement: BotProgressionRequirement
): boolean {
	switch (requirement.type) {
		case 'status':
			return state.statusKeys.has(requirement.key);
		case 'collection':
			return state.collections.has(requirement.key);
		case 'place':
			return state.placeId === requirement.placeId;
		case 'level':
			return state.level >= requirement.value;
	}
}

function findProviderCandidates(
	graph: BotProgressionNode[],
	requirement: BotProgressionRequirement
): BotProgressionNode[] {
	return graph.filter(node =>
		node.provides.some(provided => requirementKey(provided) === requirementKey(requirement))
	);
}

function providerScore(state: BotProgressionState, node: BotProgressionNode): number {
	return node.requires.reduce(
		(score, requirement) => score + (isRequirementSatisfied(state, requirement) ? 10 : 0),
		0
	);
}

function resolveRequirement(
	state: BotProgressionState,
	graph: BotProgressionNode[],
	requirement: BotProgressionRequirement,
	visited: Set<string>
): BotProgressionStep | null {
	if (isRequirementSatisfied(state, requirement)) return null;

	if (requirement.type === 'place') {
		return { type: 'move', placeId: requirement.placeId };
	}

	if (requirement.type === 'level') {
		return { type: 'level', value: requirement.value };
	}

	const key = requirementKey(requirement);
	if (visited.has(key)) return null;
	visited.add(key);

	const providers = findProviderCandidates(graph, requirement).sort(
		(a, b) => providerScore(state, b) - providerScore(state, a)
	);

	for (const provider of providers) {
		for (const dependency of provider.requires) {
			if (isRequirementSatisfied(state, dependency)) continue;
			const dependencyStep = resolveRequirement(state, graph, dependency, new Set(visited));
			if (dependencyStep) return dependencyStep;
		}

		return provider.action;
	}

	return null;
}

async function getBotProgressionState(userId: string, dinozId: number): Promise<BotProgressionState | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			level: true,
			placeId: true,
			status: {
				select: {
					statusId: true
				}
			}
		}
	});
	if (!dinoz) return null;

	const rewards = await prisma.userRewards.findMany({
		where: { userId },
		select: { rewardId: true }
	});

	const statusKeys = new Set<string>();
	for (const status of dinoz.status) {
		for (const [key, statusId] of Object.entries(dinozStatusIdByKey)) {
			if (statusId === status.statusId) {
				statusKeys.add(key);
				break;
			}
		}
	}

	const collections = new Set<string>();
	for (const reward of rewards) {
		const key = rewardKeyById[reward.rewardId];
		if (key) collections.add(key);
	}

	return {
		level: dinoz.level,
		placeId: dinoz.placeId,
		statusKeys,
		collections
	};
}

export async function getBotLanternProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotProgressionStep | null> {
	const state = await getBotProgressionState(userId, dinozId);
	if (!state) return null;

	return resolveRequirement(
		state,
		BOT_LANTERN_PROGRESSION,
		{ type: 'status', key: 'lantrn' },
		new Set()
	);
}

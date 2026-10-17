import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { Stat } from '@dinorpg/core/models/enums/SkillStat.js';
import type { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

import { BotDinozRole } from '../../../../prisma/index.js';
import { getDinozEquipItemRequest } from '../../Dinoz/Controller/getDinozEquipItem.controller.js';
import { equipDinozItem } from '../../Inventory/Service/equipItem.service.js';
import { backpackSlot } from '../../utils/dinoz/dinozFiche.mapper.js';
import { getOrAssignBotDinozRole } from './botDinozRole.service.js';

const BOT_MIN_EQUIPMENT_SCORE: Record<BotDinozRole, number> = {
	[BotDinozRole.FIGHTER]: 20,
	[BotDinozRole.GATHERER]: 35,
	[BotDinozRole.EXPLORER]: 25
};

const FIGHTER_PASSIVE_STATS = new Set<Stat>([
	Stat.MAX_HP,
	Stat.ARMOR,
	Stat.ARMOR_BREAK,
	Stat.COUNTER,
	Stat.MULTIHIT,
	Stat.CRITICAL_HIT_CHANCE,
	Stat.CRITICAL_HIT_BONUS,
	Stat.FIRE_ASSAULT,
	Stat.WOOD_ASSAULT,
	Stat.WATER_ASSAULT,
	Stat.LIGHTNING_ASSAULT,
	Stat.AIR_ASSAULT,
	Stat.FIRE_DEFENSE,
	Stat.WOOD_DEFENSE,
	Stat.WATER_DEFENSE,
	Stat.LIGHTNING_DEFENSE,
	Stat.AIR_DEFENSE
]);

const GATHERER_PASSIVE_STATS = new Set<Stat>([
	Stat.MAX_HP,
	Stat.HP_REGEN,
	Stat.ARMOR,
	Stat.EVASION,
	Stat.SUPER_EVASION,
	Stat.FIRE_DEFENSE,
	Stat.WOOD_DEFENSE,
	Stat.WATER_DEFENSE,
	Stat.LIGHTNING_DEFENSE,
	Stat.AIR_DEFENSE
]);

const EXPLORER_PASSIVE_STATS = new Set<Stat>([
	Stat.MAX_HP,
	Stat.HP_REGEN,
	Stat.INITIATIVE,
	Stat.SPEED,
	Stat.FIRE_SPEED,
	Stat.WOOD_SPEED,
	Stat.WATER_SPEED,
	Stat.LIGHTNING_SPEED,
	Stat.AIR_SPEED,
	Stat.EVASION,
	Stat.SUPER_EVASION,
	Stat.ARMOR,
	Stat.FIRE_DEFENSE,
	Stat.WOOD_DEFENSE,
	Stat.WATER_DEFENSE,
	Stat.LIGHTNING_DEFENSE,
	Stat.AIR_DEFENSE
]);

function getPassiveRoleBonus(item: ItemFiche, role: BotDinozRole): number {
	if (!item.passiveEffect) return 0;

	const relevantStats =
		role === BotDinozRole.FIGHTER
			? FIGHTER_PASSIVE_STATS
			: role === BotDinozRole.GATHERER
				? GATHERER_PASSIVE_STATS
				: EXPLORER_PASSIVE_STATS;
	const relevantEffectCount = Object.keys(item.passiveEffect).filter(stat => relevantStats.has(stat as Stat)).length;
	if (relevantEffectCount === 0) return 15;

	return 55 + relevantEffectCount * 45;
}

export function getBotEquipmentScore(item: ItemFiche, role: BotDinozRole): number {
	if (!item.canBeEquipped || item.itemType === ItemType.MAGICAL) return Number.NEGATIVE_INFINITY;

	let score = role === BotDinozRole.GATHERER ? 0 : 5;
	score += getPassiveRoleBonus(item, role);

	if (item.fightCondition) {
		score +=
			role === BotDinozRole.FIGHTER
				? 45
				: role === BotDinozRole.EXPLORER
					? 20
					: -15;
	}

	if (item.effect?.category === ItemEffect.HEAL) {
		score +=
			role === BotDinozRole.EXPLORER
				? 40
				: role === BotDinozRole.FIGHTER
					? 25
					: 10;
	}

	if (role === BotDinozRole.FIGHTER && item.priority) {
		score += Math.min(25, item.priority * 5);
	}

	return score;
}

export async function findBotEquipCandidate(
	dinozId: number,
	role: BotDinozRole | null = null
): Promise<{ itemId: number; score: number } | null> {
	const dinoz = await getDinozEquipItemRequest(dinozId);
	if (!dinoz || !dinoz.user) return null;
	if (dinoz.items.length >= backpackSlot(dinoz.user.engineer, dinoz)) return null;

	const effectiveRole = role ?? BotDinozRole.FIGHTER;
	const equipped = new Set(dinoz.items.map(item => item.itemId));

	const candidates = dinoz.user.items
		.filter(entry => entry.quantity > 0 && !equipped.has(entry.itemId))
		.map(entry => Object.values(itemList).find(item => item.itemId === entry.itemId))
		.filter((item): item is NonNullable<typeof item> => Boolean(item))
		.map(item => ({
			itemId: item.itemId,
			score: getBotEquipmentScore(item, effectiveRole)
		}))
		.filter(candidate => candidate.score >= BOT_MIN_EQUIPMENT_SCORE[effectiveRole])
		.sort((a, b) => b.score - a.score || a.itemId - b.itemId);

	return candidates[0] ?? null;
}

export async function equipBotDinoz(userId: string, dinozId: number): Promise<boolean> {
	const role = await getOrAssignBotDinozRole(userId, dinozId);
	const candidate = await findBotEquipCandidate(dinozId, role);
	if (!candidate) return false;

	await equipDinozItem({
		userId,
		dinozId,
		itemId: candidate.itemId,
		equip: true
	});
	return true;
}

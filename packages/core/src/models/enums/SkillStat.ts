/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/enums/SkillStat.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-01-20 through 2026-04-24.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export enum Stat {
	MAX_HP = 'maxHp',
	HP_REGEN = 'hpRegen',
	MAX_FOLLOWERS = 'maxFollowers',
	ENERGY = 'energy',
	ENERGY_RECOVERY = 'energyRecovery',
	// Elements
	FIRE_ELEMENT = 'fireElement',
	WOOD_ELEMENT = 'woodElement',
	WATER_ELEMENT = 'waterElement',
	LIGHTNING_ELEMENT = 'lightningElement',
	AIR_ELEMENT = 'airElement',
	// Speeds
	SPEED = 'speed',
	FIRE_SPEED = 'fireSpeed',
	WOOD_SPEED = 'woodSpeed',
	WATER_SPEED = 'waterSpeed',
	LIGHTNING_SPEED = 'lightningSpeed',
	AIR_SPEED = 'airSpeed',
	// VOID_SPEED = 'voidSpeed',
	// Defenses
	FIRE_DEFENSE = 'fireDefense',
	WOOD_DEFENSE = 'woodDefense',
	WATER_DEFENSE = 'waterDefense',
	LIGHTNING_DEFENSE = 'lightningDefense',
	AIR_DEFENSE = 'airDefense',
	// Assaults
	FIRE_ASSAULT = 'fireAssault',
	WATER_ASSAULT = 'waterAssault',
	AIR_ASSAULT = 'airAssault',
	LIGHTNING_ASSAULT = 'lightningAssault',
	WOOD_ASSAULT = 'woodAssault',
	INITIATIVE = 'initiative',
	// Armors
	ARMOR = 'armor',
	// FIRE_ARMOR = 'fireArmor',
	// WOOD_ARMOR = 'woodArmor',
	// WATER_ARMOR = 'waterArmor',
	// LIGHTNING_ARMOR = 'lightningArmor',
	// AIR_ARMOR = 'airArmor',
	// VOID_ARMOR = 'voidArmor',
	// Armor Ignores
	ARMOR_BREAK = 'armorBreak',
	// ASSAULT_IGNORE_ARMOR = 'assaultIgnoreArmor',
	// FIRE_IGNORE_ARMOR = 'fireIgnoreArmor',
	// WOOD_IGNORE_ARMOR = 'woodIgnoreArmor',
	// WATER_IGNORE_ARMOR = 'waterIgnoreArmor',
	// LIGHTNING_IGNORE_ARMOR = 'lightningIgnoreArmor',
	// AIR_IGNORE_ARMOR = 'airIgnoreArmor',
	// VOID_IGNORE_ARMOR = 'voidIgnoreArmor',
	// Counters
	COUNTER = 'counter',
	// FIRE_COUNTER = 'fireCounter',
	// WOOD_COUNTER = 'woodCounter',
	// WATER_COUNTER = 'waterCounter',
	// LIGHTNING_COUNTER = 'lightningCounter',
	// AIR_COUNTER = 'airCounter',
	// VOID_COUNTER = 'voidCounter',
	// Evasions
	EVASION = 'evasion',
	// FIRE_EVASION = 'fireEvasion',
	// WOOD_EVASION = 'woodEvasion',
	// WATER_EVASION = 'waterEvasion',
	// LIGHTNING_EVASION = 'lightningEvasion',
	// AIR_EVASION = 'airEvasion',
	// VOID_EVASION = 'voidEvasion',
	// Super evasions
	SUPER_EVASION = 'superEvasion',
	// FIRE_SUPER_EVASION = 'fireSuperEvasion',
	// WOOD_SUPER_EVASION = 'woodSuperEvasion',
	// WATER_SUPER_EVASION = 'waterSuperEvasion',
	// LIGHTNING_SUPER_EVASION = 'lightningSuperEvasion',
	// AIR_SUPER_EVASION = 'airSuperEvasion',
	// VOID_SUPER_EVASION = 'voidSuperEvasion',
	// Multihits
	MULTIHIT = 'multihit',
	// FIRE_MULTIHIT = 'fireMultihit',
	// WOOD_MULTIHIT = 'woodMultihit',
	// WATER_MULTIHIT = 'waterMultihit',
	// LIGHTNING_MULTIHIT = 'lightningMultihit',
	// AIR_MULTIHIT = 'airMultihit',
	// VOID_MULTIHIT = 'voidMultihit'
	CRITICAL_HIT_CHANCE = 'criticalHitChance',
	CRITICAL_HIT_BONUS = 'criticalHitBonus'
}

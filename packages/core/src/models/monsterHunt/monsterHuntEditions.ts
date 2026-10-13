import { Item } from '../items/itemList.js';
import { MonsterHuntEditionConfig, MonsterHuntLootRarity } from './monsterHunt.js';

export const DARK_WORLD_INVASION_MONSTER_HUNT: MonsterHuntEditionConfig = {
	slug: 'dark-world-invasion',
	name: 'event.monsterHunt.name',
	nameKey: 'event.monsterHunt.edition.darkWorldInvasion.name',
	/**
	 * Progressive encounter reduction starts after this amount
	 * of hunt monsters defeated by the same player during the day.
	 *
	 * This does not prevent the player from continuing to hunt.
	 */
	softCap: 100,
	monsters: [
		{
			monsterKey: 'marca2',
			lootKey: 'dark_boar_tusk',
			nameKey: 'event.monsterHunt.loot.darkBoarTusk',
			icon: 'hunt_dark_boar_tusk',
			points: 5,
			rarity: MonsterHuntLootRarity.COMMON,
			dropRateBps: 7000,
			spawnWeight: 100,
			globalSpawn: true
		},
		{
			monsterKey: 'megou2',
			lootKey: 'dark_spore',
			nameKey: 'event.monsterHunt.loot.darkSpore',
			icon: 'hunt_dark_spore',
			points: 5,
			rarity: MonsterHuntLootRarity.COMMON,
			dropRateBps: 6500,
			spawnWeight: 90,
			globalSpawn: true
		},
		{
			monsterKey: 'megaw2',
			lootKey: 'mega_wolf_fang',
			nameKey: 'event.monsterHunt.loot.megaWolfFang',
			icon: 'hunt_mega_wolf_fang',
			points: 25,
			rarity: MonsterHuntLootRarity.UNCOMMON,
			dropRateBps: 5000,
			spawnWeight: 70,
			globalSpawn: true
		},
		{
			monsterKey: 'pirao3',
			lootKey: 'pirhanos_tooth',
			nameKey: 'event.monsterHunt.loot.pirhanosTooth',
			icon: 'hunt_pirhanos_tooth',
			points: 25,
			rarity: MonsterHuntLootRarity.UNCOMMON,
			dropRateBps: 4500,
			spawnWeight: 65,
			globalSpawn: true
		},
		{
			monsterKey: 'garou2',
			lootKey: 'werezore_claw',
			nameKey: 'event.monsterHunt.loot.werezoreClaw',
			icon: 'hunt_werezore_claw',
			points: 50,
			rarity: MonsterHuntLootRarity.RARE,
			dropRateBps: 3500,
			spawnWeight: 45,
			globalSpawn: true
		},
		{
			monsterKey: 'amanp3',
			lootKey: 'amenpenne_feather',
			nameKey: 'event.monsterHunt.loot.amenpenneFeather',
			icon: 'hunt_amenpenne_feather',
			points: 50,
			rarity: MonsterHuntLootRarity.RARE,
			dropRateBps: 3000,
			spawnWeight: 40,
			globalSpawn: true
		},
		{
			monsterKey: 'mimic3',
			lootKey: 'cursed_mimic_fragment',
			nameKey: 'event.monsterHunt.loot.cursedMimicFragment',
			icon: 'hunt_cursed_mimic_fragment',
			points: 100,
			rarity: MonsterHuntLootRarity.VERY_RARE,
			dropRateBps: 2000,
			spawnWeight: 20,
			globalSpawn: true
		}
	],
	rewardTiers: [
		{
			points: 500,
			rewards: [
				{
					type: 'ITEM',
					itemId: Item.POTION_IRMA,
					quantity: 5
				}
			]
		},
		{
			points: 1000,
			rewards: [
				{
					type: 'ITEM',
					itemId: Item.HOT_BREAD,
					quantity: 2
				}
			]
		},
		{
			points: 1500,
			rewards: [
				{
					type: 'ITEM',
					itemId: Item.HOT_BREAD,
					quantity: 2
				},
				{
					type: 'ITEM',
					itemId: Item.POTION_ANGEL,
					quantity: 3
				},
				{
					type: 'ITEM',
					itemId: Item.POTION_IRMA,
					quantity: 10
				}
			]
		},
		{
			points: 2000,
			rewards: [
				{
					type: 'ITEM',
					itemId: Item.LAND_OF_ASHES,
					quantity: 1
				},
				{
					type: 'ITEM',
					itemId: Item.ABYSS,
					quantity: 1
				},
				{
					type: 'ITEM',
					itemId: Item.AMAZON,
					quantity: 1
				},
				{
					type: 'ITEM',
					itemId: Item.ST_ELMAS_FIRE,
					quantity: 1
				},
				{
					type: 'ITEM',
					itemId: Item.UVAVU,
					quantity: 1
				}
			]
		},
		{
			points: 3000,
			rewards: [
				{
					type: 'ITEM',
					itemId: Item.TICTAC_TICKET,
					quantity: 1
				},
				{
					type: 'ITEM',
					itemId: Item.CHRISTMAS_TICKET,
					quantity: 1
				}
			]
		},
		{
			points: 4000,
			rewards: [
				{
					type: 'ITEM',
					itemId: Item.DEMON_TICKET,
					quantity: 200
				}
			]
		},
		{
			points: 5000,
			rewards: [
				{
					type: 'ITEM',
					itemId: Item.GOLDEN_NAPODINO,
					quantity: 1
				}
			]
		}
	]
} as const;

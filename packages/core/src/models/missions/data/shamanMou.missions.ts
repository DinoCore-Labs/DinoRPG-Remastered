import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const SHAMAN_GROUP = 'shaman';

const shamanValidateGoal = () => ({
	type: 'VALIDATE' as const,
	npcKey: 'shaman_mou',
	place: PlaceEnum.FOSSELAVE,
	nameKey: 'npc.shamanMou.name'
});

export const shamanMouMissions: MissionDefinition[] = [
	{
		key: 'init1',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.init1.name',
		beginKey: 'missions.shaman.init1.begin',
		endKey: 'missions.shaman.init1.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'inspect_ashpouk_inscriptions',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.shaman.init1.inspect.name',
				descriptionKey: 'missions.shaman.init1.inspect.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.UNIVERSITE,
				hidden: true,
				titleKey: 'missions.shaman.init1.dictionary.title'
			},
			{
				type: 'ACTION',
				actionKey: 'find_ashpouk_dictionary',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.shaman.init1.dictionary.name',
				descriptionKey: 'missions.shaman.init1.dictionary.text'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'decipher_ashpouk_inscriptions',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.shaman.init1.decipher.name',
				descriptionKey: 'missions.shaman.init1.decipher.text'
			},
			shamanValidateGoal()
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {},
		limit: 20
	},
	{
		key: 'init2',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.init2.name',
		beginKey: 'missions.shaman.init2.begin',
		endKey: 'missions.shaman.init2.end',
		condition: 'mission(init1)',
		goals: [
			{ type: 'AT', place: PlaceEnum.REPAIRE_DU_VENERABLE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['barche'],
					count: 1,
					force: true,
					displayNameKey: 'missions.shaman.init2.kill.barche'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'collect_barche_claws',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.shaman.init2.claws.name',
				descriptionKey: 'missions.shaman.init2.claws.text'
			},
			{ type: 'AT', place: PlaceEnum.FORGES_DU_GTC, hidden: false },
			{
				type: 'TALK',
				npcKey: 'gtc_blacksmith',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.init2.blacksmith.name',
				textKey: 'missions.shaman.init2.blacksmith.text'
			},
			{
				type: 'KILL',
				kill: {
					count: 6,
					force: false,
					displayNameKey: 'missions.shaman.init2.kill.wave'
				}
			},
			{
				type: 'TALK',
				npcKey: 'gtc_forge_guard',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.init2.forgeGuard.name',
				textKey: 'missions.shaman.init2.forgeGuard.text'
			},
			{
				type: 'KILL',
				kill: {
					count: 6,
					force: false,
					displayNameKey: 'missions.shaman.init2.kill.wave'
				}
			},
			{
				type: 'TALK',
				npcKey: 'gtc_forge_guard',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.init2.forgeGuard.name',
				textKey: 'missions.shaman.init2.forgeGuard.text2'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'EFFECT', effectKey: 'amulst' },
			{ type: 'XP', value: 60 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'burn',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.burn.name',
		beginKey: 'missions.shaman.burn.begin',
		endKey: 'missions.shaman.burn.end',
		condition: 'mission(init2)',
		goals: [
			{ type: 'AT', place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['flam'],
					count: 3,
					force: true,
					displayNameKey: 'missions.shaman.burn.kill.flam'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'inspect_ashes',
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				nameKey: 'missions.shaman.burn.inspectAshes.name',
				descriptionKey: 'missions.shaman.burn.inspectAshes.text'
			},
			{ type: 'AT', place: PlaceEnum.FORGES_DU_GTC, hidden: true },
			{
				type: 'TALK',
				npcKey: 'gtc_forge_artisan',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.burn.artisan.name',
				textKey: 'missions.shaman.burn.artisan.text'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'sniff_fried_smell',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.shaman.burn.sniff.name',
				descriptionKey: 'missions.shaman.burn.sniff.text'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['flam'],
					count: 5,
					force: true,
					displayNameKey: 'missions.shaman.burn.kill.flam'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'search_flame_source',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.shaman.burn.search.name',
				descriptionKey: 'missions.shaman.burn.search.text'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 2000 },
			{ type: 'XP', value: 40 }
		],
		labels: {},
		limit: 10
	},
	{
		key: 'barbec',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.barbec.name',
		beginKey: 'missions.shaman.barbec.begin',
		endKey: 'missions.shaman.barbec.end',
		condition: 'mission(burn)',
		goals: [
			{ type: 'AT', place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'collect_dry_branch',
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				nameKey: 'missions.shaman.barbec.branch.name',
				descriptionKey: 'missions.shaman.barbec.branch.text'
			},
			{ type: 'AT', place: PlaceEnum.REPAIRE_DU_VENERABLE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'steal_scale_from_venerable',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.shaman.barbec.stealScale.name',
				descriptionKey: 'missions.shaman.barbec.stealScale.text'
			},
			{
				type: 'ACTION',
				actionKey: 'search_broken_scales',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.shaman.barbec.searchBrokenScales.name',
				descriptionKey: 'missions.shaman.barbec.searchBrokenScales.text'
			},
			{
				type: 'ACTION',
				actionKey: 'inspect_venerable_entrance',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.shaman.barbec.inspectEntrance.name',
				descriptionKey: 'missions.shaman.barbec.inspectEntrance.text'
			},
			{ type: 'AT', place: PlaceEnum.PENTES_DE_BASALTE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'search_yellow_basalt',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.shaman.barbec.basalt.name',
				descriptionKey: 'missions.shaman.barbec.basalt.text'
			},
			{ type: 'AT', place: PlaceEnum.FORGES_DU_GTC, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'grind_barbecue_ingredients',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.barbec.grind.name',
				descriptionKey: 'missions.shaman.barbec.grind.text'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'use_barbecue_mix',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.shaman.barbec.mix.name',
				descriptionKey: 'missions.shaman.barbec.mix.text'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'ITEM', itemKey: 'sos_flame', quantity: 1 },
			{ type: 'XP', value: 40 }
		],
		labels: {},
		limit: 15
	},
	{
		key: 'joke',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.joke.name',
		beginKey: 'missions.shaman.joke.begin',
		endKey: 'missions.shaman.joke.end',
		condition: 'mission(init2)',
		goals: [
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'collect_fish_remains',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.shaman.joke.fish.name',
				descriptionKey: 'missions.shaman.joke.fish.text'
			},
			{ type: 'AT', place: PlaceEnum.UNIVERSITE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'trap_professor_office',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.shaman.joke.trap.name',
				descriptionKey: 'missions.shaman.joke.trap.text'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 1500 },
			{ type: 'XP', value: 30 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'defend',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.defend.name',
		beginKey: 'missions.shaman.defend.begin',
		endKey: 'missions.shaman.defend.end',
		condition: 'mission(init2)',
		goals: [
			{ type: 'AT', place: PlaceEnum.FORGES_DU_GTC, hidden: false },
			{
				type: 'TALK',
				npcKey: 'gtc_forge_guard',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.defend.forgeGuard.name',
				textKey: 'missions.shaman.defend.forgeGuard.text'
			},
			{
				type: 'KILL',
				kill: {
					count: 15,
					force: false,
					displayNameKey: 'missions.shaman.defend.kill.wave'
				}
			},
			{
				type: 'TALK',
				npcKey: 'gtc_forge_guard',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.defend.forgeGuard.name',
				textKey: 'missions.shaman.defend.forgeGuard.text2'
			},
			{ type: 'AT', place: PlaceEnum.PENTES_DE_BASALTE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'gtc_forge_scout',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.shaman.defend.scout.name',
				textKey: 'missions.shaman.defend.scout.text'
			},
			{
				type: 'KILL',
				kill: {
					count: 5,
					force: false,
					displayNameKey: 'missions.shaman.defend.kill.wave'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'pick_war_banner',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.shaman.defend.banner.name',
				descriptionKey: 'missions.shaman.defend.banner.text'
			},
			{ type: 'AT', place: PlaceEnum.FORGES_DU_GTC, hidden: false },
			{
				type: 'TALK',
				npcKey: 'gtc_forge_guard',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.shaman.defend.forgeGuard.name',
				textKey: 'missions.shaman.defend.forgeGuard.text3'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'ITEM', itemKey: 'hot_bread', quantity: 1 },
			{ type: 'GOLD', value: 4000 },
			{ type: 'XP', value: 60 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'shipmt',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.shipmt.name',
		beginKey: 'missions.shaman.shipmt.begin',
		endKey: 'missions.shaman.shipmt.end',
		condition: 'mission(defend)',
		goals: [
			{ type: 'AT', place: PlaceEnum.PENTES_DE_BASALTE, hidden: true },
			{
				type: 'TALK',
				npcKey: 'dinoville_courier',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.shaman.shipmt.courier.name',
				textKey: 'missions.shaman.shipmt.courier.text'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goblin'],
					count: 4,
					force: true,
					displayNameKey: 'missions.shaman.shipmt.kill'
				}
			},
			{
				type: 'TALK',
				npcKey: 'dinoville_courier',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.shaman.shipmt.courier.name',
				textKey: 'missions.shaman.shipmt.courier.text2'
			},
			{
				type: 'ACTION',
				actionKey: 'pick_up_empty_package',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.shaman.shipmt.package.name',
				descriptionKey: 'missions.shaman.shipmt.package.text'
			},
			{
				type: 'TALK',
				npcKey: 'dinoville_courier',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.shaman.shipmt.courier.name',
				textKey: 'missions.shaman.shipmt.courier.text3'
			},
			{ type: 'AT', place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'hear_suspicious_noises',
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				nameKey: 'missions.shaman.shipmt.noises.name',
				descriptionKey: 'missions.shaman.shipmt.noises.text'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goblin'],
					count: 6,
					force: true,
					displayNameKey: 'missions.shaman.shipmt.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'recover_shaman_powders',
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				nameKey: 'missions.shaman.shipmt.goods.name',
				descriptionKey: 'missions.shaman.shipmt.goods.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'dinoville_courier',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.shaman.shipmt.courier.name',
				textKey: 'missions.shaman.shipmt.courier.text4'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'ITEM', itemKey: 'potion_angel', quantity: 1 },
			{ type: 'GOLD', value: 1000 },
			{ type: 'XP', value: 25 }
		],
		labels: {},
		limit: 10
	},
	{
		key: 'sales',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.sales.name',
		beginKey: 'missions.shaman.sales.begin',
		endKey: 'missions.shaman.sales.end',
		condition: 'mission(init2)',
		goals: [
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'collect_tourist_trinkets',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.shaman.sales.collect.name',
				descriptionKey: 'missions.shaman.sales.collect.text'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'sell_trinkets_in_dinoville',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.shaman.sales.sell.name',
				descriptionKey: 'missions.shaman.sales.sell.text'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 3500 },
			{ type: 'XP', value: 20 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'ritual',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.ritual.name',
		beginKey: 'missions.shaman.ritual.begin',
		endKey: 'missions.shaman.ritual.end',
		condition: 'mission(init2)',
		goals: [
			{
				type: 'ACTION',
				actionKey: 'take_ritual_instructions',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.shaman.ritual.instructions.name',
				descriptionKey: 'missions.shaman.ritual.instructions.text'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goblin'],
					count: 1,
					force: true,
					zone: 1,
					displayNameKey: 'missions.shaman.ritual.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'read_ritual_instructions',
				nameKey: 'missions.shaman.ritual.read.name',
				descriptionKey: 'missions.shaman.ritual.read.text'
			},
			{
				type: 'ACTION',
				actionKey: 'shout_shamana_mana',
				nameKey: 'missions.shaman.ritual.shamana.name',
				descriptionKey: 'missions.shaman.ritual.shamana.text'
			},
			{ type: 'AT', place: PlaceEnum.REPAIRE_DU_VENERABLE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goblin'],
					count: 3,
					force: true,
					displayNameKey: 'missions.shaman.ritual.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'shout_donga_donga',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.shaman.ritual.donga.name',
				descriptionKey: 'missions.shaman.ritual.donga.text'
			},
			{ type: 'AT', place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goblin'],
					count: 3,
					force: true,
					displayNameKey: 'missions.shaman.ritual.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'shout_waaah',
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				nameKey: 'missions.shaman.ritual.waaah.name',
				descriptionKey: 'missions.shaman.ritual.waaah.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'throw_stone_in_crater',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.shaman.ritual.crater.name',
				descriptionKey: 'missions.shaman.ritual.crater.text'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 1500 },
			{ type: 'ITEM', itemKey: 'little_pepper', quantity: 1 },
			{ type: 'XP', value: 50 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'hiero',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.hiero.name',
		beginKey: 'missions.shaman.hiero.begin',
		endKey: 'missions.shaman.hiero.end',
		condition: 'mission(init2)+mission(defend)+mission(barbec)',
		goals: [
			{ type: 'AT', place: PlaceEnum.GORGES_PROFONDES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'copy_deep_gorges_hieroglyphs',
				place: PlaceEnum.GORGES_PROFONDES,
				nameKey: 'missions.shaman.hiero.copy.name',
				descriptionKey: 'missions.shaman.hiero.copy.text'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'ITEM', itemKey: 'cloud_burger', quantity: 1 },
			{ type: 'XP', value: 20 }
		],
		labels: {},
		limit: 6
	},
	{
		key: 'pigeon',
		group: SHAMAN_GROUP,
		nameKey: 'missions.shaman.pigeon.name',
		beginKey: 'missions.shaman.pigeon.begin',
		endKey: 'missions.shaman.pigeon.end',
		condition: 'mission(hiero)',
		goals: [
			{ type: 'AT', place: PlaceEnum.UNIVERSITE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'professor_eugene',
				npcNameKey: 'npc.eugene.name',
				gfx: 'professor',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'npc.shaman.pigeon.eugene.name',
				textKey: 'npc.shaman.pigeon.eugene.text'
			},
			{ type: 'AT', place: PlaceEnum.ILE_WAIKIKI, hidden: false },
			{
				type: 'TALK',
				npcKey: 'doctor_yolande',
				place: PlaceEnum.ILE_WAIKIKI,
				nameKey: 'missions.shaman.pigeon.yolande.name',
				textKey: 'missions.shaman.pigeon.yolande.text'
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'find_pelletee_in_forcebrut',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.shaman.pigeon.findPelletee.name',
				descriptionKey: 'missions.shaman.pigeon.findPelletee.text'
			},
			{ type: 'AT', place: PlaceEnum.GORGES_PROFONDES, hidden: false },
			{
				type: 'TALK',
				npcKey: 'pelletee',
				place: PlaceEnum.GORGES_PROFONDES,
				nameKey: 'missions.shaman.pigeon.pelletee.name',
				textKey: 'missions.shaman.pigeon.pelletee.text'
			},
			shamanValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 5500 },
			{ type: 'ITEM', itemKey: 'hot_bread', quantity: 1 },
			{ type: 'XP', value: 100 }
		],
		labels: {},
		limit: 20
	}
];

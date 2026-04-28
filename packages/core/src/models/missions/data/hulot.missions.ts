import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const HULOT_GROUP = 'hulot';

const hulotValidateGoal = () =>
	({
		type: 'VALIDATE' as const,
		npcKey: 'nicolas_hulot',
		place: PlaceEnum.AUREE_DE_LA_FORET,
		nameKey: 'npc.nicolasHulot.name'
	}) as const;

export const hulotMissions: MissionDefinition[] = [
	{
		key: 'seqact',
		group: HULOT_GROUP,
		nameKey: 'missions.hulot.seqact.name',
		beginKey: 'missions.hulot.seqact.begin',
		endKey: 'missions.hulot.seqact.end',
		condition: '!mission(toxic)|mission(hucure)',
		goals: [
			{ type: 'AT', place: PlaceEnum.CHEMIN_GLAUQUE, hidden: false },
			{
				type: 'KILL',
				kill: {
					count: 6,
					force: false,
					displayNameKey: 'missions.hulot.seqact.kill'
				}
			},
			hulotValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 1500 },
			{ type: 'XP', value: 40 }
		],
		labels: {},
		limit: 10
	},
	{
		key: 'toxic',
		group: HULOT_GROUP,
		nameKey: 'missions.hulot.toxic.name',
		beginKey: 'missions.hulot.toxic.begin',
		endKey: 'missions.hulot.toxic.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.CHEMIN_GLAUQUE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'pick_figonicia_furonclee',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.hulot.toxic.figonicia.name',
				descriptionKey: 'missions.hulot.toxic.figonicia.text'
			},
			{ type: 'AT', place: PlaceEnum.COLLINES_HANTEES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'pick_purulente_noire',
				place: PlaceEnum.COLLINES_HANTEES,
				nameKey: 'missions.hulot.toxic.purulente.name',
				descriptionKey: 'missions.hulot.toxic.purulente.text'
			},
			{ type: 'AT', place: PlaceEnum.FLEUVE_JUMIN, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'pick_visqueuse_des_boues',
				place: PlaceEnum.FLEUVE_JUMIN,
				nameKey: 'missions.hulot.toxic.visqueuse.name',
				descriptionKey: 'missions.hulot.toxic.visqueuse.text'
			},
			hulotValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 1500 },
			{ type: 'XP', value: 20 }
		],
		labels: {},
		limit: 15
	},
	{
		key: 'map',
		group: HULOT_GROUP,
		nameKey: 'missions.hulot.map.name',
		beginKey: 'missions.hulot.map.begin',
		endKey: 'missions.hulot.map.end',
		condition: '!mission(toxic)|mission(hucure)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.COLLINES_HANTEES,
				hidden: false,
				titleKey: 'missions.hulot.map.highPoint.title'
			},
			{
				type: 'ACTION',
				actionKey: 'draw_grumhel_map',
				place: PlaceEnum.COLLINES_HANTEES,
				nameKey: 'missions.hulot.map.draw.name',
				descriptionKey: 'missions.hulot.map.draw.text'
			},
			{
				type: 'ACTION',
				actionKey: 'catch_teasing_bat',
				place: PlaceEnum.COLLINES_HANTEES,
				nameKey: 'missions.hulot.map.catch.name',
				descriptionKey: 'missions.hulot.map.catch.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				hidden: false,
				titleKey: 'missions.hulot.map.findBat.title'
			},
			{
				type: 'ACTION',
				actionKey: 'find_teasing_bat',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.hulot.map.bat.name',
				descriptionKey: 'missions.hulot.map.bat.text'
			},
			{
				type: 'ACTION',
				actionKey: 'throw_stone_at_bat',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.hulot.map.stone.name',
				descriptionKey: 'missions.hulot.map.stone.text'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['bat'],
					count: 1,
					force: true,
					displayNameKey: 'missions.hulot.map.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'pick_notebook',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.hulot.map.notebook.name',
				descriptionKey: 'missions.hulot.map.notebook.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.COLLINES_HANTEES,
				hidden: false,
				titleKey: 'missions.hulot.map.back.title'
			},
			{
				type: 'ACTION',
				actionKey: 'finish_grumhel_map',
				place: PlaceEnum.COLLINES_HANTEES,
				nameKey: 'missions.hulot.map.finish.name',
				descriptionKey: 'missions.hulot.map.finish.text'
			},
			hulotValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 2500 },
			{ type: 'XP', value: 60 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'hucure',
		group: HULOT_GROUP,
		nameKey: 'missions.hulot.hucure.name',
		beginKey: 'missions.hulot.hucure.begin',
		endKey: 'missions.hulot.hucure.end',
		condition: 'mission(toxic)',
		goals: [
			{
				type: 'ACTION',
				actionKey: 'take_toxic_plants',
				place: PlaceEnum.AUREE_DE_LA_FORET,
				nameKey: 'missions.hulot.hucure.plants.name',
				descriptionKey: 'missions.hulot.hucure.plants.text'
			},
			{ type: 'AT', place: PlaceEnum.CHUTES_MUTANTES, hidden: false },
			{
				type: 'TALK',
				npcKey: 'mutant_monk_doctor',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.hulot.hucure.monk.name',
				textKey: 'missions.hulot.hucure.monk.text'
			},
			{ type: 'AT', place: PlaceEnum.MINES_DE_CORAIL, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'pick_coral_piece',
				place: PlaceEnum.MINES_DE_CORAIL,
				nameKey: 'missions.hulot.hucure.coral.name',
				descriptionKey: 'missions.hulot.hucure.coral.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.CHUTES_MUTANTES,
				hidden: false,
				titleKey: 'missions.hulot.hucure.backCoral.title'
			},
			{
				type: 'TALK',
				npcKey: 'mutant_monk_doctor',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.hulot.hucure.monk.name',
				textKey: 'missions.hulot.hucure.monk.text2'
			},
			{ type: 'AT', place: PlaceEnum.CHEMIN_GLAUQUE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon'],
					count: 4,
					force: true,
					displayNameKey: 'missions.hulot.hucure.korgon.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'collect_korgon_fangs',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.hulot.hucure.fangs.name',
				descriptionKey: 'missions.hulot.hucure.fangs.text'
			},
			{ type: 'AT', place: PlaceEnum.FLEUVE_JUMIN, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['bat'],
					count: 5,
					force: true,
					displayNameKey: 'missions.hulot.hucure.bat.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'collect_bat_wings',
				place: PlaceEnum.FLEUVE_JUMIN,
				nameKey: 'missions.hulot.hucure.wings.name',
				descriptionKey: 'missions.hulot.hucure.wings.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.CHUTES_MUTANTES,
				hidden: false,
				titleKey: 'missions.hulot.hucure.backIngredients.title'
			},
			{
				type: 'TALK',
				npcKey: 'mutant_monk_doctor',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.hulot.hucure.monk.name',
				textKey: 'missions.hulot.hucure.monk.text3'
			},
			{
				type: 'ACTION',
				actionKey: 'take_antidote_crate',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.hulot.hucure.antidote.name',
				descriptionKey: 'missions.hulot.hucure.antidote.text'
			},
			hulotValidateGoal()
		],
		rewards: [
			{ type: 'ITEM', itemKey: 'potion_angel', quantity: 1 },
			{ type: 'XP', value: 60 }
		],
		labels: {},
		limit: 25
	},
	{
		key: 'bckpck',
		group: HULOT_GROUP,
		nameKey: 'missions.hulot.bckpck.name',
		beginKey: 'missions.hulot.bckpck.begin',
		endKey: 'missions.hulot.bckpck.end',
		condition: 'mission(hucure)+mission(map)',
		goals: [
			{ type: 'AT', place: PlaceEnum.CHUTES_MUTANTES, hidden: false },
			{
				type: 'TALK',
				npcKey: 'extreme_fisher',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.hulot.bckpck.extremeFisher.name',
				textKey: 'missions.hulot.bckpck.extremeFisher.text'
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'TALK',
				npcKey: 'seaweed_collector',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.hulot.bckpck.seaweedCollector.name',
				textKey: 'missions.hulot.bckpck.seaweedCollector.text'
			},
			{ type: 'AT', place: PlaceEnum.MINES_DE_CORAIL, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'question_coral_miners',
				place: PlaceEnum.MINES_DE_CORAIL,
				nameKey: 'missions.hulot.bckpck.miners.name',
				descriptionKey: 'missions.hulot.bckpck.miners.text'
			},
			{
				type: 'TALK',
				npcKey: 'resting_miner',
				place: PlaceEnum.MINES_DE_CORAIL,
				nameKey: 'missions.hulot.bckpck.restingMiner.name',
				textKey: 'missions.hulot.bckpck.restingMiner.text'
			},
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'busy_fisher',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.hulot.bckpck.busyFisher.name',
				textKey: 'missions.hulot.bckpck.busyFisher.text'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'find_sewing_material',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.hulot.bckpck.sewingMaterial.name',
				descriptionKey: 'missions.hulot.bckpck.sewingMaterial.text'
			},
			{
				type: 'TALK',
				npcKey: 'seamstress',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.hulot.bckpck.seamstress.name',
				textKey: 'missions.hulot.bckpck.seamstress.text'
			},
			{ type: 'AT', place: PlaceEnum.FOUTAINE_DE_JOUVENCE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['coq'],
					count: 2,
					force: true,
					displayNameKey: 'missions.hulot.bckpck.coq.kill'
				}
			},
			{
				type: 'AT',
				place: PlaceEnum.DINOVILLE,
				hidden: false,
				titleKey: 'missions.hulot.bckpck.backDinoville.title'
			},
			{
				type: 'TALK',
				npcKey: 'seamstress',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.hulot.bckpck.seamstress.name',
				textKey: 'missions.hulot.bckpck.seamstress.text2'
			},
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'busy_fisher',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.hulot.bckpck.busyFisher.name',
				textKey: 'missions.hulot.bckpck.busyFisher.text2'
			},
			hulotValidateGoal()
		],
		rewards: [
			{ type: 'EFFECT', effectKey: 'bckpck' },
			{ type: 'XP', value: 40 }
		],
		labels: {},
		limit: 20
	}
];

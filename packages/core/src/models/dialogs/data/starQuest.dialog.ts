import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

const strangeBeingPnj = {
	image: false,
	gfx: 'alien',
	frame: 'speak',
	background: '1'
};

export const starquestIntroDialog: DialogDefinition = {
	id: 'starquest_intro',
	name: 'npc.strangeBeing.name',
	place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
	cond: parseCondition('scenario(star,0)+(admin()|time(30))+active(starquest)'),
	pnj: strangeBeingPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.strangeBeing.dialog.intro.begin',
			next: ['yes', 'no']
		},
		no: {
			id: 'no',
			text: 'npc.strangeBeing.dialog.intro.no',
			fast: true
		},
		yes: {
			id: 'yes',
			text: 'npc.strangeBeing.dialog.intro.yes',
			next: ['nothing']
		},
		nothing: {
			id: 'nothing',
			text: 'npc.strangeBeing.dialog.intro.nothing',
			next: ['dom']
		},
		dom: {
			id: 'dom',
			text: 'npc.strangeBeing.dialog.intro.dom',
			next: ['star']
		},
		star: {
			id: 'star',
			text: 'npc.strangeBeing.dialog.intro.star',
			next: ['how']
		},
		how: {
			id: 'how',
			text: 'npc.strangeBeing.dialog.intro.how',
			next: ['ah']
		},
		ah: {
			id: 'ah',
			text: 'npc.strangeBeing.dialog.intro.ah',
			effects: [
				{
					type: 'scenario',
					scenario: 'star',
					phase: 1
				}
			]
		}
	},
	links: {
		yes: {
			id: 'yes',
			text: 'npc.strangeBeing.choice.yes'
		},
		no: {
			id: 'no',
			text: 'npc.strangeBeing.choice.no'
		},
		nothing: {
			id: 'nothing',
			text: 'npc.strangeBeing.choice.nothing'
		},
		dom: {
			id: 'dom',
			text: 'npc.strangeBeing.choice.dom'
		},
		star: {
			id: 'star',
			text: 'npc.strangeBeing.choice.star'
		},
		how: {
			id: 'how',
			text: 'npc.strangeBeing.choice.how'
		},
		ah: {
			id: 'ah',
			text: 'npc.strangeBeing.choice.ah'
		}
	}
};

export const starquestMegawolfHintDialog: DialogDefinition = {
	id: 'starquest_megawolf_hint',
	name: 'npc.strangeBeing.name',
	place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
	cond: parseCondition('scenario(star,1)'),
	pnj: strangeBeingPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.strangeBeing.dialog.megawolfHint.begin',
			next: ['et']
		},
		et: {
			id: 'et',
			text: 'npc.strangeBeing.dialog.megawolfHint.et'
		}
	},
	links: {
		et: {
			id: 'et',
			text: 'npc.strangeBeing.choice.et'
		}
	}
};

export const starquestProgressHintDialog: DialogDefinition = {
	id: 'starquest_progress_hint',
	name: 'npc.strangeBeing.name',
	place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
	cond: parseCondition('scenario(star,2+)+!scenario(star,8+)'),
	pnj: strangeBeingPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.strangeBeing.dialog.progressHint.begin',
			next: ['star2', 'star3', 'star4', 'star5', 'star6', 'star7']
		},
		star2: {
			id: 'star2',
			text: 'npc.strangeBeing.dialog.progressHint.star2',
			next: ['end']
		},
		star3: {
			id: 'star3',
			text: 'npc.strangeBeing.dialog.progressHint.star3',
			next: ['end']
		},
		star4: {
			id: 'star4',
			text: 'npc.strangeBeing.dialog.progressHint.star4',
			next: ['end']
		},
		star5: {
			id: 'star5',
			text: 'npc.strangeBeing.dialog.progressHint.star5',
			next: ['end']
		},
		star6: {
			id: 'star6',
			text: 'npc.strangeBeing.dialog.progressHint.star6',
			next: ['end']
		},
		star7: {
			id: 'star7',
			text: 'npc.strangeBeing.dialog.progressHint.star7',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.strangeBeing.dialog.progressHint.end'
		}
	},
	links: {
		star2: {
			id: 'star2',
			text: 'npc.strangeBeing.choice.listen',
			cond: parseCondition('scenario(star,2)')
		},
		star3: {
			id: 'star3',
			text: 'npc.strangeBeing.choice.listen',
			cond: parseCondition('scenario(star,3)')
		},
		star4: {
			id: 'star4',
			text: 'npc.strangeBeing.choice.listen',
			cond: parseCondition('scenario(star,4)')
		},
		star5: {
			id: 'star5',
			text: 'npc.strangeBeing.choice.listen',
			cond: parseCondition('scenario(star,5)')
		},
		star6: {
			id: 'star6',
			text: 'npc.strangeBeing.choice.listen',
			cond: parseCondition('scenario(star,6)')
		},
		star7: {
			id: 'star7',
			text: 'npc.strangeBeing.choice.listen',
			cond: parseCondition('scenario(star,7)')
		},
		end: {
			id: 'end',
			text: 'npc.strangeBeing.choice.end'
		}
	}
};

export const starquestFinalDialog: DialogDefinition = {
	id: 'starquest_final',
	name: 'npc.strangeBeing.name',
	place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
	cond: parseCondition('scenario(star,8)'),
	pnj: strangeBeingPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.strangeBeing.dialog.final.begin',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.strangeBeing.dialog.final.ok',
			next: ['give']
		},
		give: {
			id: 'give',
			text: 'npc.strangeBeing.dialog.final.give',
			fast: true,
			special: [
				{
					type: 'useItem',
					itemId: Item.MAGIC_STAR,
					count: 7
				}
			],
			effects: [
				{
					type: 'collection',
					collection: 'plume'
				},
				{
					type: 'giveItem',
					itemId: Item.GOLDEN_NAPODINO,
					count: 1
				},
				{
					type: 'scenario',
					scenario: 'star',
					phase: 9
				}
			]
		}
	},
	links: {
		ok: {
			id: 'ok',
			text: 'common.dots'
		},
		give: {
			id: 'give',
			text: 'npc.strangeBeing.choice.giveStars'
		}
	}
};

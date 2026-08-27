import { type TutorialObjective, type TutorialObjectiveKey, tutorialObjectiveKeys } from './tutorial.js';

export const tutorialObjectives: Record<TutorialObjectiveKey, TutorialObjective> = {
	dinoz: {
		id: 'dinoz',
		validation: {
			type: 'event',
			event: 'DINOZ_ADOPTED'
		},
		begin: {
			url: 'shop/dinoz',
			fast: false
		},
		end: {},
		helpers: [
			{
				id: 'compare',
				selector: '#detail_0',
				url: 'shop/dinoz'
			},
			{
				id: 'name',
				selector: '.naming input',
				url: 'dinoz/*'
			}
		],
		rewards: [],
		next: 'speak'
	},
	speak: {
		id: 'speak',
		validation: {
			type: 'event',
			event: 'GUIDE_MICHEL_SPOKEN'
		},
		begin: {
			url: 'dino/*/!act',
			fast: false
		},
		end: {
			url: 'dino/*/'
		},
		helpers: [
			{
				id: 'dinoz',
				selector: '#accountList ul li:first'
			},
			{
				id: 'answers',
				selector: '#answer',
				url: 'dinoz/*/dialog/guide'
			},
			{
				id: 'michel',
				selector: '[data-tutorial-action="dialog:guide"]',
				url: 'dinoz/*'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 100
			}
		],
		next: 'move'
	},
	move: {
		id: 'move',
		validation: {
			type: 'condition',
			condition: {
				type: 'uvar',
				key: 'moves',
				value: 1,
				compare: 'gte'
			}
		},
		begin: {
			url: 'dino/*'
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'map',
				selector: '#boxMap',
				cond: {
					type: 'tab',
					key: 'map'
				}
			},
			{
				id: 'combat',
				selector: '.content',
				url: 'fight/*'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'port'
	},
	port: {
		id: 'port',
		validation: {
			type: 'condition',
			condition: {
				type: 'position',
				key: 'port'
			}
		},
		begin: {
			url: 'dino/**'
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'map',
				selector: '#boxMap',
				cond: {
					type: 'tab',
					key: 'map'
				}
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'irma',
				quantity: 1
			}
		],
		next: 'pub'
	},
	pub: {
		id: 'pub',
		validation: {
			type: 'condition',
			condition: {
				type: 'scenario',
				key: 'intro',
				progression: 2,
				compare: 'gte'
			}
		},
		begin: {
			url: 'dino/*'
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'pilier',
				selector: '[data-tutorial-action="dialog:intro__2"]',
				url: 'dinoz/*'
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'irma',
				quantity: 1
			}
		],
		next: 'baobob'
	},
	baobob: {
		id: 'baobob',
		cond: {
			type: 'scenario',
			key: 'intro',
			progression: 2,
			compare: 'gte'
		},
		validation: {
			type: 'condition',
			condition: {
				type: 'scenario',
				key: 'intro',
				progression: 6,
				compare: 'gte'
			}
		},
		begin: {
			visible: false
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'intro4',
				selector: '[data-tutorial-action="dialog:intro__4"]',
				url: 'dinoz/*'
			},
			{
				id: 'intro5',
				selector: '[data-tutorial-action="dialog:intro__5"]',
				url: 'dinoz/*'
			},
			{
				id: 'intro6',
				selector: '[data-tutorial-action="dialog:intro__6"]',
				url: 'dinoz/*'
			},
			{
				id: 'intro7',
				selector: '[data-tutorial-action="dialog:intro__7"]',
				url: 'dinoz/*'
			},
			{
				id: 'levelup',
				selector: '#act_levelup',
				url: 'dinoz/*'
			},
			{
				id: 'skill',
				selector: '.levelUp .select',
				url: 'level/*'
			},
			{
				id: 'heal',
				selector: '.inventory table',
				cond: {
					type: 'life',
					value: 20,
					compare: 'lte'
				},
				url: 'dinoz/*'
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'irma',
				quantity: 1
			}
		],
		next: 'papy'
	},
	papy: {
		id: 'papy',
		validation: {
			type: 'condition',
			condition: {
				type: 'or',
				left: {
					type: 'mission',
					key: 'fish',
					status: {
						type: 'current'
					}
				},
				right: {
					type: 'mission',
					key: 'dog',
					status: {
						type: 'current'
					}
				}
			}
		},
		begin: {
			url: 'dino/*'
		},
		end: {},
		helpers: [
			{
				id: 'dinoz',
				selector: '#accountList ul li:first'
			},
			{
				id: 'map',
				selector: '#boxMap',
				url: 'dinoz/*'
			},
			{
				id: 'papy',
				selector: '[data-tutorial-action="dialog:papy"]',
				url: 'dinoz/*'
			},
			{
				id: 'mission',
				selector: 'tr.available',
				url: 'dinoz/*/missions/*'
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'angel',
				quantity: 1
			}
		],
		next: 'shop'
	},
	shop: {
		id: 'shop',
		validation: {
			type: 'condition',
			condition: {
				type: 'uvar',
				key: 'sbuyer',
				value: 1,
				compare: 'gte'
			}
		},
		begin: {},
		end: {},
		helpers: [
			{
				id: 'shop',
				selector: '[data-tutorial="shop"]'
			},
			{
				id: 'burger',
				selector: '#burger',
				url: 'shop/*'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'burger'
	},
	burger: {
		id: 'burger',
		validation: {
			type: 'condition',
			condition: {
				type: 'uvar',
				key: 'healpv',
				value: 1,
				compare: 'gte'
			}
		},
		begin: {},
		end: {},
		helpers: [
			{
				id: 'burger',
				selector: '[data-tutorial-item-use="burger"]',
				url: 'dinoz/*'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'clan'
	},
	clan: {
		id: 'clan',
		validation: {
			type: 'event',
			event: 'CLAN_PAGE_VISITED'
		},
		begin: {},
		end: {},
		helpers: [
			{
				id: 'clan',
				selector: '[data-tutorial="clan"]'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'user'
	},
	user: {
		id: 'user',
		validation: {
			type: 'event',
			event: 'ACCOUNT_PAGE_VISITED'
		},
		begin: {
			url: '!user'
		},
		end: {},
		helpers: [
			{
				id: 'account',
				selector: '[data-tutorial="account"]'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'end'
	},
	end: {
		id: 'end',
		validation: {
			type: 'event',
			event: 'TUTORIAL_FINISHED'
		},
		begin: {},
		end: {},
		helpers: [],
		rewards: [
			{
				type: 'gold',
				amount: 1000
			}
		]
	}
};

export function getTutorialObjective(progression: number): TutorialObjective | null {
	const key = tutorialObjectiveKeys[progression];
	return key ? tutorialObjectives[key] : null;
}

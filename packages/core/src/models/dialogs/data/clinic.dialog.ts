import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

// Scénario clinique, issu des 9 premiers dialogues de xml/fr/dialogs/infirmiere.xml.
// Les soins et la chirurgie (dixième dialogue MT) seront intégrés dans une étape dédiée.

export const clinicAnnaIntroDialog = defineDialog({
	id: 'clinic_anna_intro',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.clinic.nurseName',
	cond: parseCondition('scenario(clinik,0)+fx(plaza)+(admin()|active(clinik))'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'infirmiere',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.clinic.dialog.intro.begin',
			next: ['salut'],
			fast: true
		},
		salut: {
			id: 'salut',
			text: 'npc.clinic.dialog.intro.salut',
			next: ['aide', 'beat']
		},
		aide: {
			id: 'aide',
			text: 'npc.clinic.dialog.intro.aide',
			next: ['blabla', 'info']
		},
		info: {
			id: 'info',
			text: 'npc.clinic.dialog.intro.info',
			next: ['bref']
		},
		blabla: {
			id: 'blabla',
			text: 'npc.clinic.dialog.intro.blabla',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.clinic.dialog.intro.end',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 1 }]
		},
		quit: {
			id: 'quit',
			text: 'npc.clinic.dialog.intro.quit',
			next: []
		}
	},
	links: {
		salut: {
			id: 'salut',
			text: 'npc.clinic.choice.intro.salut',
			target: 'salut'
		},
		aide: {
			id: 'aide',
			text: 'npc.clinic.choice.intro.aide',
			target: 'aide'
		},
		beat: {
			id: 'beat',
			text: 'npc.clinic.choice.intro.beat',
			target: 'quit'
		},
		blabla: {
			id: 'blabla',
			text: 'npc.clinic.choice.intro.blabla',
			target: 'blabla'
		},
		info: {
			id: 'info',
			text: 'npc.clinic.choice.intro.info',
			target: 'info'
		},
		bref: {
			id: 'bref',
			text: 'npc.clinic.choice.intro.bref',
			target: 'aide'
		},
		end: {
			id: 'end',
			text: 'npc.clinic.choice.intro.end',
			target: 'end'
		}
	},
	inject: []
});

export const clinicEugeneInjectionDialog = defineDialog({
	id: 'clinic_eugene',
	place: PlaceEnum.UNIVERSITE,
	name: 'npc.clinic.eugeneName',
	cond: parseCondition('scenario(clinik,1)'),
	first: 'avis',
	pnj: {
		image: false,
		gfx: 'professor',
		frame: 'speak',
		background: '1'
	},
	phases: {
		avis: {
			id: 'avis',
			text: 'npc.clinic.dialog.eugene.avis',
			next: ['non']
		},
		non: {
			id: 'non',
			text: 'npc.clinic.dialog.eugene.non',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.clinic.dialog.eugene.end',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 2 }]
		}
	},
	links: {
		avis: {
			id: 'avis',
			text: 'npc.clinic.choice.eugene.avis',
			target: 'avis'
		},
		non: {
			id: 'non',
			text: 'npc.clinic.choice.eugene.non',
			target: 'non'
		},
		end: {
			id: 'end',
			text: 'npc.clinic.choice.eugene.end',
			target: 'end'
		}
	},
	inject: [{ dialogId: 'professor_eugene', phaseId: 'talk', linkIds: ['avis'] }]
});

export const clinicMichelInjectionDialog = defineDialog({
	id: 'clinic_michel',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.clinic.michelName',
	cond: parseCondition('scenario(clinik,2)'),
	first: 'avis',
	pnj: {
		image: false,
		gfx: 'michel',
		frame: 'speak',
		background: '1'
	},
	phases: {
		avis: {
			id: 'avis',
			text: 'npc.clinic.dialog.michel.avis',
			next: ['super']
		},
		super: {
			id: 'super',
			text: 'npc.clinic.dialog.michel.super',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 3 }]
		}
	},
	links: {
		avis: {
			id: 'avis',
			text: 'npc.clinic.choice.michel.avis',
			target: 'avis'
		},
		super: {
			id: 'super',
			text: 'npc.clinic.choice.michel.super',
			target: 'super'
		}
	},
	inject: [{ dialogId: 'guide', phaseId: 'begin', linkIds: ['avis'] }]
});

export const clinicWineSellerDialog = defineDialog({
	id: 'clinic_wine_seller',
	place: PlaceEnum.DINOPLAZA,
	name: 'npc.clinic.sellerName',
	cond: parseCondition('scenario(clinik,3)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'sommelier',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.clinic.dialog.sommelier.begin',
			next: ['ou']
		},
		ou: {
			id: 'ou',
			text: 'npc.clinic.dialog.sommelier.ou',
			next: ['et', 'oue']
		},
		oue: {
			id: 'oue',
			text: 'npc.clinic.dialog.sommelier.oue',
			next: ['truc']
		},
		truc: {
			id: 'truc',
			text: 'npc.clinic.dialog.sommelier.truc',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.clinic.dialog.sommelier.end',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 4 }]
		},
		quit: {
			id: 'quit',
			text: 'npc.clinic.dialog.sommelier.quit',
			next: []
		}
	},
	links: {
		ou: {
			id: 'ou',
			text: 'npc.clinic.choice.sommelier.ou',
			target: 'ou'
		},
		et: {
			id: 'et',
			text: 'npc.clinic.choice.sommelier.et',
			target: 'quit'
		},
		oue: {
			id: 'oue',
			text: 'npc.clinic.choice.sommelier.oue',
			target: 'oue'
		},
		truc: {
			id: 'truc',
			text: 'npc.clinic.choice.sommelier.truc',
			target: 'truc'
		},
		end: {
			id: 'end',
			text: 'npc.clinic.choice.sommelier.end',
			target: 'end'
		}
	},
	inject: []
});

export const clinicAnnaReturnDialog = defineDialog({
	id: 'clinic_anna_return',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.clinic.name',
	cond: parseCondition('scenario(clinik,4)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'infirmiere',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.clinic.dialog.return.begin',
			next: ['suite']
		},
		suite: {
			id: 'suite',
			text: 'npc.clinic.dialog.return.suite',
			next: ['vin']
		},
		vin: {
			id: 'vin',
			text: 'npc.clinic.dialog.return.vin',
			next: ['end', 'end2']
		},
		end: {
			id: 'end',
			text: 'npc.clinic.dialog.return.end',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 5 }]
		}
	},
	links: {
		suite: {
			id: 'suite',
			text: 'npc.clinic.choice.return.suite',
			target: 'suite'
		},
		vin: {
			id: 'vin',
			text: 'npc.clinic.choice.return.vin',
			target: 'vin'
		},
		end: {
			id: 'end',
			text: 'npc.clinic.choice.return.end',
			target: 'end'
		},
		end2: {
			id: 'end2',
			text: 'npc.clinic.choice.return.end2',
			target: 'end'
		}
	},
	inject: []
});

export const clinicAnnaSiteDialog = defineDialog({
	id: 'clinic_anna_site',
	place: PlaceEnum.CLINIQUE,
	name: 'npc.clinic.name',
	cond: parseCondition('scenario(clinik,5)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'infirmiere',
		frame: 'speak',
		background: '2'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.clinic.dialog.site.begin',
			next: ['cool']
		},
		cool: {
			id: 'cool',
			text: 'npc.clinic.dialog.site.cool',
			next: ['snif']
		},
		snif: {
			id: 'snif',
			text: 'npc.clinic.dialog.site.snif',
			next: ['dinoz']
		},
		dinoz: {
			id: 'dinoz',
			text: 'npc.clinic.dialog.site.dinoz',
			next: ['voir']
		},
		voir: {
			id: 'voir',
			text: 'npc.clinic.dialog.site.voir',
			next: ['merci']
		},
		merci: {
			id: 'merci',
			text: 'npc.clinic.dialog.site.merci',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 6 }]
		}
	},
	links: {
		cool: {
			id: 'cool',
			text: 'npc.clinic.choice.site.cool',
			target: 'cool'
		},
		snif: {
			id: 'snif',
			text: 'npc.clinic.choice.site.snif',
			target: 'snif'
		},
		dinoz: {
			id: 'dinoz',
			text: 'npc.clinic.choice.site.dinoz',
			target: 'dinoz'
		},
		voir: {
			id: 'voir',
			text: 'npc.clinic.choice.site.voir',
			target: 'voir'
		},
		merci: {
			id: 'merci',
			text: 'npc.clinic.choice.site.merci',
			target: 'merci'
		}
	},
	inject: []
});

export const clinicAnnaFinishedDialog = defineDialog({
	id: 'clinic_anna_finished',
	place: PlaceEnum.CLINIQUE,
	name: 'npc.clinic.name',
	cond: parseCondition('clanact(hopita)+scenario(clinik,6)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'infirmiere',
		frame: 'speak',
		background: '2'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.clinic.dialog.finished.begin',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.clinic.dialog.finished.ok',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 7 }]
		}
	},
	links: {
		ok: {
			id: 'ok',
			text: 'npc.clinic.choice.finished.ok',
			target: 'ok'
		}
	},
	inject: []
});

export const clinicAnnaOpeningDialog = defineDialog({
	id: 'clinic_anna_opening',
	place: PlaceEnum.CLINIQUE,
	name: 'npc.clinic.name',
	cond: parseCondition('clanact(hopita)+scenario(clinik,7)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'infirmiere',
		frame: 'speak',
		background: '3'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.clinic.dialog.opening.begin',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.clinic.dialog.opening.ok',
			next: ['merci']
		},
		merci: {
			id: 'merci',
			text: 'npc.clinic.dialog.opening.merci',
			next: [],
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 8 }]
		}
	},
	links: {
		ok: {
			id: 'ok',
			text: 'npc.clinic.choice.opening.ok',
			target: 'ok'
		},
		merci: {
			id: 'merci',
			text: 'npc.clinic.choice.opening.merci',
			target: 'merci'
		}
	},
	inject: []
});

export const clinicAnnaNewClanDialog = defineDialog({
	id: 'clinic_anna_new_clan',
	place: PlaceEnum.CLINIQUE,
	name: 'npc.clinic.name',
	cond: parseCondition('!clanact(hopita)+scenario(clinik,7+)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'infirmiere',
		frame: 'speak',
		background: '3'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.clinic.dialog.lost.begin',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.clinic.dialog.lost.end',
			next: [],
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 6 }]
		}
	},
	links: {
		end: {
			id: 'end',
			text: 'npc.clinic.choice.lost.end',
			target: 'end'
		}
	},
	inject: []
});

import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

/**
 * Dixième dialogue du XML Motion Twin `dialogs/infirmiere.xml`.
 * `offre` commence un soin de 1 h sans consommer d'action Dinoz.
 * `swait(clinik,20)` limite les débuts de soin à un par tranche de 20 h.
 * Les missions `infirmiere` et la chirurgie seront ajoutées séparément.
 */
export const clinicAnnaServicesDialog = defineDialog({
	id: 'clinic_anna_services',
	place: PlaceEnum.CLINIQUE,
	name: 'npc.clinic.name',
	cond: parseCondition('active(clinik)+clanact(hopita)+scenario(clinik,8+)'),
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
			text: 'npc.clinic.dialog.services.begin',
			next: ['offre', 'offre2', 'offre3']
		},
		soinok: {
			id: 'soinok',
			text: 'npc.clinic.dialog.services.soinok',
			next: [],
			special: [{ type: 'status', status: 'soin' }],
			effects: [{ type: 'clinicTreatment' }]
		},
		soinok2: {
			id: 'soinok2',
			text: 'npc.clinic.dialog.services.soinok2',
			next: ['offre'],
			effects: [{ type: 'scenario', scenario: 'clinik', phase: 8 }]
		},
		soinko: {
			id: 'soinko',
			text: 'npc.clinic.dialog.services.soinko',
			next: []
		}
	},
	links: {
		offre: {
			id: 'offre',
			text: 'npc.clinic.choice.services.offre',
			target: 'soinok',
			cond: parseCondition('scenario(clinik,8)'),
			confirm: true
		},
		offre2: {
			id: 'offre2',
			text: 'npc.clinic.choice.services.offre',
			target: 'soinok2',
			cond: parseCondition('scenario(clinik,9)+swait(clinik,20)')
		},
		offre3: {
			id: 'offre3',
			text: 'npc.clinic.choice.services.offre',
			target: 'soinko',
			cond: parseCondition('scenario(clinik,9)+!swait(clinik,20)')
		}
	}
});

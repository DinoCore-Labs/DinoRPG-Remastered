import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { defineDialog } from '../defineDialog.js';

const requestOfficePnj = {
	image: false,
	gfx: 'hogan',
	frame: 'speak',
	background: '1'
};

export const requestOfficeDialog = defineDialog({
	id: 'request_office',
	place: PlaceEnum.AVANT_POSTE_ROCKY,
	name: 'npc.requestOffice.name',
	first: 'begin',
	pnj: requestOfficePnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.requestOffice.dialog.begin',
			next: ['missions'],
			fast: true
		},
		missions: {
			id: 'missions',
			text: '',
			special: [
				{
					type: 'missions',
					group: 'dquest'
				}
			]
		}
	},
	links: {
		missions: {
			id: 'missions',
			text: 'npc.requestOffice.choice.missions'
		}
	}
});

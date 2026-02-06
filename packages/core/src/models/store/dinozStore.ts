import { DinozFiche } from '../dinoz/dinozFiche.js';

export interface DinozStore {
	dinozList: DinozFiche[];
	currentDinozId?: number;
}

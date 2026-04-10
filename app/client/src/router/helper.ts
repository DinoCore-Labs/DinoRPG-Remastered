import type { RouteLocationNormalized } from 'vue-router';

import { dinozStore } from '../store/dinozStore';

export function requireOwnedDinozByParam(paramName: 'id' | 'dinozId') {
	return (to: RouteLocationNormalized) => {
		const dinoz = dinozStore();
		const dinozId = Number(to.params[paramName]);

		if (!Number.isInteger(dinozId) || dinozId <= 0) {
			return { name: 'NewsPage' };
		}

		const ownsDinoz = dinoz.dinozList.some(currentDinoz => currentDinoz.id === dinozId);

		if (!ownsDinoz) {
			return { name: 'NewsPage' };
		}

		return true;
	};
}

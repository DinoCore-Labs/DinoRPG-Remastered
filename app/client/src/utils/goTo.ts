import type { RouteLocationNamedRaw, Router } from 'vue-router';

export const goTo = (router: Router, page: string, props?: RouteLocationNamedRaw) => {
	router.push({ name: page, ...props });
};

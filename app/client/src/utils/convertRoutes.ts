import type { RouteRecord } from '@dinorpg/core/models/router/Router';
import type { RouteRecordRaw } from 'vue-router';

export function convertRoutes(routes: RouteRecord[]): RouteRecordRaw[] {
	return routes.map(route => convertSingleRoute(route));
}

function convertSingleRoute(route: RouteRecord): RouteRecordRaw {
	const result: RouteRecordRaw = {
		path: route.path,
		name: route.name,
		component: route.component,
		meta: route.meta
	};

	// redirect si défini
	if (route.redirect) {
		result.redirect = route.redirect as any;
	}

	// children récursif
	if (route.children) {
		result.children = convertRoutes(route.children);
	}

	// beforeEnter si défini
	if (route.beforeEnter) {
		result.beforeEnter = route.beforeEnter;
	}

	return result;
}

export interface RouteRecord {
	path: string;
	name: string;
	component: any;
	meta?: RouteMeta;
	redirect?: { name: string } | string;
	children?: RouteRecord[];
	beforeEnter?: (_to: any, _from: any, next: any) => void;
}

interface RouteMeta {
	authorize: string;
}

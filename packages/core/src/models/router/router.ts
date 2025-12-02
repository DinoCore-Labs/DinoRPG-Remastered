import { UserRole } from '../user/userRole.js';

export interface RouteRecord {
	path: string;
	name: string;
	component: any;
	meta?: RouteMeta;
	redirect?: { name: string } | string;
	children?: RouteRecord[];
	props?: boolean | Record<string, any> | ((route: any) => Record<string, any>);
	beforeEnter?: (_to: any, _from: any, next: any) => void;
}

export interface RouteMeta {
	/** Page publique (accessible sans être connecté) */
	public?: boolean;

	/** Page nécessitant d’être connecté */
	auth?: boolean;

	/** Rôles autorisés */
	roles?: UserRole[];
}

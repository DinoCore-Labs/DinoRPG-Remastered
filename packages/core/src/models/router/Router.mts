import { UserRole } from '../user/UserRole.mjs';

export interface RouteRecord {
	path: string;
	name: string;
	component: any;
	meta?: RouteMeta;
	redirect?: { name: string } | string;
	children?: RouteRecord[];
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

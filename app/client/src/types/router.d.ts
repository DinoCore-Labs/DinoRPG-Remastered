import 'vue-router';

import type { UserRole } from '@dinorpg/core/models/user/userRole.d.ts';

declare module 'vue-router' {
	interface RouteMeta {
		public?: boolean;
		auth?: boolean;
		roles?: UserRole[];
	}
}

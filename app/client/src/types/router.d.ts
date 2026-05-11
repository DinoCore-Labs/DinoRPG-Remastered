import 'vue-router';

import type { UserRole } from '@dinorpg/core/models/user/userRole.js';

declare module 'vue-router' {
	interface RouteMeta {
		public?: boolean;
		auth?: boolean;
		roles?: UserRole[];
	}
}

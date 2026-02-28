/* eslint-disable */
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

import type { ComponentCustomProperties } from 'vue';
import { mixins } from './mixins/mixins';

declare module 'vue' {
	interface ComponentCustomProperties {
		formatContent(value: string): string;
		getImgURL(path: string, imgName: string, pixel?: boolean): string;
		$t: (key: string, options?: Record<string, unknown>) => string;
		$globalConfirm: typeof mixins.methods.$confirm;
		$confirm: typeof mixins.methods.$confirm;
		$refreshGold(): Promise<void>;
		$refreshTreasureTicket(): Promise<void>;
	}
}

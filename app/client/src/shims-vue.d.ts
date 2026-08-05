/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/shims-vue.d.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2025-12-02 through 2026-05-04.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
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
		getImgURL(path: string, imgName: string, pixel?: boolean, animated?: boolean): string;
		$t: (key: string, options?: Record<string, unknown>) => string;
		$globalConfirm: typeof mixins.methods.$confirm;
		$confirm: typeof mixins.methods.$confirm;
		$refreshGold(): Promise<void>;
		$refreshTreasureTicket(): Promise<void>;
	}
}

<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/utils/Toast.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2025-12-02 through 2026-01-20.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<Transition>
		<div v-if="displayToast" class="snackbar" @click="displayToast = !displayToast">
			<template v-if="type === 'error'">{{ $t(`toast.${message}`, params) }}</template>
			<template v-else-if="type === 'success'">{{ $t(`toast.${message}`, params) }}</template>
			<p v-if="type === 'notif'" v-html="formatContent(message)" />
			<p v-if="type === 'reward'" v-html="message" />
		</div>
	</Transition>
</template>

<script lang="ts">
import eventBus from '../../events';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Toast',
	data() {
		return {
			displayToast: false as boolean,
			message: '' as string,
			params: {} as Record<string, unknown>,
			type: undefined as string | undefined,
			value: undefined as undefined | string,
			effect: undefined as undefined | string
		};
	},
	mounted(): void {
		eventBus.on('toast', e => {
			this.message = e.message;
			this.type = e.type;
			this.params = e.params;
			this.displayToast = true;
			this.value = e.value;
			this.effect = e.effect;
			setTimeout(() => {
				if (this.displayToast) this.displayToast = false;
			}, 10000);
		});
	},
	unmounted() {
		eventBus.off('toast');
	}
});
</script>

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

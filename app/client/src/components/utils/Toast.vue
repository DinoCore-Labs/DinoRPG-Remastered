<template>
	<Transition>
		<div v-if="displayToast" class="snackbar" @click="displayToast = !displayToast">
			<template v-if="type === 'error'">{{ $t(`toast.${message}`, params) }}</template>
			<template v-if="type === 'success'">{{ $t(`toast.${message}`, params) }}</template>
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

<style lang="scss" scoped>
.snackbar {
	opacity: 1;
	min-width: 250px; /* Set a default minimum width */
	margin-left: -125px; /* Divide value of min-width by 2 */
	color: #fff; /* White text color */
	text-align: center; /* Centered text */
	border-radius: 2px; /* Rounded borders */
	padding: 16px; /* Padding */
	position: fixed; /* Sit on top of the screen */
	z-index: 1; /* Add a z-index if needed */
	left: 50%; /* Center the snackbar */
	bottom: 30px; /* 30px from the bottom */
	background: rgb(201, 124, 72);
	background: linear-gradient(0deg, rgba(201, 124, 72, 1) 15%, rgba(178, 96, 58, 1) 100%);
	border: 1px solid #8d3e17;
	box-shadow:
		2px 4px 9px 0 rgba(125, 86, 36, 0.5),
		inset 0 0 0 1px #f9c825,
		inset 0 0 4px 1px #8d3e17;
	cursor: pointer;
}

.v-enter-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
	animation: shake 0.5s;
	animation-delay: 0.35s;
}
.v-leave-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
}

.v-enter-from {
	bottom: 0;
	opacity: 0;
}
.v-leave-to {
	bottom: 0;
	opacity: 0;
}
@keyframes shake {
	0% {
		transform: translate(1px, 1px) rotate(0deg);
	}
	10% {
		transform: translate(-1px, -2px) rotate(-1deg);
	}
	20% {
		transform: translate(-3px, 0px) rotate(1deg);
	}
	30% {
		transform: translate(3px, 2px) rotate(0deg);
	}
	40% {
		transform: translate(1px, -1px) rotate(1deg);
	}
	50% {
		transform: translate(-1px, 2px) rotate(-1deg);
	}
	60% {
		transform: translate(-3px, 1px) rotate(0deg);
	}
	70% {
		transform: translate(3px, 1px) rotate(-1deg);
	}
	80% {
		transform: translate(-1px, -1px) rotate(1deg);
	}
	90% {
		transform: translate(1px, 2px) rotate(0deg);
	}
	100% {
		transform: translate(1px, -2px) rotate(-1deg);
	}
}
</style>

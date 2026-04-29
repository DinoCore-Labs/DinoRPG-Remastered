import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
	const pendingRequests = ref(0);
	const isOn = computed(() => pendingRequests.value > 0);
	const isOff = computed(() => pendingRequests.value === 0);
	const setLoaderOn = (): void => {
		pendingRequests.value += 1;
	};
	const setLoaderOff = (): void => {
		pendingRequests.value = Math.max(0, pendingRequests.value - 1);
	};
	const resetLoader = (): void => {
		pendingRequests.value = 0;
	};
	return {
		pendingRequests,
		isOn,
		isOff,
		setLoaderOn,
		setLoaderOff,
		resetLoader
	};
});

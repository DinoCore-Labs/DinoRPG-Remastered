export const clickOutside = {
	beforeMount(el: any, binding: any) {
		el.clickOutsideEvent = function (event: Event) {
			if (!(el === event.target || el.contains(event.target))) {
				binding.value(event);
			}
		};
		document.body.addEventListener('click', el.clickOutsideEvent);
	},
	unmounted(el: any) {
		document.body.removeEventListener('click', el.clickOutsideEvent);
	}
};

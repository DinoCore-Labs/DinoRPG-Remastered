<template>
	<TopBar />
	<div id="dynamic">
		<Transition name="slide">
			<AuthMenu />
		</Transition>
	</div>
	<RouterView />
	<Footer />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TopBar from './components/tools/TopBar.vue';
import Footer from './components/common/Footer.vue';
import AuthMenu from './components/tools/AuthMenu.vue';

export default defineComponent({
	name: 'App',
	components: {
		TopBar,
		AuthMenu,
		Footer
	}
});
</script>

<style lang="scss" scoped>
#dynamic {
	display: flex;
	justify-content: center;
	width: 100%;
	align-items: center;
	position: absolute;
	flex-direction: column;
	gap: 74px;
}
/* Styles pour l'animation slide */
.slide-enter-active,
.slide-leave-active {
	transition: all 0.5s ease;
}
.slide-enter-from,
.slide-leave-to {
	transform: translateX(100%);
}
.slide-enter-to,
.slide-leave-from {
	transform: translateX(0);
}
</style>

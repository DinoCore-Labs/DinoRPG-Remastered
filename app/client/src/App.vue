<template>
	<TopBar />
	<div id="dynamic">
		<AuthMenu />
		<UserMenu />
	</div>
	<RouterView />
	<Footer />
	<Toast />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TopBar from './components/tools/TopBar.vue';
import Footer from './components/common/Footer.vue';
import AuthMenu from './components/tools/AuthMenu.vue';
import UserMenu from './components/tools/UserMenu.vue';
import Toast from './components/utils/Toast.vue';

export default defineComponent({
	name: 'App',
	components: {
		TopBar,
		AuthMenu,
		UserMenu,
		Footer,
		Toast
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
</style>

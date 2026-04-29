<template>
	<TopBar />
	<Spinner />
	<div id="dynamic">
		<LeftUserMenu />
		<AuthMenu />
		<UserMenu />
		<Messaging />
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
import LeftUserMenu from './components/tools/LeftUserMenu.vue';
import Toast from './components/utils/Toast.vue';
import Messaging from './components/modal/Messaging.vue';
import Spinner from './components/utils/Spinner.vue';

export default defineComponent({
	name: 'App',
	components: {
		TopBar,
		LeftUserMenu,
		AuthMenu,
		UserMenu,
		Messaging,
		Footer,
		Toast,
		Spinner
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

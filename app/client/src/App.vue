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
	<EventAnnouncePopup />
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
import EventAnnouncePopup from './components/modal/EventAnnouncePopup.vue';

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
		Spinner,
		EventAnnouncePopup
	},
	mounted() {
		const authToast = sessionStorage.getItem('authToast');
		if (authToast) {
			sessionStorage.removeItem('authToast');
			try {
				const { message, type = 'success' } = JSON.parse(authToast);
				if (type === 'success') {
					this.$toast.success(message);
				} else {
					this.$toast.open({ message, type });
				}
			} catch {
				// ignore
			}
		}
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

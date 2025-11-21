<template>
	<TopBar />
	<RouterView />
	<Footer />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TopBar from './components/tools/TopBar.vue';
import Footer from './components/common/Footer.vue';

export default defineComponent({
	name: 'App',
	components: {
		TopBar,
		Footer
	}
});
</script>

<style lang="scss" scoped></style>

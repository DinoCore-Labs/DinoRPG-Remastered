<template>
	<TopBar />
	<RouterView />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TopBar from './components/tools/TopBar.vue';

export default defineComponent({
	name: 'App',
	components: {
		TopBar
	}
});
</script>

<style lang="scss" scoped></style>

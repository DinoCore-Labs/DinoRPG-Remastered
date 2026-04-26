<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Loading'
});
</script>

<template>
	<div class="spinner"></div>
</template>

<style scoped lang="scss">
.spinner {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	border: 9px solid;
	border-color: #edd2ba;
	border-right-color: #ffb347;
	animation: spinner-d3wgkg 1.4s infinite linear;
}
@keyframes spinner-d3wgkg {
	to {
		transform: rotate(1turn);
	}
}
</style>

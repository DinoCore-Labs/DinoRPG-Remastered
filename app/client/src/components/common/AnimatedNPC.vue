<template>
	<object v-if="NPC !== undefined" class="swf" type="application/x-shockwave-flash" :data="getSWFURL('swf', NPC)">
		<param name="flashvars" :value="flashvars" />
		<embed :src="getSWFURL('swf', NPC)" />
	</object>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'AnimatedNPC',
	props: {
		NPC: String,
		flashvars: String
	}
});
</script>

<style lang="scss" scoped>
.swf {
	float: right;
	position: relative;
	width: 100px;
	height: 100px;
	font-size: 0pt;
	line-height: 0pt;
	border: 1px solid #ffe044;
	background-color: #9a4029;
	padding: 1px;
}
</style>

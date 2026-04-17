<template>
	<Tippy tag="div" class="tab" :class="selected ? 'checked' : ''" @click="$emit('select')">
		<img :src="config.icon" />
	</Tippy>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { RichTextEditorEmoteButtonConfig } from './RichTextEditorConfig';
export default defineComponent({
	name: 'RichTextEditorEmoteButton',
	props: {
		selected: Boolean,
		config: {
			type: Object as PropType<RichTextEditorEmoteButtonConfig>,
			required: true
		}
	},
	emits: ['select']
});
</script>

<style lang="scss" scoped>
.tab {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
	float: left;
	cursor: pointer;
	width: 31px;
	height: 25px;
	margin-right: 4px;
	* {
		z-index: 2;
	}
	&::after {
		// Background of the tab icons
		content: '';
		z-index: 1;
		position: absolute;
		width: 100%;
		height: 100%;
		background: linear-gradient(0deg, #8b3e24 6%, #ae6139 46%, #cb7c49 54%, #cb7c49 94%, #ae6139 96%);
	}
	&.checked,
	&.active,
	&:hover,
	&:focus {
		&::after {
			background: #ffffffbd;
		}
	}
	img {
		max-width: 16px;
		max-height: 16px;
	}
}
</style>

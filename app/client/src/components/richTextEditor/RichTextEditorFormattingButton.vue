<template>
	<button type="button" class="format-button" @click="$emit('click')" :title="title">
		<span>
			<component :is="formatTag">
				<img v-if="type === 'bold'" :src="getImgURL('editor', 'bold')" alt="bold" />
				<img v-else-if="type === 'italic'" :src="getImgURL('editor', 'italic')" alt="italic" />
				<img v-else-if="type === 'bolditalic'" :src="getImgURL('editor', 'bolditalic')" alt="bolditalic" />
				<img v-else-if="type === 'strike'" :src="getImgURL('editor', 'strike')" alt="strike" />
				<img v-else-if="type === 'highlight'" :src="getImgURL('editor', 'highlight')" alt="highlight" />
				<img v-else-if="type === 'blockquote'" :src="getImgURL('editor', 'blockquote')" alt="blockquote" />
				<img v-else-if="type === 'spoiler'" :src="getImgURL('editor', 'spoiler')" alt="spoiler" />
				<img v-else-if="type === 'code'" :src="getImgURL('editor', 'code')" alt="code" />
				<div v-else v-html="label" />
			</component>
		</span>
	</button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
	name: 'RichTextEditorFormattingButton',
	props: {
		type: {
			type: String,
			required: true,
			validator: (value: string) =>
				['bold', 'italic', 'bolditalic', 'strike', 'highlight', 'blockquote', 'spoiler', 'code'].includes(value)
		},
		label: {
			type: String,
			required: true
		},
		title: {
			type: String,
			required: true
		}
	},
	emits: ['click'],
	setup(props) {
		const formatTag = computed(() => {
			switch (props.type) {
				case 'bold':
					return 'strong';
				case 'italic':
					return 'em';
				case 'bolditalic':
					return 'strong';
				case 'strike':
					return 'del';
				default:
					return 'span';
			}
		});
		return {
			formatTag
		};
	}
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
	min-height: 25px;
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
		background: #213578;
	}
	&.checked,
	&.active,
	&:hover,
	&:focus {
		&::after {
			background: rgba(194, 243, 252, 1);
		}
		&.pirated::after {
			// Background of the tab icons
			background: rgba(255, 66, 89, 1);
		}
	}
}
img {
	max-width: 16px;
	max-height: 16px;
}
</style>

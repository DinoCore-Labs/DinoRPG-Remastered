<template>
	<div :class="['disclaimer', { round }]">
		<img v-if="help" :src="getImgURL('icons', 'question', true)" class="icon" />
		<img v-if="timer" :src="getImgURL('icons', 'small_chrono')" class="icon" />
		<div v-html="formatContent($t(content, params))" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DZDisclaimer',
	props: {
		content: {
			type: String,
			required: true
		},
		params: {
			type: Object,
			default: () => ({})
		},
		help: {
			type: Boolean,
			default: false
		},
		timer: {
			type: Boolean,
			default: false
		},
		round: {
			type: Boolean,
			default: false
		}
	}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	display: flex;
	align-items: center;
	margin: 10px;
	padding: 5px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
	&.round {
		border-radius: 8px;
	}
	.icon {
		margin-right: 5px;
	}
}
</style>

<template>
	<Transition>
		<div v-if="textKey" class="modal-background" @click="$emit('close')">
			<div class="box" @click.stop>
				<p class="name">{{ $t(nameKey) }} :</p>

				<div class="content">
					<span class="dialog" v-html="formatContent($t(textKey).toString())" />
					<DZButton class="continue" @click="$emit('close')">
						{{ $t('npc.continue') }}
					</DZButton>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import DZButton from '../utils/DZButton.vue';

export default defineComponent({
	name: 'MissionTalkModal',
	components: {
		DZButton
	},
	props: {
		textKey: {
			type: String,
			required: true
		},
		nameKey: {
			type: String,
			required: true
		}
	},
	emits: ['close']
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
.modal-background {
	position: fixed;
	background: color.adjust(#09092d, $alpha: -0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
	.box {
		cursor: pointer;
		background-repeat: repeat-y;
		max-width: 500px;
		width: 90%;
		min-height: 75px;
		background:
			url('../../assets/background/dialog_top_left.webp'), url('../../assets/background/dialog_top_right.webp'),
			url('../../assets/background/dialog_top_center.webp'), url('../../assets/background/dialog_footer_left.webp'),
			url('../../assets/background/dialog_footer_right.webp'), url('../../assets/background/dialog_footer_center.webp'),
			url('../../assets/background/dialog_center_left.webp'), url('../../assets/background/dialog_center_right.webp'),
			url('../../assets/background/dialog_center_center.webp');
		background-position-x: left, right, center, left, right, center, left, right, center;
		background-position-y: top, top, top, bottom, bottom, bottom, 40px, 40px, 40px;
		background-repeat: no-repeat, no-repeat, repeat-x, no-repeat, no-repeat, repeat-x, repeat-y, repeat-y, repeat;
		padding-right: 5px;
		padding-left: 5px;
		.name {
			margin-left: 15px;
			padding-top: 15px;
			font-variant: small-caps;
			font-weight: bold;
			font-size: 10pt;
			color: #693118;
		}
		.content {
			padding: 1px;
			background-repeat: no-repeat;
			background-position: bottom left;
			overflow: hidden;
			display: flex;
			justify-content: space-between;
			gap: 15px;
			.dialog {
				position: relative;
				margin-bottom: 10px;
				margin-left: 10px;
				color: #fff3b3;
				font-size: 10pt;
				font-style: italic;
			}
			.continue {
				align-self: flex-end;
				margin-right: 10px;
				margin-bottom: 10px;
				flex-shrink: 0;
			}
		}
	}
}
</style>

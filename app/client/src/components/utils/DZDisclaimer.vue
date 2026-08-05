<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/common/DZDisclaimer.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2025-12-02.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
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

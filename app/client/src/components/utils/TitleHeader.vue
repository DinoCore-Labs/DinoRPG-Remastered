<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/utils/TitleHeader.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2025-12-02 through 2026-01-25.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="section" v-if="header">
		<h2 class="titlePage" v-html="header"></h2>
		<h3 class="subTitlePage" width="520" height="27" v-html="subHeader" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'TitleHeader',
	props: {
		title: String,
		header: String,
		subHeader: String
	},
	watch: {
		title: {
			immediate: true,
			handler: function () {
				if (!this.title) return;
				return (document.title = this.title);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.section {
	height: fit-content;
	background-image: url('../../assets/design/title/title_h1.webp');
	background-position: left bottom;
	background-repeat: no-repeat;
	padding-bottom: 2px;
	.titlePage {
		color: #71b703;
		display: inline;
		float: left;
		font-family: 'Berlin Sans FB Demi';
		font-variant: small-caps;
		font-size: 25px;
		text-shadow:
			1px 0px #fdf1bf,
			0px 1px #fdf1bf,
			-1px 0px #fdf1bf,
			0px -1px #fdf1bf,
			0px -1px 2px #b25d21;
		line-height: 28px;
		margin-left: 12px;
	}
	.subTitlePage {
		color: #a5512d;
		display: inline;
		float: left;
		font-family: 'Berlin Sans FB Demi';
		font-variant: small-caps;
		font-size: 19px;
		text-shadow:
			1px 0px #fdf1bf,
			0px 1px #fdf1bf,
			-1px 0px #fdf1bf,
			0px -1px #fdf1bf,
			0px -1px 2px #b25d21;
		line-height: 32px;
		margin-left: 12px;
	}
}
</style>

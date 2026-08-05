<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/utils/Loading.vue

  Copyright in the original contributions remains with the respective
  authors and contributors.

  Modified by DinoRPG Remastered contributors on 2026-04-26.
  See NOTICE.md and the Git history for provenance and modification details.

  SPDX-License-Identifier: AGPL-3.0-or-later
-->
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

<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/common/Flag.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-04-18.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<img :src="getImgURL('lang', `lang_${lang}`)" class="flag" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Flag',
	props: {
		lang: {
			type: String
		}
	}
});
</script>

<style scoped lang="scss"></style>

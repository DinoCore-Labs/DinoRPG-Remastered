<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/clans/ClanPage.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-06-13.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="page">
		<p style="white-space: pre-line; word-break: break-word">{{ page.content }}</p>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { ClanPage } from '@dinorpg/core/models/clan/clanPage.js';
import { ClanService } from '../../services/clan.service.js';
import { errorHandler } from '../../utils/errorHandler.js';

export default defineComponent({
	name: 'ClanPage',
	components: {},
	data() {
		return {
			page: {} as ClanPage
		};
	},
	methods: {
		async getClanPage() {
			try {
				this.page = await ClanService.getClanPage(Number(this.$route.params.pageId));
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async deleteClanPage() {
			try {
				await ClanService.deleteClanPage(Number(this.$route.params.pageId), Number(this.$route.params.id));

				this.$router.push({ name: 'Clan', params: { id: Number(this.$route.params.id) } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	},
	async created() {
		this.getClanPage();
	}
});
</script>

<style lang="scss" scoped>
.page {
	margin: 10px;
}
</style>

<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/clans/ClanMemberEdit.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-06-13 through 2026-07-01.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="wrapper">
		<DZDisclaimer
			help
			v-if="clanMember"
			:content="$t('clan.members.edit.disclaimer', { name: clanMember.user.name })"
		/>
		<div class="panel dz-box">
			<div class="right-line" v-for="right in rights" :key="right.name">
				<DZCheckbox :id="right.name" :label="$t(`clan.members.edit.right.${right.name}`)" v-model="right.selected" />
			</div>
			<DZInput
				v-if="clanMember"
				id="nickname"
				v-model="clanMember.nickname"
				:placeholder="$t('clan.members.edit.nickname')"
			/>
		</div>
		<a class="button" @click="updateClanMember()">{{ $t('clan.members.edit.save') }}</a>
	</div>
</template>

<script lang="ts">
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import type { GetClanMemberResponse } from '@dinorpg/core/models/clan/clanMember.js';
import { defineComponent } from 'vue';
import { ClanService } from '../../services/clan.service.ts';
import { errorHandler } from '../../utils/errorHandler.js';
import DZInput from '../../components/utils/DZInput.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZCheckbox from '../utils/DZCheckbox.vue';

export default defineComponent({
	name: 'ClanMemberEdit',
	components: {
		DZDisclaimer,
		DZInput,
		DZCheckbox
	},
	data() {
		return {
			clanMember: null as GetClanMemberResponse,
			rights: [] as { name: ClanMemberRight; selected: boolean }[]
		};
	},
	methods: {
		async getClanMember(): Promise<void> {
			try {
				this.clanMember = await ClanService.getClanMember(
					Number(this.$route.params.id),
					Number(this.$route.params.memberId)
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async updateClanMember(): Promise<void> {
			if (!this.clanMember) return;

			try {
				this.clanMember.rights = this.rights.filter(r => r.selected).map(r => r.name.toString());
				await ClanService.updateClanMember(Number(this.$route.params.id), this.clanMember);

				this.$toast.open({
					message: this.$t('clan.members.edit.saved'),
					type: 'success'
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		fillRights() {
			this.rights = [];
			if (!this.clanMember) return;
			for (const right of Object.values(ClanMemberRight)) {
				this.rights.push({
					name: right,
					selected: this.clanMember.rights.findIndex(r => r == right) != -1
				});
			}
		}
	},
	async created() {
		await this.getClanMember();
		this.fillRights();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	display: flex;
	flex-direction: column;
	.panel {
		margin: 0 20px;
		padding: 26px 8px 8px 8px;
		color: #ffee92;
		.right-line {
			margin-bottom: 5px;
		}
	}
}
</style>

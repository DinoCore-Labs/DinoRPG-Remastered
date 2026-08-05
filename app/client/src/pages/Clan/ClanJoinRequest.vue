<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/pages/Clan/ClanJoinRequest.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-06-13.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div v-if="joinRequest" class="join-request">
		<p class="request-text">
			{{ $t('clansList.request.info') }}
			<a @click="goToClan(joinRequest.clan.id)" class="clan-name"> {{ joinRequest.clan.name }} </a>.
		</p>
		<DZButton class="cancel-button" @click="cancelRequest(joinRequest)">
			{{ $t('clansList.request.cancel') }}
		</DZButton>
	</div>
</template>

<script setup lang="ts">
import type { JoinClanResponse } from '@dinorpg/core/models/clan/clanJoinRequest.js';
import { useRouter } from 'vue-router';
import { ClanService } from '../../services/clan.service.ts';
import { errorHandler } from '../../utils/errorHandler.ts';
import { useToast } from 'vue-toast-notification';
import DZButton from '../../components/utils/DZButton.vue';

type Props = {
	joinRequest: JoinClanResponse | null | undefined;
};
defineProps<Props>();

const router = useRouter();
const $toast = useToast();

const emit = defineEmits<{
	(e: 'cancel', requestId: number): void;
}>();

const goToClan = (clanId: number) => {
	router.push({ name: 'Clan', params: { id: clanId } });
};
const cancelRequest = async (request: JoinClanResponse) => {
	try {
		await ClanService.denyJoinClanRequest(request.id);
		emit('cancel', request.id);
		//await this.$refreshGold();
	} catch (err) {
		errorHandler.handle(err, $toast);
		return;
	}
};
</script>

<style lang="scss" scoped>
.join-request {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 10px;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px;
	padding-left: 5px;
	padding-left: 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;

	.clan-name {
		color: #fff192;
		cursor: pointer;
		text-decoration: underline;
	}

	.cancel-button {
		flex-shrink: 0;
	}
}
</style>

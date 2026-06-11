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

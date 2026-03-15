<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Status</h3>
				<div class="section">
					<label class="title">Statuts actuels :</label>
					<div v-if="dinoz.status.length > 0" class="statuses">
						<template v-for="entry in dinoz.status" :key="entry.id">
							<Tippy theme="normal" v-if="isDisplayedStatus(entry.statusId)">
								<img
									:src="getImgURL('status', `fx_${getStatusImgName(entry.statusId)}`)"
									:alt="getStatusImgName(entry.statusId)"
								/>
								<template #content>
									<h1 v-html="formatText($t(`status.name.${getStatusNameKey(entry.statusId)}`))" />
									<p v-html="formatText($t(`status.description.${getStatusNameKey(entry.statusId)}`))" />
								</template>
							</Tippy>
							<p v-else>
								{{ getStatusImgName(entry.statusId) }}
							</p>
						</template>
					</div>
					<p v-else>Aucun statut.</p>
				</div>
				<div class="section">
					<label class="title" for="dinozStatuses">Modifier les statuts :</label>
					<div class="statuses-editor">
						<DZSelect id="dinozStatuses" v-model="selectedStatusId" :options="statusOptions" />
						<div class="operations">
							<DZRadio id="statusOperationAdd" name="statusOperation" v-model="statusOperation" value="add">
								Ajouter
							</DZRadio>
							<DZRadio id="statusOperationRemove" name="statusOperation" v-model="statusOperation" value="remove">
								Retirer
							</DZRadio>
						</div>
					</div>
				</div>
				<DZButton type="button" :disabled="selectedStatusId === NO_STATUS" @click="submit"> Sauvegarder </DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import { statusList } from '../../../constants/status';

import { AdminDinozService } from '../../../services/adminDinoz.service';
import { getImgURL } from '../../../utils/getImgURL';
import { formatText } from '../../../utils/formatText';
import DZButton from '../../utils/DZButton.vue';
import DZSelect from '../../utils/DZSelect.vue';
import DZRadio from '../../utils/DZRadio.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const { t } = useI18n();

const NO_STATUS = 0;

const statusOperation = ref<'add' | 'remove'>('add');
const selectedStatusId = ref<number>(NO_STATUS);

const currentStatusIds = computed(() => props.dinoz.status.map(entry => entry.statusId));

const allStatusIds = computed(() => Object.values(statusList.id).sort((a, b) => a - b));

const statusListFiltered = computed(() => {
	if (statusOperation.value === 'add') {
		return allStatusIds.value.filter(statusId => !currentStatusIds.value.includes(statusId));
	}

	return allStatusIds.value.filter(statusId => currentStatusIds.value.includes(statusId));
});

const statusOptions = computed<SelectOption<number>[]>(() => [
	{
		value: NO_STATUS,
		label: 'Sélectionner un statut'
	},
	...statusListFiltered.value.map(statusId => ({
		value: statusId,
		label: String(formatText(t(`status.name.${getStatusNameKey(statusId)}`)))
	}))
]);

watch(statusOperation, () => {
	selectedStatusId.value = NO_STATUS;
});

function isDisplayedStatus(statusId: number) {
	return statusList.displayed[statusId as keyof typeof statusList.displayed] === true;
}

function getStatusImgName(statusId: number) {
	return statusList.imgName[statusId as keyof typeof statusList.imgName] ?? String(statusId);
}

function getStatusNameKey(statusId: number) {
	return String(statusId);
}

async function submit() {
	if (selectedStatusId.value === NO_STATUS) return;

	if (statusOperation.value === 'add') {
		await AdminDinozService.addDinozStatus(props.userId, props.dinoz.id, {
			statusId: selectedStatusId.value
		});
	} else {
		await AdminDinozService.removeDinozStatus(props.userId, props.dinoz.id, {
			statusId: selectedStatusId.value
		});
	}

	selectedStatusId.value = NO_STATUS;
	emit('updated');
}
</script>

<style scoped lang="scss">
.card {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	padding: 5px;
	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
	}
}
.section + .section {
	margin-top: 14px;
}
.title {
	display: block;
	margin-bottom: 6px;
	font-weight: bold;
}
.statuses {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
	img {
		display: block;
		width: 24px;
		height: 24px;
	}
}
.operations {
	display: flex;
	margin-top: 5px;
	gap: 10px;
}
</style>

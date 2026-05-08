<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Scénarios</h3>
				<ul class="scenario-list">
					<li v-for="scenario in user.scenarios" :key="scenario.scenarioKey" class="scenario-row">
						<div class="scenario-info">
							<strong>{{ $t(scenarioLabel(scenario)) }}</strong>
							<span>
								key: {{ scenario.scenarioKey }} · sid: {{ scenario.sid }} · max:
								{{ scenario.maxProgression }}
							</span>
						</div>
						<div class="scenario-progress">
							{{ scenario.progression }} / {{ scenario.maxProgression }}
							<small>tracking: {{ scenario.tracking }}</small>
						</div>
					</li>
				</ul>
				<form class="scenario-form" @submit.prevent="submit">
					<div class="field">
						<label for="scenarioSelect">Scénario</label>
						<DZSelect id="scenarioSelect" v-model="form.scenarioKey" :options="scenarioOptions" />
					</div>
					<div class="field">
						<label for="scenarioProgression">Progression</label>
						<DZInput
							id="scenarioProgression"
							v-model="form.progression"
							type="number"
							min="0"
							:max="selectedScenario?.maxProgression ?? undefined"
						/>
					</div>
					<div class="field">
						<label for="scenarioTracking">Tracking</label>
						<DZInput id="scenarioTracking" v-model="form.tracking" type="number" min="0" />
					</div>
					<DZButton type="submit" :disabled="submitting || !form.scenarioKey">
						{{ submitting ? 'Enregistrement...' : 'Modifier le scénario' }}
					</DZButton>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { AdminUserDetails, AdminUserScenario } from '@dinorpg/core/models/admin/adminUser.js';
import type { ScenarioKey } from '@dinorpg/core/models/scenarios/scenarioList.js';
import { AdminUserService } from '../../../services/adminUsers.service';
import DZButton from '../../utils/DZButton.vue';
import DZInput from '../../utils/DZInput.vue';
import DZSelect, { type SelectOption } from '../../utils/DZSelect.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);
const { t } = useI18n();

const form = reactive({
	scenarioKey: '' as ScenarioKey | '',
	progression: 0,
	tracking: 0
});

const scenarioOptions = computed<SelectOption<ScenarioKey>[]>(() =>
	props.user.scenarios.map(scenario => ({
		value: scenario.scenarioKey as ScenarioKey,
		label: `${t(scenarioLabel(scenario))} (${scenario.scenarioKey})`
	}))
);

const selectedScenario = computed<AdminUserScenario | undefined>(() =>
	props.user.scenarios.find(scenario => scenario.scenarioKey === form.scenarioKey)
);

function scenarioLabel(scenario: AdminUserScenario): string {
	return scenario.nameKey;
}

function fillFromSelectedScenario() {
	if (!selectedScenario.value) {
		return;
	}

	form.progression = selectedScenario.value.progression;
	form.tracking = selectedScenario.value.tracking;
}

watch(
	() => props.user.scenarios,
	scenarios => {
		if (!form.scenarioKey && scenarios.length > 0) {
			form.scenarioKey = scenarios[0].scenarioKey as ScenarioKey;
		}

		fillFromSelectedScenario();
	},
	{ immediate: true, deep: true }
);

watch(
	() => form.scenarioKey,
	() => fillFromSelectedScenario()
);

async function submit() {
	if (!form.scenarioKey) {
		return;
	}

	submitting.value = true;

	try {
		await AdminUserService.updateUserScenario(props.user.id, {
			scenarioKey: form.scenarioKey,
			progression: Number(form.progression),
			tracking: Number(form.tracking)
		});

		emit('updated');
	} finally {
		submitting.value = false;
	}
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
.scenario-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin: 0 0 16px;
	padding: 0;
	list-style: none;
}
.scenario-row {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 10px;
	padding: 6px 8px;
	border: 1px solid #bc683c;
	background: #f3ca92;
}
.scenario-info,
.scenario-progress {
	display: flex;
	flex-direction: column;
	color: #710;
	span,
	small {
		font-size: 8pt;
		opacity: 0.8;
	}
}
.scenario-progress {
	align-items: flex-end;
	font-weight: bold;
}
.scenario-form {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
</style>

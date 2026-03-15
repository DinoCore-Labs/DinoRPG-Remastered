<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Skills</h3>
				<div class="section">
					<label class="title">Skills actuelles :</label>
					<div v-if="dinoz.skills.length > 0" class="skills-list">
						<div v-for="entry in dinoz.skills" :key="entry.id" class="skill-entry">
							<div class="skill-main">
								<span v-if="hasSkill(entry.skillId)">
									{{ t(`skill.name.${getSkillNameKey(entry.skillId)}`) }}
								</span>
								<span v-else class="error-skill"> Unknown skill (ID: {{ entry.skillId }}) </span>
							</div>
							<div class="skill-actions">
								<DZCheckbox
									v-if="isActivatableSkill(entry.skillId)"
									:id="`skill-state-${entry.skillId}`"
									:model-value="entry.state"
									@update:modelValue="onToggleSkill(entry.skillId, $event)"
								>
									Active
								</DZCheckbox>
								<span v-else class="skill-state-fixed">
									{{ entry.state ? 'Active' : 'Inactive' }}
								</span>
								<DZButton type="button" @click="removeSkill(entry.skillId)"> Supprimer </DZButton>
							</div>
						</div>
					</div>
					<p v-else>Aucune skill.</p>
				</div>
				<div class="section">
					<label class="title" for="dinozSkills">Modifier les skills :</label>
					<div class="skills-editor">
						<DZSelect id="dinozSkills" v-model="selectedSkillId" :options="skillOptions" />
						<div class="operations">
							<DZRadio id="skillOperationAdd" name="skillOperation" v-model="skillOperation" value="add">
								Ajouter
							</DZRadio>
							<DZRadio id="skillOperationRemove" name="skillOperation" v-model="skillOperation" value="remove">
								Retirer
							</DZRadio>
						</div>
					</div>
				</div>
				<DZButton type="button" :disabled="selectedSkillId === NO_SKILL" @click="submit"> Sauvegarder </DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';

import { AdminDinozService } from '../../../services/adminDinoz.service';
import DZButton from '../../utils/DZButton.vue';
import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZRadio from '../../utils/DZRadio.vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const { t } = useI18n();

const NO_SKILL = 0;

const skillOperation = ref<'add' | 'remove'>('add');
const selectedSkillId = ref<number>(NO_SKILL);

const currentSkillIds = computed(() => props.dinoz.skills.map(entry => entry.skillId));

const allSkillIds = computed(() =>
	Object.keys(skillList)
		.map(Number)
		.filter(skillId => !Number.isNaN(skillId))
		.sort((a, b) => a - b)
);

const skillListFiltered = computed(() => {
	if (skillOperation.value === 'add') {
		return allSkillIds.value.filter(skillId => !currentSkillIds.value.includes(skillId));
	}

	return allSkillIds.value.filter(skillId => currentSkillIds.value.includes(skillId));
});

const skillOptions = computed<SelectOption<number>[]>(() => [
	{
		value: NO_SKILL,
		label: 'Sélectionner une skill'
	},
	...skillListFiltered.value.map(skillId => ({
		value: skillId,
		label: hasSkill(skillId) ? t(`skill.name.${getSkillNameKey(skillId)}`) : `Unknown skill (#${skillId})`
	}))
]);

watch(skillOperation, () => {
	selectedSkillId.value = NO_SKILL;
});

function hasSkill(skillId: number) {
	return skillId in skillList;
}

function getSkillNameKey(skillId: number) {
	const skill = skillList[skillId as keyof typeof skillList];
	return skill?.name ?? String(skillId);
}

function isActivatableSkill(skillId: number) {
	const skill = skillList[skillId as keyof typeof skillList];
	return skill?.activatable ?? false;
}

async function onToggleSkill(skillId: number, value: boolean | string[]) {
	if (typeof value !== 'boolean') return;

	await AdminDinozService.updateDinozSkillState(props.userId, props.dinoz.id, {
		skillId,
		state: value
	});

	emit('updated');
}

async function removeSkill(skillId: number) {
	await AdminDinozService.removeDinozSkill(props.userId, props.dinoz.id, {
		skillId
	});

	emit('updated');
}

async function submit() {
	if (selectedSkillId.value === NO_SKILL) return;

	if (skillOperation.value === 'add') {
		await AdminDinozService.addDinozSkill(props.userId, props.dinoz.id, {
			skillId: selectedSkillId.value,
			state: true
		});
	} else {
		await AdminDinozService.removeDinozSkill(props.userId, props.dinoz.id, {
			skillId: selectedSkillId.value
		});
	}

	selectedSkillId.value = NO_SKILL;
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

.skills-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.skill-entry {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	padding: 6px 8px;
	border: 1px solid #bc683c;
	background: rgb(255 255 255 / 12%);
}

.skill-main {
	display: flex;
	align-items: center;
	gap: 8px;
}

.skill-actions {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
}

.skill-state-fixed {
	font-size: 0.95rem;
}

.error-skill {
	color: #a11;
	font-weight: bold;
}

.skills-editor {
	display: flex;
	gap: 12px;
	align-items: flex-start;
}

.operations {
	display: flex;
	flex-direction: column;
	gap: 8px;
	min-width: 120px;
}
</style>

<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Unlockable Skills</h3>
				<div class="section">
					<label class="title">Unlockable skills actuelles :</label>
					<div v-if="dinoz.unlockableSkills.length > 0" class="skills-list">
						<div v-for="entry in dinoz.unlockableSkills" :key="entry.id" class="skill-entry">
							<span v-if="hasSkill(entry.skillId)">
								{{ t(`skill.name.${getSkillNameKey(entry.skillId)}`) }}
							</span>
							<span v-else class="error-skill"> Unknown unlockable skill (ID: {{ entry.skillId }}) </span>
						</div>
					</div>
					<p v-else>Aucune unlockable skill.</p>
				</div>
				<div class="section">
					<label class="title" for="dinozUnlockableSkills">Modifier les unlockable skills :</label>
					<div>
						<DZSelect id="dinozUnlockableSkills" v-model="selectedSkillId" :options="skillOptions" />
						<div class="operations">
							<DZRadio
								id="unlockableSkillOperationAdd"
								name="unlockableSkillOperation"
								v-model="skillOperation"
								value="add"
							>
								Ajouter
							</DZRadio>
							<DZRadio
								id="unlockableSkillOperationRemove"
								name="unlockableSkillOperation"
								v-model="skillOperation"
								value="remove"
							>
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

const currentUnlockableSkillIds = computed(() => props.dinoz.unlockableSkills.map(entry => entry.skillId));

const allSkillIds = computed(() =>
	Object.keys(skillList)
		.map(Number)
		.filter(skillId => !Number.isNaN(skillId))
		.sort((a, b) => a - b)
);

const unlockableSkillListFiltered = computed(() => {
	if (skillOperation.value === 'add') {
		return allSkillIds.value.filter(skillId => !currentUnlockableSkillIds.value.includes(skillId));
	}

	return allSkillIds.value.filter(skillId => currentUnlockableSkillIds.value.includes(skillId));
});

const skillOptions = computed<SelectOption<number>[]>(() => [
	{
		value: NO_SKILL,
		label: 'Sélectionner une skill'
	},
	...unlockableSkillListFiltered.value.map(skillId => ({
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

async function submit() {
	if (selectedSkillId.value === NO_SKILL) return;

	if (skillOperation.value === 'add') {
		await AdminDinozService.addDinozUnlockableSkill(props.userId, props.dinoz.id, {
			skillId: selectedSkillId.value
		});
	} else {
		await AdminDinozService.removeDinozUnlockableSkill(props.userId, props.dinoz.id, {
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
	flex-wrap: wrap;
	gap: 8px;
}
.skill-entry {
	padding: 6px 8px;
	border: 1px solid #bc683c;
	background: rgb(255 255 255 / 12%);
}
.operations {
	display: flex;
	margin: 5px;
	gap: 8px;
	min-width: 120px;
}
.error-skill {
	color: #a11;
	font-weight: bold;
}
</style>

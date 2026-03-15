<template>
	<div class="card">
		<div class="card-container">
			<h3>Skills</h3>

			<ul v-if="dinoz.skills.length > 0">
				<li v-for="entry in dinoz.skills" :key="entry.id">
					Skill #{{ entry.skillId }} - {{ entry.state ? 'active' : 'inactive' }}

					<DZButton type="button" @click="toggleSkill(entry.skillId, !entry.state)">
						{{ entry.state ? 'Désactiver' : 'Activer' }}
					</DZButton>

					<DZButton type="button" @click="removeSkill(entry.skillId)"> Supprimer </DZButton>
				</li>
			</ul>
			<p v-else>Aucune skill.</p>

			<div class="field">
				<label for="skillId">Ajouter une skill</label>
				<input id="skillId" v-model.number="newSkillId" type="number" min="1" />
			</div>

			<DZButton type="button" @click="addSkill">Ajouter</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

import DZButton from '../../utils/DZButton.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const newSkillId = ref<number>(1);

async function addSkill() {
	await AdminDinozService.addDinozSkill(props.userId, props.dinoz.id, {
		skillId: newSkillId.value,
		state: true
	});

	emit('updated');
}

async function toggleSkill(skillId: number, state: boolean) {
	await AdminDinozService.updateDinozSkillState(props.userId, props.dinoz.id, {
		skillId,
		state
	});

	emit('updated');
}

async function removeSkill(skillId: number) {
	await AdminDinozService.removeDinozSkill(props.userId, props.dinoz.id, {
		skillId
	});

	emit('updated');
}
</script>

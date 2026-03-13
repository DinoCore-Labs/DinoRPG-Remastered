<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Unique skills</h3>
				<form class="form" @submit.prevent="submit">
					<div class="skills-grid">
						<div v-for="skill in skillList" :key="skill.key" class="skill-row">
							<div class="skill-info">
								<strong>{{ skill.label }}</strong>
								<span :class="['state', form[skill.key] ? 'enabled' : 'disabled']">
									{{ form[skill.key] ? 'Débloquée' : 'Bloquée' }}
								</span>
							</div>

							<DZCheckbox :id="`skill-${skill.key}`" v-model="form[skill.key]" />
						</div>
					</div>

					<DZButton type="submit" :disabled="submitting">
						{{ submitting ? 'Enregistrement...' : 'Mettre à jour' }}
					</DZButton>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

import type { AdminUserDetails, AdminUserUniqueSkills } from '@dinorpg/core/models/admin/adminUser.js';
import { AdminUserService } from '../../../services/adminUsers.service';

import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZButton from '../../utils/DZButton.vue';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);

const skillList = [
	{ key: 'leader', label: 'Leader' },
	{ key: 'engineer', label: 'Engineer' },
	{ key: 'cooker', label: 'Cooker' },
	{ key: 'shopKeeper', label: 'ShopKeeper' },
	{ key: 'merchant', label: 'Merchant' },
	{ key: 'priest', label: 'Priest' },
	{ key: 'teacher', label: 'Teacher' },
	{ key: 'matelasseur', label: 'Matelasseur' },
	{ key: 'messie', label: 'Messie' }
] as const;

const form = reactive<AdminUserUniqueSkills>({
	leader: false,
	engineer: false,
	cooker: false,
	shopKeeper: false,
	merchant: false,
	priest: false,
	teacher: false,
	matelasseur: false,
	messie: false
});

function hydrateForm() {
	form.leader = props.user.uniqueSkills.leader;
	form.engineer = props.user.uniqueSkills.engineer;
	form.cooker = props.user.uniqueSkills.cooker;
	form.shopKeeper = props.user.uniqueSkills.shopKeeper;
	form.merchant = props.user.uniqueSkills.merchant;
	form.priest = props.user.uniqueSkills.priest;
	form.teacher = props.user.uniqueSkills.teacher;
	form.matelasseur = props.user.uniqueSkills.matelasseur;
	form.messie = props.user.uniqueSkills.messie;
}

watch(() => props.user, hydrateForm, { immediate: true });

async function submit() {
	submitting.value = true;

	try {
		await AdminUserService.updateUserUniqueSkills(props.user.id, {
			uniqueSkills: {
				leader: form.leader,
				engineer: form.engineer,
				cooker: form.cooker,
				shopKeeper: form.shopKeeper,
				merchant: form.merchant,
				priest: form.priest,
				teacher: form.teacher,
				matelasseur: form.matelasseur,
				messie: form.messie
			}
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

.form {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.skills-grid {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.skill-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 10px;
	border: 1px solid #bc683c;
	background: #f3ca92;
}

.skill-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.state {
	font-size: 8pt;
	font-weight: bold;

	&.enabled {
		color: #356847;
	}

	&.disabled {
		color: #8b3a2e;
	}
}
</style>

<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Stats</h3>
				<div class="grid">
					<div class="field">
						<label>Niveau</label>
						<input v-model.number="form.level" type="number" min="1" />
					</div>
					<div class="field">
						<label>Expérience</label>
						<input v-model.number="form.experience" type="number" min="0" />
					</div>
					<div class="field">
						<label>Life</label>
						<input v-model.number="form.life" type="number" min="0" />
					</div>
					<div class="field">
						<label>Max life</label>
						<input v-model.number="form.maxLife" type="number" min="1" />
					</div>
					<div class="field">
						<label>Remaining</label>
						<input v-model.number="form.remaining" type="number" min="0" />
					</div>
					<div class="field">
						<label>Order</label>
						<input v-model.number="form.order" type="number" min="0" />
					</div>
					<div class="field">
						<label>Fire</label>
						<input v-model.number="form.nbrUpFire" type="number" min="0" />
					</div>
					<div class="field">
						<label>Wood</label>
						<input v-model.number="form.nbrUpWood" type="number" min="0" />
					</div>
					<div class="field">
						<label>Water</label>
						<input v-model.number="form.nbrUpWater" type="number" min="0" />
					</div>
					<div class="field">
						<label>Lightning</label>
						<input v-model.number="form.nbrUpLightning" type="number" min="0" />
					</div>
					<div class="field">
						<label>Air</label>
						<input v-model.number="form.nbrUpAir" type="number" min="0" />
					</div>
					<div class="field">
						<label>Next up element</label>
						<input v-model.number="form.nextUpElementId" type="number" min="0" />
					</div>
					<div class="field">
						<label>Next up alt element</label>
						<input v-model.number="form.nextUpAltElementId" type="number" min="0" />
					</div>
				</div>
				<DZButton type="button" @click="submit">Sauvegarder</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails, UpdateAdminDinozBody } from '@dinorpg/core/models/admin/adminDinoz.js';

import DZButton from '../../utils/DZButton.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service.js';

const props = defineProps<{
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const form = reactive({
	level: 1,
	experience: 0,
	life: 0,
	maxLife: 1,
	remaining: 0,
	order: 0 as number | null,
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 0,
	nbrUpLightning: 0,
	nbrUpAir: 0,
	nextUpElementId: 0,
	nextUpAltElementId: 0
});

watch(
	() => props.dinoz,
	value => {
		form.level = value.level;
		form.experience = value.experience;
		form.life = value.life;
		form.maxLife = value.maxLife;
		form.remaining = value.remaining;
		form.order = value.order;
		form.nbrUpFire = value.nbrUpFire;
		form.nbrUpWood = value.nbrUpWood;
		form.nbrUpWater = value.nbrUpWater;
		form.nbrUpLightning = value.nbrUpLightning;
		form.nbrUpAir = value.nbrUpAir;
		form.nextUpElementId = value.nextUpElementId;
		form.nextUpAltElementId = value.nextUpAltElementId;
	},
	{ immediate: true }
);

async function submit() {
	const payload: UpdateAdminDinozBody = {
		level: form.level,
		experience: form.experience,
		life: form.life,
		maxLife: form.maxLife,
		remaining: form.remaining,
		order: form.order,
		nbrUpFire: form.nbrUpFire,
		nbrUpWood: form.nbrUpWood,
		nbrUpWater: form.nbrUpWater,
		nbrUpLightning: form.nbrUpLightning,
		nbrUpAir: form.nbrUpAir,
		nextUpElementId: form.nextUpElementId,
		nextUpAltElementId: form.nextUpAltElementId
	};

	await AdminDinozService.updateAdminDinoz(props.dinoz.id, payload);
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
</style>

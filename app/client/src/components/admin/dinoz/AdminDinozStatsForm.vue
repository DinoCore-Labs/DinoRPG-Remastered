<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Stats</h3>
				<div class="grid">
					<div class="field">
						<label for="level">Niveau :</label>
						<DZInput id="level" v-model.number="form.level" type="number" min="1" />
					</div>
					<div class="field">
						<label for="experience">Expérience :</label>
						<DZInput id="experience" v-model.number="form.experience" type="number" min="0" />
					</div>
					<div class="field">
						<label for="life">Vie :</label>
						<DZInput id="life" v-model.number="form.life" type="number" min="0" />
					</div>
					<div class="field">
						<label for="maxLife">Vie max :</label>
						<DZInput id="maxLife" v-model.number="form.maxLife" type="number" min="1" />
					</div>
					<div class="field">
						<label for="remaining">Remaining :</label>
						<DZInput id="remaining" v-model.number="form.remaining" type="number" min="0" />
					</div>
					<div class="field">
						<label for="nbrUpFire">Fire</label>
						<DZInput id="nbrUpFire" v-model.number="form.nbrUpFire" type="number" min="0" />
					</div>
					<div class="field">
						<label for="nbrUpWood">Wood</label>
						<DZInput id="nbrUpWood" v-model.number="form.nbrUpWood" type="number" min="0" />
					</div>
					<div class="field">
						<label for="nbrUpWater">Water</label>
						<DZInput id="nbrUpWater" v-model.number="form.nbrUpWater" type="number" min="0" />
					</div>
					<div class="field">
						<label for="nbrUpLightning">Lightning</label>
						<DZInput id="nbrUpLightning" v-model.number="form.nbrUpLightning" type="number" min="0" />
					</div>
					<div class="field">
						<label for="nbrUpAir">Air</label>
						<DZInput id="nbrUpAir" v-model.number="form.nbrUpAir" type="number" min="0" />
					</div>
					<div class="field">
						<label for="nextUpElementId">Next up element</label>
						<DZInput id="nextUpElementId" v-model.number="form.nextUpElementId" type="number" min="0" />
					</div>
					<div class="field">
						<label for="nextUpAltElementId">Next up alt element</label>
						<DZInput id="nextUpAltElementId" v-model.number="form.nextUpAltElementId" type="number" min="0" />
					</div>
					<div class="field">
						<DZCheckbox id="fight" v-model="form.fight"> Fight activé </DZCheckbox>
					</div>
					<div class="field">
						<DZCheckbox id="gather" v-model="form.gather"> Gather activé </DZCheckbox>
					</div>
				</div>
				<DZButton type="button" @click="submit">Sauvegarder</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozStatsPayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import { AdminDinozService } from '../../../services/adminDinoz.service';
import DZButton from '../../utils/DZButton.vue';
import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZInput from '../../utils/DZInput.vue';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const form = reactive<UpdateAdminDinozStatsPayload>({
	level: 1,
	experience: 0,
	life: 0,
	maxLife: 1,
	remaining: 0,
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 0,
	nbrUpLightning: 0,
	nbrUpAir: 0,
	nextUpElementId: 0,
	nextUpAltElementId: 0,
	fight: true,
	gather: true
});

watch(
	() => props.dinoz,
	value => {
		form.level = value.level;
		form.experience = value.experience;
		form.life = value.life;
		form.maxLife = value.maxLife;
		form.remaining = value.remaining;
		form.nbrUpFire = value.nbrUpFire;
		form.nbrUpWood = value.nbrUpWood;
		form.nbrUpWater = value.nbrUpWater;
		form.nbrUpLightning = value.nbrUpLightning;
		form.nbrUpAir = value.nbrUpAir;
		form.nextUpElementId = value.nextUpElementId;
		form.nextUpAltElementId = value.nextUpAltElementId;
		form.fight = value.fight;
		form.gather = value.gather;
	},
	{ immediate: true }
);

async function submit() {
	await AdminDinozService.updateDinozStats(props.userId, props.dinoz.id, {
		level: form.level,
		experience: form.experience,
		life: form.life,
		maxLife: form.maxLife,
		remaining: form.remaining,
		nbrUpFire: form.nbrUpFire,
		nbrUpWood: form.nbrUpWood,
		nbrUpWater: form.nbrUpWater,
		nbrUpLightning: form.nbrUpLightning,
		nbrUpAir: form.nbrUpAir,
		nextUpElementId: form.nextUpElementId,
		nextUpAltElementId: form.nextUpAltElementId,
		fight: form.fight,
		gather: form.gather
	});

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
.field {
	display: flex;
	gap: 5px;
}
label {
	color: #8e3e26;
}
</style>

<template>
	<div class="card">
		<div class="card-container">
			<h3>Stats</h3>

			<div class="grid">
				<div class="field">
					<label for="level">Niveau</label>
					<input id="level" v-model.number="form.level" type="number" min="1" />
				</div>

				<div class="field">
					<label for="experience">Expérience</label>
					<input id="experience" v-model.number="form.experience" type="number" min="0" />
				</div>

				<div class="field">
					<label for="life">Vie</label>
					<input id="life" v-model.number="form.life" type="number" min="0" />
				</div>

				<div class="field">
					<label for="maxLife">Vie max</label>
					<input id="maxLife" v-model.number="form.maxLife" type="number" min="1" />
				</div>

				<div class="field">
					<label for="remaining">Remaining</label>
					<input id="remaining" v-model.number="form.remaining" type="number" min="0" />
				</div>

				<div class="field">
					<label for="order">Order</label>
					<input id="order" :value="form.order ?? ''" type="number" min="0" @input="onOrderInput" />
				</div>

				<div class="field">
					<label for="nbrUpFire">Fire</label>
					<input id="nbrUpFire" v-model.number="form.nbrUpFire" type="number" min="0" />
				</div>

				<div class="field">
					<label for="nbrUpWood">Wood</label>
					<input id="nbrUpWood" v-model.number="form.nbrUpWood" type="number" min="0" />
				</div>

				<div class="field">
					<label for="nbrUpWater">Water</label>
					<input id="nbrUpWater" v-model.number="form.nbrUpWater" type="number" min="0" />
				</div>

				<div class="field">
					<label for="nbrUpLightning">Lightning</label>
					<input id="nbrUpLightning" v-model.number="form.nbrUpLightning" type="number" min="0" />
				</div>

				<div class="field">
					<label for="nbrUpAir">Air</label>
					<input id="nbrUpAir" v-model.number="form.nbrUpAir" type="number" min="0" />
				</div>

				<div class="field">
					<label for="nextUpElementId">Next up element</label>
					<input id="nextUpElementId" v-model.number="form.nextUpElementId" type="number" min="0" />
				</div>

				<div class="field">
					<label for="nextUpAltElementId">Next up alt element</label>
					<input id="nextUpAltElementId" v-model.number="form.nextUpAltElementId" type="number" min="0" />
				</div>

				<div class="checkbox">
					<label>
						<input v-model="form.fight" type="checkbox" />
						Fight activé
					</label>
				</div>

				<div class="checkbox">
					<label>
						<input v-model="form.gather" type="checkbox" />
						Gather activé
					</label>
				</div>
			</div>

			<DZButton type="button" @click="submit">Sauvegarder</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozStatsPayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import { AdminDinozService } from '../../../services/adminDinoz.service';
import DZButton from '../../utils/DZButton.vue';

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
	order: null,
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
		form.order = value.order;
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

function onOrderInput(event: Event) {
	const value = (event.target as HTMLInputElement).value;
	form.order = value === '' ? null : Number(value);
}

async function submit() {
	await AdminDinozService.updateDinozStats(props.userId, props.dinoz.id, {
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
		nextUpAltElementId: form.nextUpAltElementId,
		fight: form.fight,
		gather: form.gather
	});

	emit('updated');
}
</script>

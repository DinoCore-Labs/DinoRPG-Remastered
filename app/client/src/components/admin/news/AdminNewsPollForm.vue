<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<div class="poll-block">
					<div class="field checkbox">
						<DZCheckbox id="addPoll" v-model="localValue.pollEnabled" label="Ajouter un sondage" type="checkbox" />
					</div>
					<div v-if="localValue.pollEnabled">
						<div class="field checkbox">
							<DZCheckbox id="activePoll" v-model="localValue.poll.isActive" label="Sondage actif" type="checkbox" />
						</div>
						<div class="field">
							<label for="endAt">Date de fin</label>
							<DZInput v-model="localValue.poll.endAt" id="endAt" type="datetime-local" />
						</div>
						<div v-for="(option, optionIndex) in localValue.poll.options" :key="optionIndex" class="poll-option">
							<h5>Option {{ Number(optionIndex) + 1 }}</h5>
							<div v-for="translation in option.translations" :key="translation.lang" class="field">
								<label>{{ translation.lang }}</label>
								<DZInput v-model="translation.label" :label="translation.lang" type="text" />
							</div>
							<DZButton type="button" @click="removeOption(Number(optionIndex))">Supprimer l’option</DZButton>
						</div>
						<DZButton type="button" @click="addOption">Ajouter une option</DZButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Language } from '@dinorpg/core/models/config/language.js';
import { defineComponent, type PropType } from 'vue';

import DZButton from '../../utils/DZButton.vue';
import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZInput from '../../utils/DZInput.vue';

export default defineComponent({
	name: 'AdminNewsPollForm',
	components: {
		DZButton,
		DZCheckbox,
		DZInput
	},
	props: {
		modelValue: {
			type: Object as PropType<any>,
			required: true
		}
	},
	emits: ['update:modelValue'],
	computed: {
		localValue: {
			get(): any {
				return this.modelValue;
			},
			set(value: any) {
				this.$emit('update:modelValue', value);
			}
		}
	},
	methods: {
		addOption() {
			this.localValue = {
				...this.localValue,
				poll: {
					...this.localValue.poll,
					options: [
						...this.localValue.poll.options,
						{
							sortOrder: this.localValue.poll.options.length,
							translations: [
								{ lang: Language.FR, label: '' },
								{ lang: Language.EN, label: '' },
								{ lang: Language.ES, label: '' },
								{ lang: Language.DE, label: '' }
							]
						}
					]
				}
			};
		},
		removeOption(index: number) {
			this.localValue = {
				...this.localValue,
				poll: {
					...this.localValue.poll,
					options: this.localValue.poll.options.filter((_: unknown, i: number) => i !== index)
				}
			};
		}
	}
});
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

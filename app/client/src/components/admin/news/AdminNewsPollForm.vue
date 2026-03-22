<template>
	<div class="poll-block">
		<div class="field checkbox">
			<label>
				<input v-model="localValue.pollEnabled" type="checkbox" />
				Ajouter un sondage
			</label>
		</div>
		<div v-if="localValue.pollEnabled">
			<div class="field checkbox">
				<label>
					<input v-model="localValue.poll.isActive" type="checkbox" />
					Sondage actif
				</label>
			</div>
			<div class="field">
				<label>Date de fin</label>
				<input v-model="localValue.poll.endAt" type="datetime-local" />
			</div>
			<div v-for="(option, optionIndex) in localValue.poll.options" :key="optionIndex" class="poll-option">
				<h5>Option {{ Number(optionIndex) + 1 }}</h5>
				<div v-for="translation in option.translations" :key="translation.lang" class="field">
					<label>{{ translation.lang }}</label>
					<input v-model="translation.label" type="text" />
				</div>
				<DZButton type="button" @click="removeOption(Number(optionIndex))">Supprimer l’option</DZButton>
			</div>
			<DZButton type="button" @click="addOption">Ajouter une option</DZButton>
		</div>
	</div>
</template>

<script lang="ts">
import { Language } from '@dinorpg/core/models/config/language.js';
import { defineComponent, type PropType } from 'vue';

import DZButton from '../../utils/DZButton.vue';

export default defineComponent({
	name: 'AdminNewsPollForm',
	components: {
		DZButton
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

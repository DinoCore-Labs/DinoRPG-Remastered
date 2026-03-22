<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>News</h3>
				<div class="field">
					<label for="slug">Slug</label>
					<DZInput v-model="localValue.slug" id="slug" type="text" />
				</div>
				<div class="field">
					<label for="type">Type</label>
					<DZSelect
						id="news-type"
						v-model="localValue.type"
						:options="newsTypeOptions"
						placeholder="Sélectionner un type"
					/>
				</div>
				<div class="field checkbox">
					<DZCheckbox
						id="isPublished"
						v-model="localValue.isPublished"
						label="Date de publication"
						type="datetime-local"
					/>
				</div>
				<div class="field">
					<label>Date de publication</label>
					<DZInput v-model="localValue.publishedAt" type="datetime-local" />
				</div>
				<div class="field">
					<label>Image</label>
					<input type="file" accept="image/*" @change="onImageChange" />
				</div>
				<div v-if="hasCurrentImage" class="field checkbox">
					<DZCheckbox id="removeImage" v-model="localValue.removeImage" label="Supprimer l’image actuelle" />
				</div>
				<div class="translations">
					<h4>Traductions</h4>
					<div v-for="translation in localValue.translations" :key="translation.lang" class="translation-block">
						<h5>{{ translation.lang }}</h5>
						<div class="field">
							<label for="title">Titre</label>
							<DZInput v-model="translation.title" id="title" type="text" />
						</div>
						<div class="field">
							<label for="resume">Résumé</label>
							<DZInput v-model="translation.excerpt" id="resume" type="text" />
						</div>
						<div class="field">
							<label>Contenu Markdown</label>
							<textarea v-model="translation.content" rows="10" />
						</div>
					</div>
				</div>
				<AdminNewsPollForm v-model="localValue" />
				<DZButton :disabled="loading" @click="submit">
					{{ isEdit ? 'Mettre à jour' : 'Créer' }}
				</DZButton>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { NewsType } from '@dinorpg/core/models/news/news.js';
import { defineComponent, type PropType } from 'vue';

import DZButton from '../../utils/DZButton.vue';
import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZInput from '../../utils/DZInput.vue';
import DZSelect from '../../utils/DZSelect.vue';
import AdminNewsPollForm from './AdminNewsPollForm.vue';

export default defineComponent({
	name: 'AdminNewsForm',
	components: {
		DZButton,
		DZCheckbox,
		DZInput,
		DZSelect,
		AdminNewsPollForm
	},
	props: {
		modelValue: {
			type: Object as PropType<any>,
			required: true
		},
		loading: {
			type: Boolean,
			default: false
		},
		hasCurrentImage: {
			type: Boolean,
			default: false
		},
		isEdit: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'submit'],
	data() {
		return {
			imageFile: null as File | null,
			newsTypes: Object.values(NewsType)
		};
	},
	computed: {
		localValue: {
			get(): any {
				return this.modelValue;
			},
			set(value: any) {
				this.$emit('update:modelValue', value);
			}
		},
		newsTypeOptions(): { value: NewsType; label: string }[] {
			return this.newsTypes.map(type => ({
				value: type,
				label: type
			}));
		}
	},
	methods: {
		onImageChange(event: Event) {
			const target = event.target as HTMLInputElement;
			this.imageFile = target.files?.[0] ?? null;
		},
		submit() {
			this.$emit('submit', this.imageFile);
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
textarea {
	border: none;
	width: 90%;
	background-color: #ae6139;
	color: #ffee92;
}
textarea:focus {
	background-color: #9a4029;
}
</style>

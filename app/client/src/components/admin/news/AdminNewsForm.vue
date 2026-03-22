<template>
	<div class="card">
		<h3>News</h3>
		<div class="field">
			<label>Slug</label>
			<input v-model="localValue.slug" type="text" />
		</div>
		<div class="field">
			<label>Type</label>
			<select v-model="localValue.type">
				<option v-for="type in newsTypes" :key="type" :value="type">
					{{ type }}
				</option>
			</select>
		</div>
		<div class="field checkbox">
			<label>
				<input v-model="localValue.isPublished" type="checkbox" />
				Publiée
			</label>
		</div>
		<div class="field">
			<label>Date de publication</label>
			<input v-model="localValue.publishedAt" type="datetime-local" />
		</div>
		<div class="field">
			<label>Image</label>
			<input type="file" accept="image/*" @change="onImageChange" />
		</div>
		<div v-if="hasCurrentImage" class="field checkbox">
			<label>
				<input v-model="localValue.removeImage" type="checkbox" />
				Supprimer l’image actuelle
			</label>
		</div>
		<div class="translations">
			<h4>Traductions</h4>
			<div v-for="translation in localValue.translations" :key="translation.lang" class="translation-block">
				<h5>{{ translation.lang }}</h5>
				<div class="field">
					<label>Titre</label>
					<input v-model="translation.title" type="text" />
				</div>
				<div class="field">
					<label>Résumé</label>
					<input v-model="translation.excerpt" type="text" />
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
</template>

<script lang="ts">
import { NewsType } from '@dinorpg/core/models/news/news.js';
import { defineComponent, type PropType } from 'vue';

import DZButton from '../../utils/DZButton.vue';
import AdminNewsPollForm from './AdminNewsPollForm.vue';

export default defineComponent({
	name: 'AdminNewsForm',
	components: {
		DZButton,
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

<template>
	<TitleHeader :title="$t('pageTitle.admin')" header="Roadmap" />
	<div class="roadmap-admin">
		<p v-if="loading" class="loading">
			{{ $t('common.loading') }}
		</p>
		<div v-else class="roadmap-list">
			<section v-for="(roadmapEntry, roadmapIndex) in roadmapList" :key="roadmapIndex" class="card roadmap-card">
				<div class="card-container">
					<div class="roadmap-card-header">
						<div>
							<h3>Emplacement {{ roadmapIndex + 1 }}</h3>
							<span class="slot-help">
								{{ roadmapEntry.titleFr || 'Aucun titre' }}
							</span>
						</div>
						<div class="actions">
							<DZButton
								class="bSmall"
								type="button"
								:disabled="roadmapIndex === 0"
								@click="moveRoadmap(roadmapIndex, -1)"
							>
								↑ Monter
							</DZButton>

							<DZButton
								class="bSmall"
								type="button"
								:disabled="roadmapIndex === roadmapList.length - 1"
								@click="moveRoadmap(roadmapIndex, 1)"
							>
								↓ Descendre
							</DZButton>
						</div>
					</div>
					<div class="section">
						<h4>Titre</h4>
						<div class="translations">
							<div class="field translation-field">
								<label :for="`roadmap-${roadmapIndex}-title-fr`" class="translation-label">
									<Flag lang="FR" />
									<span>FR</span>
								</label>
								<DZInput
									:id="`roadmap-${roadmapIndex}-title-fr`"
									v-model="roadmapEntry.titleFr"
									class="roadmap-input"
									type="text"
									maxlength="255"
									placeholder="Alpha 0.14.0 (Bientôt)"
								/>
							</div>
							<div class="field translation-field">
								<label :for="`roadmap-${roadmapIndex}-title-en`" class="translation-label">
									<Flag lang="EN" />
									<span>EN</span>
								</label>
								<DZInput
									:id="`roadmap-${roadmapIndex}-title-en`"
									v-model="roadmapEntry.titleEn"
									class="roadmap-input"
									type="text"
									maxlength="255"
									placeholder="Alpha 0.14.0 (Soon)"
								/>
							</div>
							<div class="field translation-field">
								<label :for="`roadmap-${roadmapIndex}-title-es`" class="translation-label">
									<Flag lang="ES" />
									<span>ES</span>
								</label>
								<DZInput
									:id="`roadmap-${roadmapIndex}-title-es`"
									v-model="roadmapEntry.titleEs"
									class="roadmap-input"
									type="text"
									maxlength="255"
									placeholder="Alpha 0.14.0"
								/>
							</div>
							<div class="field translation-field">
								<label :for="`roadmap-${roadmapIndex}-title-de`" class="translation-label">
									<Flag lang="DE" />
									<span>DE</span>
								</label>
								<DZInput
									:id="`roadmap-${roadmapIndex}-title-de`"
									v-model="roadmapEntry.titleDe"
									class="roadmap-input"
									type="text"
									maxlength="255"
									placeholder="Alpha 0.14.0"
								/>
							</div>
						</div>
					</div>
					<div class="section">
						<div class="section-header">
							<div>
								<h4>Contenu</h4>
								<span class="section-help">
									{{ roadmapEntry.items.length }}
									{{ roadmapEntry.items.length > 1 ? 'lignes' : 'ligne' }}
								</span>
							</div>
							<DZButton type="button" @click="addItem(roadmapEntry)"> Ajouter une ligne </DZButton>
						</div>
						<div v-for="(item, itemIndex) in roadmapEntry.items" :key="itemIndex" class="roadmap-item">
							<div class="roadmap-item-header">
								<strong> Ligne {{ itemIndex + 1 }} </strong>
								<div class="actions">
									<DZButton
										class="bSmall"
										type="button"
										:disabled="itemIndex === 0"
										@click="moveItem(roadmapEntry, itemIndex, -1)"
									>
										↑ Monter
									</DZButton>
									<DZButton
										class="bSmall"
										type="button"
										:disabled="itemIndex === roadmapEntry.items.length - 1"
										@click="moveItem(roadmapEntry, itemIndex, 1)"
									>
										↓ Descendre
									</DZButton>
									<DZButton
										class="bSmall"
										type="button"
										:disabled="roadmapEntry.items.length <= 1"
										@click="removeItem(roadmapEntry, itemIndex)"
									>
										Supprimer
									</DZButton>
								</div>
							</div>
							<div class="field icon-field">
								<label :for="`roadmap-${roadmapIndex}-item-${itemIndex}-icon`"> Icône </label>
								<div class="icon-picker">
									<div class="icon-preview">
										<img v-if="item.icon" :src="getImgURL('icons', item.icon)" :alt="item.icon" />
										<span v-else>—</span>
									</div>
									<DZSelect
										:id="`roadmap-${roadmapIndex}-item-${itemIndex}-icon`"
										class="icon-select"
										:model-value="item.icon ?? ''"
										:options="iconOptions"
										placeholder="Choisir une icône"
										@update:model-value="updateItemIcon(item, $event)"
									/>
								</div>
								<small v-if="item.icon" class="icon-name">
									{{ item.icon }}
								</small>
							</div>
							<div class="translations item-translations">
								<div class="field translation-field">
									<label :for="`roadmap-${roadmapIndex}-item-${itemIndex}-fr`" class="translation-label">
										<Flag lang="FR" />
										<span>FR</span>
									</label>
									<DZInput
										:id="`roadmap-${roadmapIndex}-item-${itemIndex}-fr`"
										v-model="item.textFr"
										class="roadmap-input"
										type="text"
										maxlength="2000"
										placeholder="Description française"
									/>
								</div>
								<div class="field translation-field">
									<label :for="`roadmap-${roadmapIndex}-item-${itemIndex}-en`" class="translation-label">
										<Flag lang="EN" />
										<span>EN</span>
									</label>
									<DZInput
										:id="`roadmap-${roadmapIndex}-item-${itemIndex}-en`"
										v-model="item.textEn"
										class="roadmap-input"
										type="text"
										maxlength="2000"
										placeholder="English description"
									/>
								</div>
								<div class="field translation-field">
									<label :for="`roadmap-${roadmapIndex}-item-${itemIndex}-es`" class="translation-label">
										<Flag lang="ES" />
										<span>ES</span>
									</label>
									<DZInput
										:id="`roadmap-${roadmapIndex}-item-${itemIndex}-es`"
										v-model="item.textEs"
										class="roadmap-input"
										type="text"
										maxlength="2000"
										placeholder="Descripción española"
									/>
								</div>
								<div class="field translation-field">
									<label :for="`roadmap-${roadmapIndex}-item-${itemIndex}-de`" class="translation-label">
										<Flag lang="DE" />
										<span>DE</span>
									</label>
									<DZInput
										:id="`roadmap-${roadmapIndex}-item-${itemIndex}-de`"
										v-model="item.textDe"
										class="roadmap-input"
										type="text"
										maxlength="2000"
										placeholder="Deutsche Beschreibung"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
		<div v-if="!loading" class="save">
			<DZButton type="button" :disabled="saving" @click="saveRoadmap">
				{{ saving ? 'Enregistrement...' : 'Enregistrer la roadmap' }}
			</DZButton>
		</div>
	</div>
</template>

<script lang="ts">
import {
	ROADMAP_SLOT_COUNT,
	type AdminRoadmapEntry,
	type AdminRoadmapItem,
	type AdminRoadmapPayload
} from '@dinorpg/core/models/roadmap/roadmap.js';
import { defineComponent } from 'vue';

import DZButton from '../../components/utils/DZButton.vue';
import DZInput from '../../components/utils/DZInput.vue';
import DZSelect from '../../components/utils/DZSelect.vue';
import type { SelectOption } from '../../components/utils/DZSelect.vue';
import Flag from '../../components/utils/Flag.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminRoadmapService } from '../../services/adminRoadmap.service';
import { errorHandler } from '../../utils/errorHandler';
import { getImgURL } from '../../utils/getImgURL';

/**
 * Tous les fichiers présents dans assets/icons dont le nom
 * commence par "small_" sont automatiquement disponibles
 * dans le sélecteur.
 */
const roadmapIconModules = import.meta.glob('../../assets/icons/small_*.webp');

const formatIconLabel = (icon: string): string => {
	return icon
		.replace(/^small_/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replaceAll('_', ' ')
		.replace(/\b\w/g, char => char.toUpperCase());
};

const ROADMAP_ICON_OPTIONS: SelectOption<string>[] = [
	{
		value: '',
		label: 'Aucune'
	},
	...Object.keys(roadmapIconModules)
		.map(path => {
			const filename = path.split('/').pop() ?? '';
			return filename.replace(/\.webp$/, '');
		})
		.filter(Boolean)
		.sort((a, b) => a.localeCompare(b))
		.map(icon => ({
			value: icon,
			label: `${formatIconLabel(icon)} — ${icon}`
		}))
];

const createEmptyItem = (position: number): AdminRoadmapItem => ({
	position,
	icon: 'small_missAct',
	textFr: '',
	textEn: '',
	textEs: '',
	textDe: ''
});

const createEmptyRoadmapEntry = (position: number): AdminRoadmapEntry => ({
	position,
	titleFr: '',
	titleEn: '',
	titleEs: '',
	titleDe: '',
	items: [createEmptyItem(1)]
});

const normalizeRoadmap = (roadmap: AdminRoadmapEntry[]): AdminRoadmapEntry[] => {
	return Array.from(
		{
			length: ROADMAP_SLOT_COUNT
		},
		(_, index) => {
			const position = index + 1;
			const entry = roadmap.find(item => item.position === position);
			if (!entry) {
				return createEmptyRoadmapEntry(position);
			}
			return {
				...entry,
				items: entry.items.map(item => ({
					...item
				}))
			};
		}
	);
};

export default defineComponent({
	name: 'AdminRoadmapPage',
	components: {
		TitleHeader,
		DZButton,
		DZInput,
		DZSelect,
		Flag
	},
	data() {
		return {
			loading: false,
			saving: false,
			iconOptions: ROADMAP_ICON_OPTIONS,
			roadmapList: Array.from(
				{
					length: ROADMAP_SLOT_COUNT
				},
				(_, index) => createEmptyRoadmapEntry(index + 1)
			) as AdminRoadmapEntry[]
		};
	},
	methods: {
		getImgURL,
		async loadRoadmap() {
			try {
				this.loading = true;
				const roadmap = await AdminRoadmapService.getRoadmap();
				this.roadmapList = normalizeRoadmap(roadmap);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.loading = false;
			}
		},
		moveRoadmap(index: number, direction: number) {
			const targetIndex = index + direction;
			if (targetIndex < 0 || targetIndex >= this.roadmapList.length) {
				return;
			}
			const [entry] = this.roadmapList.splice(index, 1);
			this.roadmapList.splice(targetIndex, 0, entry);
			this.updatePositions();
		},
		addItem(roadmapEntry: AdminRoadmapEntry) {
			roadmapEntry.items.push(createEmptyItem(roadmapEntry.items.length + 1));
			this.updateItemPositions(roadmapEntry);
		},
		async removeItem(roadmapEntry: AdminRoadmapEntry, itemIndex: number) {
			if (roadmapEntry.items.length <= 1) {
				return;
			}
			const confirmed = await this.$confirm({
				message: 'Supprimer cette ligne de la roadmap ?',
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (!confirmed) return;
			roadmapEntry.items.splice(itemIndex, 1);
			this.updateItemPositions(roadmapEntry);
		},
		moveItem(roadmapEntry: AdminRoadmapEntry, itemIndex: number, direction: number) {
			const targetIndex = itemIndex + direction;
			if (targetIndex < 0 || targetIndex >= roadmapEntry.items.length) {
				return;
			}
			const [item] = roadmapEntry.items.splice(itemIndex, 1);
			roadmapEntry.items.splice(targetIndex, 0, item);
			this.updateItemPositions(roadmapEntry);
		},
		updateItemIcon(item: AdminRoadmapItem, icon: string) {
			item.icon = icon || null;
		},
		updateItemPositions(roadmapEntry: AdminRoadmapEntry) {
			roadmapEntry.items.forEach((item, index) => {
				item.position = index + 1;
			});
		},
		updatePositions() {
			this.roadmapList.forEach((roadmapEntry, index) => {
				roadmapEntry.position = index + 1;
				this.updateItemPositions(roadmapEntry);
			});
		},
		validateRoadmap(): boolean {
			if (this.roadmapList.length !== ROADMAP_SLOT_COUNT) {
				this.$toast.open({
					message: `La roadmap doit contenir exactement ${ROADMAP_SLOT_COUNT} étapes.`,
					type: 'error'
				});
				return false;
			}
			for (const roadmapEntry of this.roadmapList) {
				if (
					!roadmapEntry.titleFr.trim() ||
					!roadmapEntry.titleEn.trim() ||
					!roadmapEntry.titleEs.trim() ||
					!roadmapEntry.titleDe.trim()
				) {
					this.$toast.open({
						message: `Le titre de l'emplacement ${roadmapEntry.position} doit être renseigné dans les 4 langues.`,
						type: 'error'
					});
					return false;
				}
				if (roadmapEntry.items.length === 0) {
					this.$toast.open({
						message: `L'emplacement ${roadmapEntry.position} doit contenir au moins une ligne.`,
						type: 'error'
					});
					return false;
				}
				for (const item of roadmapEntry.items) {
					if (!item.textFr.trim() || !item.textEn.trim() || !item.textEs.trim() || !item.textDe.trim()) {
						this.$toast.open({
							message: `Toutes les traductions de l'emplacement ${roadmapEntry.position} doivent être renseignées.`,
							type: 'error'
						});
						return false;
					}
				}
			}
			return true;
		},
		buildPayload(): AdminRoadmapPayload {
			return {
				roadmap: this.roadmapList.map(roadmapEntry => ({
					position: roadmapEntry.position,
					titleFr: roadmapEntry.titleFr.trim(),
					titleEn: roadmapEntry.titleEn.trim(),
					titleEs: roadmapEntry.titleEs.trim(),
					titleDe: roadmapEntry.titleDe.trim(),
					items: roadmapEntry.items.map(item => ({
						position: item.position,
						icon: item.icon?.trim() || null,
						textFr: item.textFr.trim(),
						textEn: item.textEn.trim(),
						textEs: item.textEs.trim(),
						textDe: item.textDe.trim()
					}))
				}))
			};
		},
		async saveRoadmap() {
			this.updatePositions();
			if (!this.validateRoadmap()) {
				return;
			}
			try {
				this.saving = true;
				const updatedRoadmap = await AdminRoadmapService.updateRoadmap(this.buildPayload());
				this.roadmapList = normalizeRoadmap(updatedRoadmap);
				this.$toast.open({
					message: 'Roadmap mise à jour avec succès.',
					type: 'success'
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.saving = false;
			}
		}
	},
	async mounted() {
		await this.loadRoadmap();
	}
});
</script>

<style lang="scss" scoped>
.roadmap-admin {
	width: 100%;
}
.roadmap-intro {
	margin-bottom: 15px;

	h3 {
		margin-top: 0;
		margin-bottom: 5px;
	}
	p {
		margin: 0;
	}
}
.loading {
	text-align: center;
}
.roadmap-list {
	display: flex;
	flex-direction: column;
	gap: 15px;
}
.roadmap-card {
	width: 100%;
}
.roadmap-card-header,
.roadmap-item-header,
.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
}
.roadmap-card-header {
	h3 {
		margin: 0;
	}
	.slot-help {
		display: block;
		margin-top: 2px;
		font-size: 11px;
		font-style: italic;
		color: #9a4029;
	}
}
.section {
	margin-top: 15px;
	h4 {
		margin: 0 0 8px;
		color: #67220d;
	}
}
.section-header {
	margin-bottom: 10px;
	h4 {
		margin: 0;
	}
	.section-help {
		display: block;
		margin-top: 2px;
		font-size: 11px;
		color: #9a4029;
	}
}
.translations {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 10px;
}
.translation-field {
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
}
.translation-label {
	display: flex;
	align-items: center;
	gap: 5px;
	font-weight: bold;
	color: #67220d;

	:deep(.flag) {
		width: auto;
		height: 13px;
	}
}
.roadmap-input {
	width: 100%;
}
.roadmap-item {
	margin-top: 10px;
	padding: 10px;
	border: 1px solid #c88f44;
	background-image: url('../../assets/background/table_cell.webp');
	background-position: -10px 0;
}
.roadmap-item-header {
	padding-bottom: 8px;
	margin-bottom: 10px;
	border-bottom: 1px dashed #bc683c;
	strong {
		color: #67220d;
	}
}
.icon-field {
	margin-bottom: 12px;
	> label {
		display: block;
		margin-bottom: 4px;
		font-weight: bold;
		color: #67220d;
	}
}
.icon-picker {
	display: flex;
	align-items: center;
	gap: 8px;
}
.icon-preview {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	flex-shrink: 0;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	img {
		max-width: 18px;
		max-height: 18px;
		image-rendering: pixelated;
	}
	span {
		color: #9a4029;
	}
}
.icon-select {
	flex: 1;
	min-width: 0;
}
:deep(.icon-select .trigger) {
	width: 100%;
}
.icon-name {
	display: block;
	margin-top: 3px;
	margin-left: 36px;
	color: #9a4029;
	font-family: monospace;
}
.item-translations {
	margin-top: 5px;
}
.actions {
	display: flex;
	align-items: center;
	gap: 5px;
	flex-wrap: wrap;
}
.save {
	display: flex;
	justify-content: center;
	margin: 20px 0;
}
@media screen and (max-width: 700px) {
	.translations {
		grid-template-columns: 1fr;
	}
	.roadmap-card-header,
	.roadmap-item-header,
	.section-header {
		align-items: flex-start;
		flex-direction: column;
	}
	.actions {
		width: 100%;
	}
	.icon-picker {
		align-items: stretch;
	}
	.icon-select {
		flex: 1;
	}
	.icon-name {
		margin-left: 36px;
	}
}
</style>

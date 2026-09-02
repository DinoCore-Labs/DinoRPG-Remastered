<template>
	<TitleHeader :title="$t('pageTitle.admin')" header="Roadmap" />
	<div class="roadmap-admin">
		<div class="roadmap-intro">
			<h3>Roadmap</h3>
			<p>Les quatre étapes correspondent directement aux quatre emplacements affichés dans la timeline.</p>
		</div>
		<p v-if="loading">Chargement...</p>
		<div v-else class="roadmap-list">
			<div v-for="(roadmapEntry, roadmapIndex) in roadmapList" :key="roadmapIndex" class="roadmap-card">
				<div class="roadmap-card-header">
					<h4>Emplacement {{ roadmapIndex + 1 }}</h4>
					<div class="actions">
						<DZButton type="button" :disabled="roadmapIndex === 0" @click="moveRoadmap(roadmapIndex, -1)"> ↑ </DZButton>
						<DZButton
							type="button"
							:disabled="roadmapIndex === roadmapList.length - 1"
							@click="moveRoadmap(roadmapIndex, 1)"
						>
							↓
						</DZButton>
					</div>
				</div>
				<div class="section">
					<h5>Titre</h5>
					<div class="translations">
						<label>
							<span>FR</span>
							<input v-model="roadmapEntry.titleFr" type="text" placeholder="Alpha 0.14.0 (Bientôt)" />
						</label>
						<label>
							<span>EN</span>
							<input v-model="roadmapEntry.titleEn" type="text" placeholder="Alpha 0.14.0 (Soon)" />
						</label>
						<label>
							<span>ES</span>
							<input v-model="roadmapEntry.titleEs" type="text" />
						</label>
						<label>
							<span>DE</span>
							<input v-model="roadmapEntry.titleDe" type="text" />
						</label>
					</div>
				</div>
				<div class="section">
					<div class="section-header">
						<h5>Contenu</h5>
						<DZButton type="button" @click="addItem(roadmapEntry)"> Ajouter une ligne </DZButton>
					</div>
					<div v-for="(item, itemIndex) in roadmapEntry.items" :key="itemIndex" class="roadmap-item">
						<div class="roadmap-item-header">
							<strong> Ligne {{ itemIndex + 1 }} </strong>
							<div class="actions">
								<DZButton type="button" :disabled="itemIndex === 0" @click="moveItem(roadmapEntry, itemIndex, -1)">
									↑
								</DZButton>
								<DZButton
									type="button"
									:disabled="itemIndex === roadmapEntry.items.length - 1"
									@click="moveItem(roadmapEntry, itemIndex, 1)"
								>
									↓
								</DZButton>
								<DZButton
									type="button"
									:disabled="roadmapEntry.items.length <= 1"
									@click="removeItem(roadmapEntry, itemIndex)"
								>
									Supprimer
								</DZButton>
							</div>
						</div>
						<label class="icon-field">
							<span>Icône</span>
							<select v-model="item.icon">
								<option :value="null">Aucune</option>
								<option value="small_mode">Étoile</option>
								<option value="small_missAct">Point d'interrogation</option>
							</select>
						</label>
						<div class="translations">
							<label>
								<span>FR</span>
								<textarea v-model="item.textFr" rows="2" />
							</label>
							<label>
								<span>EN</span>
								<textarea v-model="item.textEn" rows="2" />
							</label>
							<label>
								<span>ES</span>
								<textarea v-model="item.textEs" rows="2" />
							</label>
							<label>
								<span>DE</span>
								<textarea v-model="item.textDe" rows="2" />
							</label>
						</div>
					</div>
				</div>
			</div>
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
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminRoadmapService } from '../../services/adminRoadmap.service';
import { errorHandler } from '../../utils/errorHandler';

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
		DZButton
	},
	data() {
		return {
			loading: false,
			saving: false,
			roadmapList: Array.from(
				{
					length: ROADMAP_SLOT_COUNT
				},
				(_, index) => createEmptyRoadmapEntry(index + 1)
			) as AdminRoadmapEntry[]
		};
	},
	methods: {
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
	margin-top: 10px;
}
.roadmap-intro {
	margin-bottom: 15px;
	h3 {
		margin: 0;
		color: #67220d;
	}
	p {
		margin: 5px 0 0;
		font-size: 12px;
	}
}
.roadmap-list {
	display: flex;
	flex-direction: column;
	gap: 15px;
}
.roadmap-card {
	padding: 12px;
	border: 1px solid #9a4029;
	background-color: #f3c881;
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
	margin-bottom: 10px;
	h4 {
		margin: 0;
		color: #67220d;
	}
}

.section {
	margin-top: 12px;
	h5 {
		margin: 0 0 8px;
		color: #67220d;
	}
}
.section-header {
	margin-bottom: 8px;
	h5 {
		margin: 0;
	}
}
.translations {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px;
	label {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		span {
			width: 25px;
			padding-top: 4px;
			flex-shrink: 0;
			font-weight: bold;
			color: #67220d;
		}
		input,
		textarea {
			flex: 1;
			width: 100%;
			min-width: 0;
			box-sizing: border-box;
		}
		textarea {
			resize: vertical;
		}
	}
}
.roadmap-item {
	margin-top: 8px;
	padding: 10px;
	border: 1px solid #bc683c;
	background-color: rgba(255, 255, 255, 0.2);
}
.roadmap-item-header {
	margin-bottom: 8px;
}
.icon-field {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
	span {
		font-weight: bold;
		color: #67220d;
	}
	select {
		min-width: 200px;
	}
}
.actions {
	display: flex;
	align-items: center;
	gap: 5px;
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
		flex-wrap: wrap;
	}
}
</style>

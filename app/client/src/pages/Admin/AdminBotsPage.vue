<template>
	<div class="adminBots">
		<TitleHeader title="Admin" header="Bots joueurs :" sub-header="Gestion" />

		<section class="panel">
			<h3>Créer un bot</h3>
			<div class="form-grid">
				<label>
					<span>Nom</span>
					<input v-model.trim="createForm.name" type="text" maxlength="20" placeholder="BotBalanced" />
				</label>
				<label>
					<span>Stratégie</span>
					<select v-model="createForm.strategy">
						<option v-for="strategy in strategies" :key="strategy" :value="strategy">
							{{ strategy }}
						</option>
					</select>
				</label>
				<label>
					<span>Délai min (s)</span>
					<input v-model.number="createForm.minDelaySeconds" type="number" min="10" max="86400" />
				</label>
				<label>
					<span>Délai max (s)</span>
					<input v-model.number="createForm.maxDelaySeconds" type="number" min="10" max="86400" />
				</label>
			</div>

			<div class="toolbar">
				<DZButton :disabled="creating || !canCreate" @click="createBot">
					{{ creating ? 'Création…' : 'Créer le bot' }}
				</DZButton>
				<DZButton :disabled="loading" @click="refresh">
					{{ loading ? 'Chargement…' : 'Rafraîchir' }}
				</DZButton>
			</div>
		</section>

		<div v-if="error" class="error">{{ error }}</div>
		<div v-if="success" class="success">{{ success }}</div>

		<section class="panel">
			<h3>Bots existants</h3>

			<div class="table-wrap">
				<DZTable>
				<tr>
					<th>Nom</th>
					<th>Stratégie</th>
					<th>État</th>
					<th>Dinoz</th>
					<th>Délai (s)</th>
					<th>Planning</th>
					<th>Actions</th>
				</tr>

				<tr v-for="bot in bots" :key="bot.id">
					<td class="bot-name">
						<strong>{{ bot.user.name }}</strong>
					</td>
					<td>
						<select v-model="drafts[bot.id].strategy">
							<option v-for="strategy in strategies" :key="strategy" :value="strategy">
								{{ strategy }}
							</option>
						</select>
					</td>
					<td>
						<label class="toggle">
							<input v-model="drafts[bot.id].enabled" type="checkbox" />
							<span>{{ drafts[bot.id].enabled ? 'Actif' : 'Inactif' }}</span>
						</label>
					</td>
					<td class="mono">{{ bot.user._count.dinoz }}</td>
					<td>
						<div class="delay-range">
							<input
								v-model.number="drafts[bot.id].minDelaySeconds"
								class="delay"
								type="number"
								min="10"
								max="86400"
								title="Délai minimum"
							/>
							<span>–</span>
							<input
								v-model.number="drafts[bot.id].maxDelaySeconds"
								class="delay"
								type="number"
								min="10"
								max="86400"
								title="Délai maximum"
							/>
						</div>
					</td>
					<td class="mono planning">
						<div title="Dernière action">← {{ formatDate(bot.lastActionAt) }}</div>
						<div title="Prochaine action">→ {{ formatDate(bot.nextActionAt) }}</div>
					</td>
					<td>
						<div class="row-actions">
							<DZButton small :disabled="savingId === bot.id" @click="saveBot(bot.id)">
								{{ savingId === bot.id ? 'Sauvegarde…' : 'Sauvegarder' }}
							</DZButton>
							<DZButton small :disabled="historyLoading && selectedBotId === bot.id" @click="showHistory(bot.id)">
								Historique
							</DZButton>
						</div>
					</td>
				</tr>
				</DZTable>
			</div>

			<p v-if="!loading && bots.length === 0" class="empty">
				Aucun bot joueur pour le moment.
			</p>
		</section>

		<section v-if="selectedBotId" class="panel">
			<div class="history-header">
				<h3>Historique — {{ selectedBotName }}</h3>
				<DZButton small :disabled="historyLoading" @click="showHistory(selectedBotId)">
					{{ historyLoading ? 'Chargement…' : 'Rafraîchir' }}
				</DZButton>
			</div>

			<DZTable>
				<tr>
					<th>Date</th>
					<th>Statut</th>
					<th>Action</th>
					<th>Dinoz</th>
					<th>Erreur</th>
				</tr>
				<tr v-for="entry in history" :key="entry.id">
					<td class="mono">{{ formatDate(entry.createdAt) }}</td>
					<td>
						<span :class="entry.success ? 'status-ok' : 'status-error'">
							{{ entry.success ? 'OK' : 'ERREUR' }}
						</span>
					</td>
					<td class="mono">{{ entry.action }}</td>
					<td class="mono">{{ entry.dinozId ?? '—' }}</td>
					<td class="history-error" :title="entry.error ?? ''">{{ entry.error ?? '—' }}</td>
				</tr>
			</DZTable>

			<p v-if="!historyLoading && history.length === 0" class="empty">
				Aucune action enregistrée pour ce bot.
			</p>
		</section>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import DZButton from '../../components/utils/DZButton.vue';
import DZTable from '../../components/utils/DZTable.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import {
	AdminBotsService,
	BOT_STRATEGIES,
	type AdminBotActionLog,
	type AdminBotListItem,
	type BotStrategyValue,
	type UpdateAdminBotInput
} from '../../services/adminBots.service.js';

type BotDraft = {
	enabled: boolean;
	strategy: BotStrategyValue;
	minDelaySeconds: number;
	maxDelaySeconds: number;
};

export default defineComponent({
	name: 'AdminBots',
	components: {
		TitleHeader,
		DZButton,
		DZTable
	},
	data() {
		return {
			bots: [] as AdminBotListItem[],
			drafts: {} as Record<string, BotDraft>,
			strategies: BOT_STRATEGIES,
			createForm: {
				name: '',
				strategy: 'BALANCED' as BotStrategyValue,
				minDelaySeconds: 60,
				maxDelaySeconds: 600
			},
			loading: false,
			creating: false,
			savingId: '',
			selectedBotId: '',
			history: [] as AdminBotActionLog[],
			historyLoading: false,
			error: '',
			success: ''
		};
	},
	computed: {
		selectedBotName(): string {
			return this.bots.find(bot => bot.id === this.selectedBotId)?.user.name ?? this.selectedBotId;
		},
		canCreate(): boolean {
			return (
				this.createForm.name.length >= 3 &&
				this.createForm.minDelaySeconds >= 10 &&
				this.createForm.maxDelaySeconds >= this.createForm.minDelaySeconds
			);
		}
	},
	async mounted() {
		await this.refresh();
	},
	methods: {
		async refresh() {
			this.error = '';
			this.loading = true;
			try {
				this.bots = await AdminBotsService.list();
				this.drafts = Object.fromEntries(
					this.bots.map(bot => [
						bot.id,
						{
							enabled: bot.enabled,
							strategy: bot.strategy,
							minDelaySeconds: bot.minDelaySeconds,
							maxDelaySeconds: bot.maxDelaySeconds
						}
					])
				);
			} catch (err: any) {
				this.error = err?.message ?? String(err);
			} finally {
				this.loading = false;
			}
		},
		async createBot() {
			if (!this.canCreate) return;
			this.error = '';
			this.success = '';
			this.creating = true;
			try {
				await AdminBotsService.create({
					name: this.createForm.name,
					strategy: this.createForm.strategy,
					minDelaySeconds: this.createForm.minDelaySeconds,
					maxDelaySeconds: this.createForm.maxDelaySeconds
				});
				this.success = `Bot ${this.createForm.name} créé.`;
				this.createForm.name = '';
				await this.refresh();
			} catch (err: any) {
				this.error = err?.message ?? String(err);
			} finally {
				this.creating = false;
			}
		},
		async showHistory(id: string) {
			this.error = '';
			this.selectedBotId = id;
			this.historyLoading = true;
			try {
				this.history = await AdminBotsService.history(id);
			} catch (err: any) {
				this.error = err?.message ?? String(err);
			} finally {
				this.historyLoading = false;
			}
		},
		async saveBot(id: string) {
			const draft = this.drafts[id];
			if (!draft) return;
			if (draft.minDelaySeconds < 10 || draft.maxDelaySeconds < draft.minDelaySeconds) {
				this.error = 'Les délais du bot sont invalides.';
				return;
			}

			this.error = '';
			this.success = '';
			this.savingId = id;
			try {
				const input: UpdateAdminBotInput = {
					enabled: draft.enabled,
					strategy: draft.strategy,
					minDelaySeconds: draft.minDelaySeconds,
					maxDelaySeconds: draft.maxDelaySeconds
				};
				await AdminBotsService.update(id, input);
				this.success = 'Bot mis à jour.';
				await this.refresh();
			} catch (err: any) {
				this.error = err?.message ?? String(err);
			} finally {
				this.savingId = '';
			}
		},
		formatDate(value?: string | Date | null) {
			if (!value) return '—';
			const date = new Date(value);
			return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
		}
	}
});
</script>

<style scoped>
.adminBots {
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 12px;
}
.panel {
	padding: 12px;
	border: 1px solid rgba(255, 231, 170, 0.35);
	border-radius: 8px;
	background: rgba(90, 45, 25, 0.08);
}
.panel h3 {
	margin: 0 0 12px;
}
.form-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(120px, 1fr));
	gap: 10px;
}
.form-grid label {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
input,
select {
	box-sizing: border-box;
	min-height: 28px;
}
.delay {
	width: 52px;
}
.delay-range {
	display: flex;
	align-items: center;
	gap: 3px;
	white-space: nowrap;
}
.planning {
	min-width: 118px;
	font-size: 11px;
	line-height: 1.25;
}
.planning > div {
	white-space: nowrap;
}
.table-wrap {
	width: 100%;
	overflow-x: auto;
}
.bot-name {
	min-width: 90px;
}
.adminBots :deep(table) {
	width: 100%;
	table-layout: auto;
}
.adminBots :deep(th),
.adminBots :deep(td) {
	padding-left: 6px;
	padding-right: 6px;
}
.adminBots :deep(th) {
	white-space: nowrap;
}
.adminBots :deep(td) {
	vertical-align: middle;
}
.toolbar {
	display: flex;
	gap: 10px;
	margin-top: 12px;
}
.row-actions,
.history-header {
	display: flex;
	align-items: center;
	gap: 6px;
}
.row-actions {
	flex-direction: column;
	align-items: stretch;
	min-width: 92px;
}
.history-header {
	justify-content: space-between;
}
.history-header h3 {
	margin: 0;
}
.status-ok {
	font-weight: bold;
}
.status-error {
	font-weight: bold;
	color: #b00020;
}
.history-error {
	max-width: 320px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.toggle {
	display: flex;
	align-items: center;
	gap: 6px;
	white-space: nowrap;
}
.mono {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
.secondary {
	margin-top: 3px;
	font-size: 10px;
	opacity: 0.65;
}
.error,
.success {
	padding: 10px;
	border-radius: 8px;
}
.error {
	border: 1px solid rgba(255, 0, 0, 0.35);
	background: rgba(255, 0, 0, 0.12);
}
.success {
	border: 1px solid rgba(0, 140, 0, 0.35);
	background: rgba(0, 140, 0, 0.12);
}
.empty {
	margin: 12px 0 0;
	opacity: 0.75;
}
@media (max-width: 900px) {
	.form-grid {
		grid-template-columns: repeat(2, minmax(120px, 1fr));
	}
}
</style>

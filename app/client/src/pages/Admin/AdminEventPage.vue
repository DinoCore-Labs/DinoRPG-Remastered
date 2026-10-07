<template>
	<div class="admin-events-page">
		<TitleHeader title="Admin" header="Events :" sub-header="Gestion manuelle des événements" />
		<div class="card">
			<h3>Noël (CHRISTMAS)</h3>
			<div v-if="message" :class="['feedback', messageType]">{{ message }}</div>
			<div class="events-list">
				<div class="event-row">
					<div class="event-meta">
						<span class="event-title">News de début</span>
						<span class="event-desc">Publie la news d'ouverture avec la date de fin dynamique.</span>
					</div>
					<div class="event-actions">
						<DZButton :disabled="loading === 'startNews'" @click="doAction('startNews')">
							{{ loading === 'startNews' ? 'En cours...' : 'Publier' }}
						</DZButton>
					</div>
				</div>
				<div class="event-row">
					<div class="event-meta">
						<span class="event-title">News de fin</span>
						<span class="event-desc">Publie la news de clôture avec le Top 3 joueurs et clans.</span>
					</div>
					<div class="event-actions">
						<DZButton :disabled="loading === 'endNews'" @click="doAction('endNews')">
							{{ loading === 'endNews' ? 'En cours...' : 'Publier' }}
						</DZButton>
					</div>
				</div>
				<div class="event-row">
					<div class="event-meta">
						<span class="event-title">Remise à zéro de l'édition actuelle</span>
						<span class="event-desc">
							Supprime uniquement les scores joueurs et clans de l'édition en cours. Les classements des éditions
							précédentes sont conservés.
						</span>
					</div>
					<div class="event-actions">
						<DZButton
							:disabled="loading === 'resetScores'"
							@click="
								confirmAction(
									'resetScores',
									'Remettre à zéro les scores de l’édition actuelle ? Les anciennes éditions seront conservées.'
								)
							"
						>
							{{ loading === 'resetScores' ? 'En cours...' : 'Exécuter' }}
						</DZButton>
					</div>
				</div>
				<div class="event-row">
					<div class="event-meta">
						<span class="event-title">Distribution des récompenses</span>
						<span class="event-desc">Distribue les lots selon le classement. Ne pas exécuter deux fois !</span>
					</div>
					<div class="event-actions">
						<DZButton
							:disabled="loading === 'distributeRewards'"
							@click="confirmAction('distributeRewards', 'Distribuer les récompenses ? Cette action est irréversible.')"
						>
							{{ loading === 'distributeRewards' ? 'En cours...' : 'Exécuter' }}
						</DZButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import DZButton from '../../components/utils/DZButton.vue';
import { AdminEventService } from '../../services/adminEvent.service';

export default defineComponent({
	name: 'AdminEventPage',
	components: { TitleHeader, DZButton },
	data() {
		return {
			loading: '' as string,
			message: '' as string,
			messageType: 'success' as 'success' | 'error'
		};
	},
	methods: {
		confirmAction(action: string, confirmText: string) {
			if (confirm(confirmText)) {
				this.doAction(action);
			}
		},
		async doAction(action: string) {
			this.loading = action;
			this.message = '';
			try {
				let result: { message: string };
				switch (action) {
					case 'startNews':
						result = await AdminEventService.publishStartNews('CHRISTMAS');
						break;
					case 'endNews':
						result = await AdminEventService.publishEndNews('CHRISTMAS');
						break;
					case 'resetScores':
						result = await AdminEventService.resetScores('CHRISTMAS');
						break;
					case 'distributeRewards':
						result = await AdminEventService.distributeRewards('CHRISTMAS');
						break;
					default:
						throw new Error('Action inconnue');
				}
				this.message = result.message;
				this.messageType = 'success';
			} catch (err: any) {
				this.message = err?.message ?? String(err);
				this.messageType = 'error';
			} finally {
				this.loading = '';
			}
		}
	}
});
</script>

<style scoped lang="scss">
.admin-events-page {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.card {
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;

	h3 {
		margin: 0;
		font-size: 11pt;
		color: #4a2e0a;
	}
}
.events-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.event-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	padding: 12px;
	border: 1px solid #d9c6a5;
	border-radius: 6px;
	background: rgba(255, 248, 232, 0.7);
}
.event-meta {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.event-title {
	font-weight: bold;
	color: #4a2e0a;
}
.event-desc {
	font-size: 9pt;
	color: #7a6040;
}
.event-actions {
	display: flex;
	gap: 8px;
	align-items: center;
	flex-shrink: 0;
}
.feedback {
	padding: 10px 14px;
	border-radius: 6px;
	font-size: 9.5pt;
	border: 1px solid #d9c6a5;
	background: rgba(255, 248, 232, 0.8);
	color: #4a2e0a;

	&.error {
		border-color: #d9a5a5;
		background: rgba(255, 232, 232, 0.8);
		color: #8b2020;
	}
	&.success {
		border-color: #a5d9a5;
		background: rgba(232, 255, 232, 0.8);
		color: #208b20;
	}
}
</style>

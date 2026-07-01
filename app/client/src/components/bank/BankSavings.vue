<template>
	<div class="dz-box bankSavings">
		<h3 class="bankSavingsTitle">
			<img :src="getImgURL('button', 'info_button')" alt="info_button" />
			{{ $t('bank.savings.title') }}
			<img :src="getImgURL('button', 'info_button')" alt="info_button" />
		</h3>
		<div v-if="dataLoaded" class="savingsContent">
			<div class="walletBox">
				<span>{{ $t('leftPanel.wallets.gold') }}</span>
				<strong v-html="formatContent(`${beautifulNumber(uStore.gold)} :gold:`)" />
			</div>
			<div class="savingForm">
				<label for="bankSavingAmount">{{ $t('bank.savings.amount') }}</label>
				<DZInput
					id="bankSavingAmount"
					v-model="amount"
					type="number"
					min="1"
					:max="maxSavingAmount"
					:disabled="saving || maxSavingAmount <= 0"
					@input="normalizeAmount"
				/>
				<label for="bankSavingDuration">{{ $t('bank.savings.duration') }}</label>
				<DZSelect
					id="bankSavingDuration"
					v-model="selectedDurationDays"
					:options="durationOptions"
					:disabled="saving"
				/>
				<p class="preview" v-html="formatContent(previewLabel)" />
				<DZButton :disabled="!canSave" @click="createSaving">
					{{ saving ? $t('button.loading') : $t('bank.savings.save') }}
				</DZButton>
			</div>
			<div class="activeSavings">
				<h4>{{ $t('bank.savings.activeTitle') }}</h4>
				<p v-if="savings.length === 0" class="empty">
					{{ $t('bank.savings.empty') }}
				</p>
				<div v-for="savingItem in activeSavings" :key="savingItem.id" class="savingItem">
					<div class="savingInfo">
						<strong v-html="formatContent(`${beautifulNumber(savingItem.amount)} :gold:`)" />
						<span>
							{{ $t('bank.savings.itemDuration', { days: savingItem.durationDays }) }}
						</span>
						<span
							v-html="
								formatContent(
									$t('bank.savings.itemGain', {
										gold: beautifulNumber(savingItem.interestGold),
										total: beautifulNumber(savingItem.totalGold)
									})
								)
							"
						/>
						<span>
							{{ savingDateLabel(savingItem.unlockAt) }}
						</span>
					</div>
					<DZButton
						v-if="!savingItem.claimedAt"
						size="small"
						:disabled="!savingItem.canClaim || claimingId === savingItem.id"
						@click="claimSaving(savingItem.id)"
					>
						{{ $t('bank.savings.claim') }}
					</DZButton>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import type { BankSavingPlanResponse, BankSavingResponse } from '@dinorpg/core/models/bank/bank.js';
import {
	BANK_SAVING_MAX_DEPOSIT,
	getBankSavingInterestGold,
	getBankSavingTotalGold
} from '@dinorpg/core/models/bank/constants.js';
import { defineComponent } from 'vue';

import { BankService } from '../../services/bank.service';
import { userStore } from '../../store/userStore';
import { beautifulNumber } from '../../utils/beautifulNumber';
import { formatText } from '../../utils/formatText';
import { getImgURL } from '../../utils/getImgURL';
import DZButton from '../utils/DZButton.vue';
import DZInput from '../utils/DZInput.vue';
import DZSelect from '../utils/DZSelect.vue';
import { errorHandler } from '../../utils/errorHandler.ts';

export default defineComponent({
	name: 'BankSavings',
	components: {
		DZButton,
		DZInput,
		DZSelect
	},
	setup() {
		const uStore = userStore();
		return {
			uStore
		};
	},
	data() {
		return {
			plans: [] as BankSavingPlanResponse[],
			savings: [] as BankSavingResponse[],
			amount: 1 as number | string,
			selectedDurationDays: 7 as number,
			dataLoaded: false,
			saving: false,
			claimingId: null as string | null
		};
	},
	computed: {
		normalizedAmount(): number {
			const amount = Number(this.amount);
			if (!Number.isFinite(amount)) {
				return 0;
			}
			return Math.floor(amount);
		},
		selectedPlan(): BankSavingPlanResponse | undefined {
			return this.plans.find(plan => plan.durationDays === Number(this.selectedDurationDays));
		},
		durationOptions() {
			return this.plans.map(plan => ({
				value: plan.durationDays,
				label: this.$t('bank.savings.durationOption', {
					days: plan.durationDays,
					percent: Math.round(plan.interestRate * 100)
				})
			}));
		},
		canSave(): boolean {
			return (
				!!this.selectedPlan &&
				!this.saving &&
				this.normalizedAmount > 0 &&
				this.normalizedAmount <= this.maxSavingAmount
			);
		},
		previewLabel(): string {
			if (!this.selectedPlan || this.normalizedAmount <= 0) {
				return this.$t('bank.savings.previewEmpty');
			}
			const interestGold = getBankSavingInterestGold(this.normalizedAmount, this.selectedPlan.interestRateBps);
			const totalGold = getBankSavingTotalGold(this.normalizedAmount, this.selectedPlan.interestRateBps);
			return this.$t('bank.savings.preview', {
				gold: beautifulNumber(this.normalizedAmount),
				interest: beautifulNumber(interestGold),
				total: beautifulNumber(totalGold)
			});
		},
		maxSavingAmount(): number {
			return Math.min(this.uStore.gold, BANK_SAVING_MAX_DEPOSIT);
		},
		activeSavings(): BankSavingResponse[] {
			return this.savings.filter(saving => !saving.claimedAt);
		}
	},
	methods: {
		getImgURL,
		beautifulNumber,
		formatContent: formatText,
		async loadSavings() {
			try {
				this.dataLoaded = false;
				const result = await BankService.getSavings();
				this.plans = result.plans;
				this.savings = result.savings;
				if (!this.plans.some(plan => plan.durationDays === Number(this.selectedDurationDays))) {
					this.selectedDurationDays = this.plans[0]?.durationDays ?? 7;
				}
			} catch {
				this.$toast.open({
					message: this.$t('toast.bank.savings.loadError'),
					type: 'error'
				});
			} finally {
				this.dataLoaded = true;
			}
		},
		normalizeAmount() {
			let amount = Number(this.amount);
			if (!Number.isFinite(amount)) {
				amount = 1;
			}
			amount = Math.floor(amount);
			if (this.maxSavingAmount <= 0) {
				this.amount = 0;
				return;
			}
			if (amount < 1) {
				this.amount = 1;
				return;
			}
			if (amount > this.uStore.gold) {
				this.amount = this.uStore.gold;
				return;
			}
			this.amount = amount;
		},
		async createSaving() {
			this.normalizeAmount();
			if (!this.canSave) {
				return;
			}
			this.saving = true;
			try {
				const result = await BankService.createSaving(this.normalizedAmount, Number(this.selectedDurationDays));
				this.uStore.setGold(result.wallets.gold);
				this.savings = [result.saving, ...this.savings];
				this.$toast.open({
					message: formatText(
						this.$t('toast.bank.savings.success', {
							gold: beautifulNumber(result.saving.amount),
							days: result.saving.durationDays,
							total: beautifulNumber(result.saving.totalGold)
						})
					),
					type: 'success'
				});
				this.amount = result.wallets.gold > 0 ? 1 : 0;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.saving = false;
			}
		},
		async claimSaving(id: string) {
			this.claimingId = id;
			try {
				const result = await BankService.claimSaving(id);
				this.uStore.setGold(result.wallets.gold);
				this.savings = this.savings.map(saving => (saving.id === id ? result.saving : saving));
				this.$toast.open({
					message: formatText(
						this.$t('toast.bank.savings.claimSuccess', {
							gold: beautifulNumber(result.saving.totalGold)
						})
					),
					type: 'success'
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.claimingId = null;
			}
		},
		savingDateLabel(date: string) {
			return this.$t('bank.savings.unlockAt', {
				date: new Intl.DateTimeFormat(this.$i18n.locale, {
					dateStyle: 'short',
					timeStyle: 'short'
				}).format(new Date(date))
			});
		}
	},
	mounted() {
		this.loadSavings();
	}
});
</script>

<style lang="scss" scoped>
.bankSavings {
	width: min(620px, 95%);
	padding: 0 10px 12px;
	color: #ffee92;
	font-size: 10pt;
	.bankSavingsTitle {
		justify-content: space-evenly;
	}
	.savingsContent {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 10px;
	}
	.walletBox {
		display: flex;
		justify-content: center;
		gap: 8px;
		padding: 8px;
		background: rgba(0, 0, 0, 0.18);
		border: 1px solid rgba(255, 231, 170, 0.35);
	}
	.savingForm {
		display: grid;
		grid-template-columns: 1fr;
		gap: 6px;
		justify-items: center;
	}
	.preview {
		margin: 4px 0;
		text-align: center;
		font-weight: bold;
	}
	.activeSavings {
		display: flex;
		flex-direction: column;
		gap: 8px;
		h4 {
			margin: 0;
			text-align: center;
			color: #fce3bc;
		}
	}
	.empty {
		margin: 0;
		text-align: center;
	}
	.savingItem {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 8px;
		background: rgba(0, 0, 0, 0.16);
		border: 1px solid rgba(255, 231, 170, 0.25);
	}
	.savingInfo {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
}
@media (max-width: 540px) {
	.bankSavings {
		.savingItem {
			flex-direction: column;
			text-align: center;
		}
	}
}
</style>

<template>
	<div class="dz-box bankExchange">
		<h3 class="bankExchangeTitle">
			<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			{{ $t('bank.exchange.title') }}
			<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
		</h3>
		<div v-if="dataLoaded && rate" class="exchangeContent">
			<div class="rateBox">
				<strong>{{ $t('bank.exchange.dailyRate') }}</strong>
				<span
					v-html="
						formatContent(
							$t('bank.exchange.rateValue', {
								rate: exchangeRateLabel,
								gold: beautifulNumber(rate.goldPerTreasureTicket)
							})
						)
					"
				/>
			</div>
			<dl class="walletInfo">
				<dt>{{ $t('bank.exchange.yourTickets') }}</dt>
				<dd v-html="formatContent(`${beautifulNumber(uStore.treasureTicket)} :ticket:`)" />
				<dt>{{ $t('leftPanel.wallets.gold') }}</dt>
				<dd v-html="formatContent(`${beautifulNumber(uStore.gold)} :gold:`)" />
			</dl>
			<div class="formLine">
				<label for="treasureTicketQuantity">
					{{ $t('bank.exchange.quantity') }}
				</label>
				<div class="quantityInput">
					<DZInput
						id="treasureTicketQuantity"
						v-model="quantity"
						class="quantityField"
						type="number"
						min="1"
						:max="maxQuantity"
						:disabled="maxQuantity <= 0 || converting"
						@input="normalizeQuantity"
					/>
					<DZButton class="bSmall" :disabled="maxQuantity <= 0 || converting" @click="setMaxQuantity">
						{{ $t('bank.exchange.max') }}
					</DZButton>
				</div>
			</div>
			<p
				class="preview"
				v-html="
					formatContent(
						$t('bank.exchange.youWillReceive', {
							gold: beautifulNumber(previewGold)
						})
					)
				"
			/>
			<DZButton class="convertButton" :disabled="!canConvert" @click="convertTreasureTickets">
				{{ converting ? $t('button.loading') : $t('bank.exchange.convert') }}
			</DZButton>
		</div>
	</div>
</template>

<script lang="ts">
import { getTreasureTicketGoldValue } from '@dinorpg/core/models/bank/constants.js';
import type { BankExchangeRateResponse } from '@dinorpg/core/models/bank/bank.js';
import { defineComponent } from 'vue';

import { BankService } from '../../services/bank.service.js';
import { userStore } from '../../store/userStore';
import { beautifulNumber } from '../../utils/beautifulNumber';
import { formatText } from '../../utils/formatText';
import { getImgURL } from '../../utils/getImgURL';
import DZButton from '../utils/DZButton.vue';
import DZInput from '../utils/DZInput.vue';
import { errorHandler } from '../../utils/errorHandler.ts';

export default defineComponent({
	name: 'BankTreasureTicketExchange',
	components: {
		DZButton,
		DZInput
	},
	setup() {
		const uStore = userStore();
		return {
			uStore
		};
	},
	data() {
		return {
			rate: null as BankExchangeRateResponse | null,
			quantity: 1,
			dataLoaded: false,
			converting: false
		};
	},
	computed: {
		maxQuantity(): number {
			return this.uStore.treasureTicket;
		},
		normalizedQuantity(): number {
			const quantity = Number(this.quantity);
			if (!Number.isFinite(quantity)) {
				return 0;
			}
			return Math.floor(quantity);
		},
		canConvert(): boolean {
			return (
				!!this.rate && !this.converting && this.normalizedQuantity > 0 && this.normalizedQuantity <= this.maxQuantity
			);
		},
		previewGold(): number {
			if (!this.rate || this.normalizedQuantity <= 0) {
				return 0;
			}
			return getTreasureTicketGoldValue(this.normalizedQuantity, this.rate.rateBps);
		},
		exchangeRateLabel(): string {
			if (!this.rate) {
				return '-';
			}
			return this.rate.rate.toFixed(2);
		}
	},
	methods: {
		getImgURL,
		beautifulNumber,
		formatContent: formatText,
		async loadRate() {
			try {
				this.dataLoaded = false;
				this.rate = await BankService.getExchangeRate();
			} catch {
				this.$toast.open({
					message: this.$t('toast.bank.exchange.rateError'),
					type: 'error'
				});
			} finally {
				this.dataLoaded = true;
			}
		},
		setMaxQuantity() {
			this.quantity = this.maxQuantity;
			this.normalizeQuantity();
		},
		normalizeQuantity() {
			let quantity = Number(this.quantity);
			if (!Number.isFinite(quantity)) {
				quantity = 1;
			}
			quantity = Math.floor(quantity);
			if (this.maxQuantity <= 0) {
				this.quantity = 0;
				return;
			}
			if (quantity < 1) {
				this.quantity = 1;
				return;
			}
			if (quantity > this.maxQuantity) {
				this.quantity = this.maxQuantity;
				return;
			}
			this.quantity = quantity;
		},

		async convertTreasureTickets() {
			this.normalizeQuantity();
			if (!this.canConvert) {
				return;
			}
			this.converting = true;
			try {
				const result = await BankService.convertTreasureTickets(this.normalizedQuantity);
				this.uStore.setGold(result.wallets.gold);
				this.uStore.setTicket(result.wallets.treasureTicket);
				this.$toast.open({
					message: formatText(
						this.$t('toast.bank.exchange.success', {
							quantity: result.quantity,
							gold: beautifulNumber(result.goldAdded)
						})
					),
					type: 'success'
				});
				this.quantity = result.wallets.treasureTicket > 0 ? 1 : 0;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.converting = false;
			}
		}
	},
	mounted() {
		this.loadRate();
	}
});
</script>

<style lang="scss" scoped>
.bankExchange {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 8px;
	color: #ffee92;
	font-size: 10pt;
	width: min(620px, 92%);
	padding: 0 10px 12px;
	margin: 0 auto;
	.bankExchangeTitle {
		justify-content: space-evenly;
		margin: 0;
	}
	.exchangeContent {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 10px;
	}
	.rateBox {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		padding: 8px;
		background: rgba(0, 0, 0, 0.18);
		border: 1px solid rgba(255, 231, 170, 0.35);
	}
	.walletInfo {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 6px 12px;
		margin: 0;
		dt {
			color: #fce3bc;
		}
		dd {
			margin: 0;
			font-weight: bold;
			text-align: right;
		}
	}
	.formLine {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.quantityInput {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		input {
			width: 90px;
			text-align: center;
		}
	}
	.preview {
		margin: 0;
		text-align: center;
		font-weight: bold;
	}
	.convertButton {
		align-self: center;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
			opacity: 0.55;
		}
	}
	.feedback {
		margin: 0;
		text-align: center;
		&.success {
			color: #b8ff8c;
		}
		&.error {
			color: #ff9d8c;
		}
	}
}
@media (max-width: 540px) {
	.bankExchange {
		.walletInfo {
			grid-template-columns: 1fr;
			text-align: center;

			dd {
				text-align: center;
			}
		}
	}
}
</style>

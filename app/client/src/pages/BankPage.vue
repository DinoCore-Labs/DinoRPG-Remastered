<template>
	<TitleHeader :title="$t('pageTitle.bank')" :header="formatContent($t(`bank.title`))" />
	<div class="bank">
		<div class="dz-box bankDesc">
			<h3 class="bankName">
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
				{{ $t(`bank.rotshil`) }}
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			</h3>
			<img class="art" :src="getImgURL('shop', 'bank_rotshil')" :alt="formatContent($t(`bank.rotshil`))" />
			<p class="shopText" v-html="formatContent($t(`bank.description`))" />
		</div>
	</div>
	<div class="infos">
		<ul class="onglets">
			<li :class="tabSelected === 1 ? 'active' : ''">
				<a @click="sStore.setTabAccount(1)">{{ $t('bank.tabs.conversion') }}</a>
			</li>
			<li :class="tabSelected === 2 ? 'active disabled' : 'disabled'">
				<a @click="sStore.setTabAccount(2)">{{ $t('bank.tabs.todo') }}</a>
			</li>
		</ul>
		<BankTreasureTicketExchange v-if="tabSelected === 1" />
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import BankTreasureTicketExchange from '../components/bank/BankTreasureTicketExchange.vue';
import { sessionStore } from '../store/sessionStore.ts';

export default defineComponent({
	name: 'BankOfDinoland',
	setup() {
		const sStore = sessionStore();
		return { sStore };
	},
	components: {
		TitleHeader,
		BankTreasureTicketExchange
	},
	data() {
		return {};
	},
	computed: {
		tabSelected(): number {
			return this.sStore.getTabAccount;
		}
	}
});
</script>

<style lang="scss" scoped>
.bank {
	display: flex;
	align-self: center;
	flex-direction: column;
	align-items: center;
	gap: 15px;
	.bankDesc {
		font-style: italic;
		color: #ffee92;
		font-size: 10pt;
		display: grid;
		grid-template-rows: 17px auto;
		grid-template-columns: 180px auto;
		grid-template-areas: 'top top ' 'left center';
		min-height: 160px;
		max-width: 95%;
		padding-right: 10px;
		padding-bottom: 10px;
		.art {
			grid-area: left;
			justify-self: center;
			margin-top: 15px;
		}
		.shopText {
			grid-area: center;
			margin: 0px;
			justify-self: center;
			margin-top: 15px;
		}
		.bankName {
			grid-area: top;
			justify-self: stretch;
			align-self: center;
			justify-content: space-evenly;
		}
	}
}
.onglets {
	list-style: none;
	height: 20px;
	align-self: center;
	background-color: transparent;
	background-image: url('../assets/design/tabs/tabsBg.webp');
	background-repeat: no-repeat;
	border-bottom: 1.2px solid #ffe7aa;
	li {
		float: left;
		position: relative;
		margin-right: 5px;
		cursor: pointer;
		:hover {
			color: white;
		}
		&.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
		a {
			color: #fce3bc;
			text-decoration: none;
			padding-left: 5px;
			padding-right: 5px;
			background-color: #bc683c;
			border-right: 1px solid black;
			border-left: 1px solid #d39a65;
			border-top: 1px solid #d39a65;
			font-size: 10pt;
			border-radius: 0px;
		}
	}
}
</style>

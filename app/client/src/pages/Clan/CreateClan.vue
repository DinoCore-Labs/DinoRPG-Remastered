<template>
	<TitleHeader :title="$t('pageTitle.createClan')" :header="$t('createClan.title')"></TitleHeader>
	<div id="chooseClanName">
		<DZDisclaimer help round :content="$t('createClan.information', { cost: creationCost })" />
		<div class="middle-content">
			<div class="grid">
				<p>{{ $t('createClan.clan_name') }}</p>
				<DZInput type="text" v-model="clanName" />
				<p>{{ $t('createClan.clan_langs') }}</p>
				<LangSelector v-model="langs" class="lang-selector" />
				<p>{{ $t('createClan.clan_description') }}</p>
				<textarea class="description" type="text" v-model="description"></textarea>
			</div>
		</div>
		<div class="end-content">
			<div class="buttons">
				<a class="button" @click="goToClanList()">{{ $t('createClan.go_back_button') }}</a>
				<a class="button" @click="CreateClan()">{{ $t('createClan.create_button') }}</a>
			</div>
			<img :src="getImgURL('background', 'logo_clan_swords')" alt="clan_image" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import { errorHandler } from '../../utils/errorHandler.js';
import { ClanService } from '../../services/clan.service.ts';
import { CLAN_CREATE_MONEY } from '@dinorpg/core/models/clan/constants.js';
import { formatNumber } from '../../utils/formatText.js';
import { userStore } from '../../store/userStore';
import DZDisclaimer from '../../components/utils/DZDisclaimer.vue';
import DZInput from '../../components/utils/DZInput.vue';
import LangSelector from '../../components/clan/LangSelector.vue';
import { Language } from '@dinorpg/core/models/config/language.js';

export default defineComponent({
	name: 'CreateClan',
	components: {
		LangSelector,
		DZDisclaimer,
		TitleHeader,
		DZInput
	},
	data() {
		return {
			clanName: '' as string,
			langs: [] as Language[],
			description: '' as string,
			canCreateClan: false as boolean,
			creationCost: formatNumber(CLAN_CREATE_MONEY, '.'),
			userStore: userStore()
		};
	},
	methods: {
		async CreateClan(): Promise<void> {
			try {
				const clan = await ClanService.createClan(this.clanName, this.description, this.langs);
				this.userStore.setClanId(clan.id);

				this.$router.push({ name: 'Clan', params: { id: clan.id } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		goToClanList(): void {
			this.$router.push({ name: 'ClansList' });
		}
	},
	mounted() {
		this.langs = [this.$i18n.locale as Language];
	}
});
</script>

<style lang="scss" scoped>
#chooseClanName {
	max-width: 95%;
	align-self: center;
}
.disclaimer {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
	flex-grow: 2;
	strong {
		color: #ffee92;
	}
}
.grid {
	display: inline-grid;
	column-gap: 5px;
	row-gap: 5px;
	align-items: center;
	p {
		grid-column: 1;
		margin: 0;
		width: 187px;
		height: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		font-variant: normal;
		font-weight: bold;
		font-size: 8pt;
		color: #ffee92;
		text-align: center;
		background-color: #e4aa69;
		border-radius: 10px;
	}
	textarea {
		grid-column: 2;
		padding-left: 8px;
		padding-right: 8px;
		color: #ffee92;
		font-size: 9pt;
		font-weight: bold;
		border: none;
		height: 100px;
		width: 184px;
		background-color: #bc683c;
		resize: vertical;
	}
	.lang-selector {
		grid-column: 2;
		display: flex;
		align-items: center;
		width: 184px;
		height: 20px;
		flex-wrap: wrap;
		justify-content: space-around;
	}
}
.middle-content {
	display: flex;
	.grid {
		margin: auto;
	}
}
.end-content {
	display: flex;
	flex-direction: column;
	.buttons {
		display: flex;
		column-gap: 10px;
		margin: 10px auto;
	}
	img {
		margin: auto;
		width: 190px;
	}
}
</style>

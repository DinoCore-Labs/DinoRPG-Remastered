<template>
	<div v-if="hasAccess" class="wrapper">
		<div class="banner-panel dz-box" v-if="hasBannerEditRight">
			<h3>{{ $t('clan.settings.banner.title') }}</h3>
			<div class="action">
				<input ref="fileInput" type="file" @change="onFileChanged()" />
				<img
					v-if="filePreviewUrl"
					:src="filePreviewUrl"
					alt="File Preview"
					style="max-width: 300px; max-height: 300px"
				/>
			</div>
			<div class="disclaimer">
				<img :src="getImgURL('icons', 'small_question')" alt="info_button" style="margin-right: 2px" />
				{{ $t('clan.settings.banner.info') }}
			</div>
		</div>

		<div v-if="hasLangEditRight" class="language-panel dz-box">
			<h3>{{ $t('clan.settings.langs.title') }}</h3>
			<LangSelector v-model="langs" @change="saveLangs" class="df" />
		</div>

		<div v-if="hasNameEditRight" class="name-panel dz-box">
			<h3>{{ $t('clan.settings.name.title') }}</h3>
			<div class="action">
				<DZInput v-model="clanName" type="text" />
				<a class="button" @click="saveName">{{ $t('clan.settings.name.save') }}</a>
			</div>
		</div>

		<a class="button" @click="deleteClan()">{{ $t('clan.settings.action.delete') }}</a>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanService } from '../../services/clan.service.js';
import { errorHandler } from '../../utils/errorHandler.ts';
import { userStore } from '../../store/userStore.ts';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import LangSelector from './LangSelector.vue';
import DZInput from '../../components/utils/DZInput.vue';
import { Language } from '@dinorpg/core/models/config/language.js';
import { clanStore } from '../../store/clanStore';

export default defineComponent({
	name: 'ClanParameters',
	components: { LangSelector, DZInput },
	data() {
		return {
			userStore: userStore(),
			hasAccess: false as boolean,
			banner_url: '' as string,
			hasBannerEditRight: false as boolean,
			hasLangEditRight: false as boolean,
			hasNameEditRight: false as boolean, // nouveau
			filePreviewUrl: '',
			clanStore: clanStore(),
			langs: [] as Language[],
			clanName: '' as string // nouveau
		};
	},
	methods: {
		// --- nouveau ---
		async getHasNameEditRight() {
			try {
				this.hasNameEditRight = await ClanService.getPlayerHasRight(
					this.clanStore.getClanId,
					ClanMemberRight.CLAN_EDIT_NAME
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async saveName(): Promise<void> {
			const trimmed = (this.clanName as string).trim();
			if (!trimmed) return;
			try {
				await ClanService.updateClanName(this.clanStore.getClanId, trimmed);
				this.clanStore.updateName(trimmed);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},

		async saveLangs(): Promise<void> {
			try {
				await this.clanStore.updateLang(this.clanStore.getClanId, this.langs);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async deleteClan(): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				try {
					await ClanService.deleteClan(this.clanStore.getClanId);
					this.userStore.setClanId(null);

					this.$router.push({ name: 'clansList' });
				} catch (err) {
					errorHandler.handle(err, this.$toast);
				}
			}
		},
		async getHasBannerEditRight() {
			try {
				this.hasBannerEditRight = await ClanService.getPlayerHasRight(
					this.clanStore.getClanId,
					ClanMemberRight.CLAN_EDIT_BANNER
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async getHasLangEditRight() {
			try {
				this.hasLangEditRight = await ClanService.getPlayerHasRight(
					this.clanStore.getClanId,
					ClanMemberRight.CLAN_EDIT_LANG
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async onFileChanged() {
			const form = new FormData();
			const image = this.$refs.fileInput as HTMLInputElement;
			const file = image.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = e => {
					this.filePreviewUrl = e.target?.result as string;
					this.clanStore.updateBanner(this.filePreviewUrl);
				};
				reader.readAsDataURL(file);
				form.delete('file');
				form.append('file', file);
				await ClanService.updateClanBanner(this.clanStore.getClanId, form);
			}
		}
	},
	async mounted() {
		this.hasAccess = this.userStore.clanId == this.clanStore.getClanId;
		if (!this.hasAccess) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
		await Promise.all([this.getHasBannerEditRight(), this.getHasLangEditRight(), this.getHasNameEditRight()]);
		if (!this.hasBannerEditRight && !this.hasLangEditRight && !this.hasNameEditRight) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
		this.langs = (this.clanStore.getClan?.languages as Language[]) ?? [];
		this.clanName = this.clanStore.getClan?.name ?? '';
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	margin-right: 10px;
	width: auto;
	display: flex;
	flex-direction: column;
	width: calc(100% - 11px) !important;
	box-sizing: border-box;
	.banner-panel {
		margin: 8px 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		color: #fce3bb;
		padding: 0 8px 8px 8px;
		h3 {
			margin-top: 0;
		}
		.action {
			display: flex;
			gap: 8px;
			align-items: center;
			justify-content: space-between;
			align-items: center;
			input {
				width: 75%;
			}
		}
		.disclaimer {
			font-style: italic;
			font-size: 12px;
		}
	}
	.language-panel {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 0 8px 8px 8px;
		h3 {
			margin-top: 0;
		}
	}
}
</style>

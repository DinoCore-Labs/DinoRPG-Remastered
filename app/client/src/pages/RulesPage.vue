```vue
<template>
	<TitleHeader :title="$t('gameRules.pageTitle')" :header="$t('gameRules.title')" />
	<div class="intro">
		<div class="menu">
			<ul class="list">
				<li
					v-for="(item, index) in items"
					:key="item.id"
					:class="{ selected: selectedItemIndex === index }"
					@click="showContent(item, index)"
				>
					{{ item.name }}
				</li>
			</ul>
		</div>
		<div class="image">
			<img :src="getImgURL('design', 'rocky_01')" alt="" />
		</div>
	</div>
	<div class="showContent">
		<div class="content">
			<div class="rulesMetadata">
				<strong>
					{{
						$t('gameRules.version', {
							version: gameRulesVersion
						})
					}}
				</strong>
				<span>
					{{
						$t('gameRules.updatedAt', {
							date: formattedUpdatedAt
						})
					}}
				</span>
			</div>
			<section
				v-for="(item, sectionIndex) in items"
				:id="`rules-section-${item.id}`"
				:key="item.id"
				class="sectionContent"
				:class="{
					activeSection: selectedItemIndex === sectionIndex
				}"
			>
				<h3 class="titleSection">
					{{ item.name }}
				</h3>
				<template v-for="(block, blockIndex) in item.blocks" :key="`${item.id}-${blockIndex}`">
					<ul v-if="block.type === 'paragraph'" class="textContent">
						<li>
							<p>
								{{ $t(block.key) }}
							</p>
						</li>
					</ul>
					<ul v-else-if="block.type === 'list'" class="listItemsContent">
						<li v-for="key in block.keys" :key="key">
							<img :src="getImgURL('icons', 'info_button')" alt="" />
							<span>
								{{ $t(key) }}
							</span>
						</li>
					</ul>
					<ul v-else-if="block.type === 'email'" class="textContent">
						<li>
							<p>
								{{ $t(block.introKey) }}
								<a :href="`mailto:${$t(block.emailKey)}`">
									{{ $t(block.emailKey) }}
								</a>
							</p>
						</li>
					</ul>
				</template>
			</section>
			<section v-if="mustAcceptRules" id="rules-acceptance" class="sectionContent acceptanceBox">
				<h3 class="titleSection">
					{{ $t('gameRules.acceptance.title') }}
				</h3>
				<ul class="textContent">
					<li>
						<p>
							{{ $t('gameRules.acceptance.description') }}
						</p>
					</li>
				</ul>
				<div class="acceptanceActions">
					<DZCheckbox id="game-rules-acceptance" v-model="rulesAccepted" :disabled="isSubmitting">
						{{
							$t('gameRules.acceptance.checkbox', {
								version: gameRulesVersion
							})
						}}
					</DZCheckbox>
					<DZButton :disabled="!rulesAccepted || isSubmitting" @click="acceptRules">
						{{ isSubmitting ? $t('gameRules.acceptance.submitting') : $t('gameRules.acceptance.button') }}
					</DZButton>
				</div>
			</section>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TitleHeader from '../components/utils/TitleHeader.vue';
import DZButton from '../components/utils/DZButton.vue';
import DZCheckbox from '../components/utils/DZCheckbox.vue';
import { UserService } from '../services/user.service';
import { userStore } from '../store/userStore';
import { GAME_RULES_UPDATED_AT, GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';

type RulesPageImage = {
	path: string;
	name: string;
};

type RulesPageBlock =
	| {
			type: 'paragraph';
			key: string;
	  }
	| {
			type: 'list';
			keys: string[];
	  }
	| {
			type: 'email';
			introKey: string;
			emailKey: string;
	  };

type RulesPageItem = {
	id: string;
	name: string;
	nameImageUrl?: RulesPageImage;
	blocks: RulesPageBlock[];
};

export default defineComponent({
	name: 'RulesPage',
	components: {
		TitleHeader,
		DZButton,
		DZCheckbox
	},
	data() {
		return {
			user: userStore(),
			selectedItemIndex: 0,
			rulesAccepted: false,
			isSubmitting: false,
			gameRulesVersion: GAME_RULES_VERSION
		};
	},
	computed: {
		items(): RulesPageItem[] {
			return [
				{
					id: 'general',
					name: this.$t('gameRules.sections.general.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'gameRules.sections.general.intro'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.general.forbiddenIntro'
						},
						{
							type: 'list',
							keys: [
								'gameRules.sections.general.forbidden.harassment',
								'gameRules.sections.general.forbidden.illegal',
								'gameRules.sections.general.forbidden.spam',
								'gameRules.sections.general.forbidden.impersonation',
								'gameRules.sections.general.forbidden.personalData',
								'gameRules.sections.general.forbidden.links'
							]
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.general.outro'
						}
					]
				},
				{
					id: 'accounts',
					name: this.$t('gameRules.sections.accounts.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'gameRules.sections.accounts.intro'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.accounts.password'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.accounts.singleAccount'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.accounts.household'
						}
					]
				},
				{
					id: 'cheating',
					name: this.$t('gameRules.sections.cheating.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'gameRules.sections.cheating.intro'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.cheating.forbiddenIntro'
						},
						{
							type: 'list',
							keys: [
								'gameRules.sections.cheating.forbidden.automation',
								'gameRules.sections.cheating.forbidden.exploit',
								'gameRules.sections.cheating.forbidden.duplicate',
								'gameRules.sections.cheating.forbidden.requests',
								'gameRules.sections.cheating.forbidden.authorization',
								'gameRules.sections.cheating.forbidden.account',
								'gameRules.sections.cheating.forbidden.disruption'
							]
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.cheating.report'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.cheating.devTools'
						}
					]
				},
				{
					id: 'market',
					name: this.$t('gameRules.sections.market.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'gameRules.sections.market.intro'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.market.forbidden'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.market.outro'
						}
					]
				},
				{
					id: 'reporting',
					name: this.$t('gameRules.sections.reporting.title'),
					blocks: [
						{
							type: 'email',
							introKey: 'gameRules.sections.reporting.intro',
							emailKey: 'legalNotices.contactEmail'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.reporting.details'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.reporting.disclosure'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.reporting.goodFaith'
						}
					]
				},
				{
					id: 'sanctions',
					name: this.$t('gameRules.sections.sanctions.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'gameRules.sections.sanctions.intro'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.sanctions.proportionality'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.sanctions.circumvention'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.sanctions.appeal'
						}
					]
				},
				{
					id: 'changes',
					name: this.$t('gameRules.sections.changes.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'gameRules.sections.changes.intro'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.changes.version'
						},
						{
							type: 'paragraph',
							key: 'gameRules.sections.changes.acceptance'
						}
					]
				}
			];
		},
		selectedItem(): RulesPageItem | null {
			return this.items[this.selectedItemIndex] ?? null;
		},
		prevItemName(): string {
			if (this.selectedItemIndex <= 0) {
				return '';
			}
			return this.items[this.selectedItemIndex - 1]?.name ?? '';
		},
		nextItemName(): string {
			if (this.selectedItemIndex >= this.items.length - 1) {
				return '';
			}
			return this.items[this.selectedItemIndex + 1]?.name ?? '';
		},
		formattedUpdatedAt(): string {
			return new Intl.DateTimeFormat(String(this.$i18n.locale), {
				dateStyle: 'long',
				timeZone: 'UTC'
			}).format(new Date(`${GAME_RULES_UPDATED_AT}T12:00:00.000Z`));
		},
		mustAcceptRules(): boolean {
			return this.user.mustAcceptGameRules;
		}
	},
	methods: {
		showContent(item: RulesPageItem, index: number) {
			this.selectedItemIndex = index;
			this.$nextTick(() => {
				document.getElementById(`rules-section-${item.id}`)?.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
			});
		},
		showNextItem() {
			if (this.selectedItemIndex >= this.items.length - 1) {
				return;
			}
			const nextIndex = this.selectedItemIndex + 1;
			const nextItem = this.items[nextIndex];
			if (!nextItem) {
				return;
			}
			this.showContent(nextItem, nextIndex);
		},
		showPrevItem() {
			if (this.selectedItemIndex <= 0) {
				return;
			}
			const previousIndex = this.selectedItemIndex - 1;
			const previousItem = this.items[previousIndex];

			if (!previousItem) {
				return;
			}
			this.showContent(previousItem, previousIndex);
		},
		goToPage(pageName: string) {
			this.$router.push({
				name: pageName
			});
		},
		async acceptRules() {
			if (!this.rulesAccepted || this.isSubmitting) {
				return;
			}
			this.isSubmitting = true;
			try {
				const gameRules = await UserService.acceptGameRules(GAME_RULES_VERSION);
				this.user.setGameRules(gameRules);
				this.$toast.success(this.$t('gameRules.acceptance.success'));
				const redirectQuery = this.$route.query.redirect;
				const redirectValue = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery;
				const redirect =
					typeof redirectValue === 'string' &&
					redirectValue.startsWith('/') &&
					!redirectValue.startsWith('//') &&
					redirectValue !== '/rules'
						? redirectValue
						: '/news';
				await this.$router.replace(redirect);
			} catch {
				this.$toast.error(this.$t('gameRules.acceptance.error'));
			} finally {
				this.isSubmitting = false;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.intro {
	display: flex;
	margin-left: 10px;
	max-width: 95%;
	align-self: baseline;
	.menu {
		background-color: #e09b6244;
		border-radius: 5px;
		width: 220px;
		.list {
			color: rgb(142, 62, 38);
			cursor: pointer;
			font-variant: small-caps;
			font-weight: bold;
			list-style: none;
			margin-top: 6px;
			margin-left: -25px;
			li {
				display: flex;
				align-items: center;
				gap: 5px;
				padding: 1px 3px;
			}
			li:hover,
			li.selected {
				color: #fce3bc;
				background-color: rgb(142, 62, 38);
			}
			img {
				flex-shrink: 0;
			}
		}
	}
	.image {
		margin-top: auto;
		img {
			max-width: 95%;
			height: auto;
		}
	}
}
.showContent {
	max-width: 95%;
	align-self: center;
	.content {
		margin-top: 10px;
		.titleContent {
			height: fit-content;
			background-image: url('../assets/design/title/title_h1.webp');
			background-position: left bottom;
			background-repeat: no-repeat;
			padding-bottom: 22px;
			h3 {
				margin-left: 5px;
				color: #71b703;
				font-variant: small-caps;
			}
		}
		:deep(strong) {
			color: rgb(142, 62, 38);
		}
		:deep(i) {
			color: rgb(142, 62, 38);
		}
		.rulesMetadata {
			display: flex;
			flex-direction: column;
			gap: 3px;
			margin: 10px 5px 20px;
		}
		.sectionContent {
			margin-top: 15px;
			scroll-margin-top: 15px;
			.titleSection {
				background-image: url('../assets/design/title/title_h2.webp');
				background-position: left bottom;
				background-repeat: no-repeat;
				color: #fff1ad;
				padding-left: 5px;
			}
			.textContent {
				display: flex;
				flex-direction: column;
				gap: 10px;
				list-style: none;
				margin-left: -35px;
				p {
					margin: 0;
				}
				a {
					color: rgb(142, 62, 38);
					font-weight: bold;
					text-decoration: underline;
					text-underline-offset: 2px;
					&:hover {
						color: #71b703;
					}
				}
			}
			.listItemsContent {
				list-style: none;
				margin-top: 12px;
				margin-bottom: 15px;
				li {
					display: flex;
					align-items: flex-start;
					margin-top: 10px;
					margin-left: 10px;
					img {
						flex-shrink: 0;
						margin-top: 2px;
						margin-right: 8px;
					}
				}
			}
		}
		.navigationButtons {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			margin-top: 10px;
		}
	}
}
.acceptanceBox {
	margin-top: 30px !important;
	padding: 10px;
	background-color: rgba(224, 155, 98, 0.15);
	border: 1px solid rgba(142, 62, 38, 0.25);
	border-radius: 4px;
}
.acceptanceActions {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 15px;
	margin-top: 15px;
	:deep(.dz-checkbox .text) {
		color: rgb(142, 62, 38);
		line-height: 1.4;
	}
}
@media only screen and (max-width: 600px) {
	.intro {
		flex-direction: column;
		margin-left: 0;
		align-self: center;
		width: 95%;
		.menu {
			width: 100%;
		}
		.image {
			display: none;
		}
	}
	.showContent {
		width: 95%;
	}
	.navigationButtons {
		gap: 5px;
	}
	.showContent .content .next {
		margin-left: 2px;
		margin-right: 2px;
	}
}
</style>
```

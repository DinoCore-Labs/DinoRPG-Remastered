<template>
	<TitleHeader :title="$t('legalNotices.pageTitle')" :header="$t('legalNotices.title')" />
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
				<span>
					{{
						$t('legalNotices.updatedAt', {
							date: formattedUpdatedAt
						})
					}}
				</span>
			</div>
			<section
				v-for="(item, sectionIndex) in items"
				:id="`legal-notices-section-${item.id}`"
				:key="item.id"
				class="sectionContent"
				:class="{ activeSection: selectedItemIndex === sectionIndex }"
			>
				<h3 class="titleSection">
					{{ item.name }}
				</h3>
				<template v-for="(block, blockIndex) in item.blocks" :key="`${item.id}-${blockIndex}`">
					<ul v-if="block.type === 'paragraph'" class="textContent">
						<li>
							<p>{{ $t(block.key) }}</p>
						</li>
					</ul>
					<ul v-else-if="block.type === 'list'" class="listItemsContent">
						<li v-for="key in block.keys" :key="key">
							<img :src="getImgURL('icons', 'info_button')" alt="" />
							<span>{{ $t(key) }}</span>
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
					<ul v-else-if="block.type === 'link'" class="textContent">
						<li>
							<p>
								<span v-if="block.introKey">{{ $t(block.introKey) }} </span>
								<a :href="block.href" target="_blank" rel="noopener noreferrer">
									{{ $t(block.labelKey) }}
								</a>
							</p>
						</li>
					</ul>
				</template>
			</section>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { getImgURL } from '../utils/getImgURL';

const LEGAL_NOTICES_UPDATED_AT = '2026-07-05';

type LegalNoticesBlock =
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
	  }
	| {
			type: 'link';
			introKey?: string;
			labelKey: string;
			href: string;
	  };

type LegalNoticesItem = {
	id: string;
	name: string;
	blocks: LegalNoticesBlock[];
};

export default defineComponent({
	name: 'LegalNoticesPage',
	components: {
		TitleHeader
	},
	data() {
		return {
			selectedItemIndex: 0
		};
	},
	computed: {
		items(): LegalNoticesItem[] {
			return [
				{
					id: 'publisher',
					name: this.$t('legalNotices.sections.publisher.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'legalNotices.sections.publisher.description'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.publisher.anonymity'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.publisher.director'
						},
						{
							type: 'email',
							introKey: 'legalNotices.sections.publisher.contactIntro',
							emailKey: 'legalNotices.contactEmail'
						}
					]
				},
				{
					id: 'hosting',
					name: this.$t('legalNotices.sections.hosting.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'legalNotices.sections.hosting.intro'
						},
						{
							type: 'list',
							keys: [
								'legalNotices.sections.hosting.provider',
								'legalNotices.sections.hosting.addressLine1',
								'legalNotices.sections.hosting.addressLine2',
								'legalNotices.sections.hosting.addressLine3',
								'legalNotices.sections.hosting.country',
								'legalNotices.sections.hosting.phone'
							]
						},
						{
							type: 'link',
							introKey: 'legalNotices.sections.hosting.websiteIntro',
							labelKey: 'legalNotices.sections.hosting.websiteLabel',
							href: 'https://www.ionos.fr'
						}
					]
				},
				{
					id: 'project',
					name: this.$t('legalNotices.sections.project.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'legalNotices.sections.project.independent'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.project.nonCommercial'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.project.attribution'
						}
					]
				},
				{
					id: 'intellectual-property',
					name: this.$t('legalNotices.sections.intellectualProperty.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'legalNotices.sections.intellectualProperty.rights'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.intellectualProperty.code'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.intellectualProperty.assets'
						},
						{
							type: 'link',
							introKey: 'legalNotices.sections.intellectualProperty.repositoryIntro',
							labelKey: 'legalNotices.sections.intellectualProperty.repositoryLabel',
							href: 'https://github.com/DinoCore-Labs/DinoRPG-Remastered'
						}
					]
				},
				{
					id: 'personal-data-and-cookies',
					name: this.$t('legalNotices.sections.personalData.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.controller'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.introduction'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.optionalData'
						},
						{
							type: 'list',
							keys: [
								'legalNotices.sections.personalData.data.account',
								'legalNotices.sections.personalData.data.game',
								'legalNotices.sections.personalData.data.messages',
								'legalNotices.sections.personalData.data.technical'
							]
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.purposes'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.legalBases'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.recipients'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.retention'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.cookiesIntroduction'
						},
						{
							type: 'list',
							keys: [
								'legalNotices.sections.personalData.cookies.authentication',
								'legalNotices.sections.personalData.cookies.language',
								'legalNotices.sections.personalData.cookies.preferences'
							]
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.cookiesConsent'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.cookiesRemoval'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.personalData.rights'
						},
						{
							type: 'email',
							introKey: 'legalNotices.sections.personalData.rightsContact',
							emailKey: 'legalNotices.contactEmail'
						},
						{
							type: 'link',
							introKey: 'legalNotices.sections.personalData.cnilIntro',
							labelKey: 'legalNotices.sections.personalData.cnilLabel',
							href: 'https://www.cnil.fr'
						}
					]
				},
				{
					id: 'liability',
					name: this.$t('legalNotices.sections.liability.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'legalNotices.sections.liability.availability'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.liability.use'
						},
						{
							type: 'paragraph',
							key: 'legalNotices.sections.liability.externalLinks'
						}
					]
				},
				{
					id: 'contact',
					name: this.$t('legalNotices.sections.contact.title'),
					blocks: [
						{
							type: 'paragraph',
							key: 'legalNotices.sections.contact.description'
						},
						{
							type: 'email',
							introKey: 'legalNotices.sections.contact.emailIntro',
							emailKey: 'legalNotices.contactEmail'
						},
						{
							type: 'list',
							keys: [
								'legalNotices.sections.contact.details.url',
								'legalNotices.sections.contact.details.content',
								'legalNotices.sections.contact.details.reason',
								'legalNotices.sections.contact.details.identity'
							]
						}
					]
				}
			];
		},
		formattedUpdatedAt(): string {
			return new Intl.DateTimeFormat(String(this.$i18n.locale), {
				dateStyle: 'long',
				timeZone: 'UTC'
			}).format(new Date(`${LEGAL_NOTICES_UPDATED_AT}T12:00:00.000Z`));
		}
	},
	methods: {
		getImgURL,
		showContent(item: LegalNoticesItem, index: number) {
			this.selectedItemIndex = index;
			this.$nextTick(() => {
				document.getElementById(`legal-notices-section-${item.id}`)?.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
			});
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
}
</style>

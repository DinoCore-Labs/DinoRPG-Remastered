<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/common/Roadmap.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-03-04 through 2026-07-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="roadmap">
		<h3>{{ $t('newsPage.roadmap.title') }}</h3>
		<ul class="timeline">
			<li v-for="entry in roadmap" :key="entry.position" @click="showTable(entry)">
				<a>
					<small>{{ $t('newsPage.roadmap.small') }}</small>
					<strong>
						<img :src="getImgURL('icons', 'r_world')" alt="world" />
						<span>{{ entry.title }}</span>
					</strong>
				</a>
			</li>
		</ul>
		<DZTable v-show="showFuturTable" class="futur">
			<tr>
				<td class="futurHeader">
					<div class="futurTitle">
						<img :src="getImgURL('icons', 'small_sage')" alt="small_sage" />
						<span>{{ $t('newsPage.roadmap.futurTitle') }}</span>
					</div>
				</td>
			</tr>
			<tr>
				<td class="futurDesc">
					<div class="futurInfo">
						<ul>
							<li v-for="item in selectedItems" :key="item.position">
								<img v-if="item.icon" :src="getImgURL('icons', item.icon)" alt="" />
								<span v-html="formatContent(item.text)" />
							</li>
						</ul>
					</div>
				</td>
			</tr>
			<tr>
				<td class="futurFooter"></td>
			</tr>
		</DZTable>
		<DZDisclaimer help content="newsPage.roadmap.help" />
		<DZDisclaimer content="newsPage.roadmap.disclaimer" />
	</div>
</template>

<script lang="ts">
import { Language } from '@dinorpg/core/models/config/language.js';
import type { RoadmapEntry, RoadmapItem } from '@dinorpg/core/models/roadmap/roadmap.js';
import { defineComponent } from 'vue';

import { errorHandler } from '../../utils/errorHandler';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZTable from '../utils/DZTable.vue';
import { RoadmapService } from '../../services/index.ts';

export default defineComponent({
	name: 'Roadmap',
	components: {
		DZDisclaimer,
		DZTable
	},
	data() {
		return {
			roadmap: [] as RoadmapEntry[],
			selectedRoadmap: null as RoadmapEntry | null
		};
	},
	computed: {
		currentLanguage(): Language {
			return this.$i18n.locale as Language;
		},
		showFuturTable(): boolean {
			return this.selectedRoadmap !== null;
		},
		selectedItems(): RoadmapItem[] {
			return this.selectedRoadmap?.items ?? [];
		}
	},
	methods: {
		async loadRoadmap() {
			try {
				this.roadmap = await RoadmapService.getRoadmap(this.currentLanguage);
				this.selectedRoadmap = null;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		showTable(entry: RoadmapEntry) {
			if (this.selectedRoadmap?.position === entry.position) {
				this.selectedRoadmap = null;
				return;
			}
			this.selectedRoadmap = entry;
		}
	},
	async mounted() {
		await this.loadRoadmap();
	},
	watch: {
		currentLanguage: {
			async handler(newLanguage, oldLanguage) {
				if (newLanguage === oldLanguage) return;

				await this.loadRoadmap();
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.roadmap {
	position: relative;
	bottom: 0px;
	margin-top: 50px;
	max-width: 520px;
	align-self: center;
	& h3 {
		color: #9a4029;
		font-variant: small-caps;
		font-size: 13pt;
		margin-top: 10px;
	}
	.timeline {
		list-style: none;
		margin-bottom: 10px;
		margin-top: 5px;
		height: 74px;
		background-image: url('../../assets/background/underDevTimeline.webp');
		background-repeat: no-repeat;
		padding-left: 2px;
		& li {
			float: left;
			position: relative;
			width: 103px;
			height: 56px;
			padding-right: 3px;
			text-align: center;
			overflow: hidden;
			cursor: pointer;
			padding-top: 18px;
			color: #9a4029;
			& a:hover {
				background-color: transparent;
			}
			& small {
				display: block;
				margin-top: -8px;
				margin-bottom: 4px;
				padding-bottom: 2px;
				padding-left: 1px;
				width: 100px;
				height: 14px;
				color: black;
				font-size: 7.5pt;
				font-weight: bold;
				text-transform: uppercase;
				border-bottom: 1px dashed #9a4029;
			}
			& strong {
				color: #9a4029;
				display: block;
				font-size: 9pt;
				line-height: 11pt;
				font-weight: bold;
				font-variant: small-caps;
				& span {
					margin-left: 5px;
				}
			}
		}
	}
	.futur {
		border-collapse: collapse;
		background-color: transparent;
		width: 520px;
		& tbody {
			& tr {
				.futurHeader {
					background-image: url('../../assets/background/maj_bg_header.webp');
					background-repeat: no-repeat;
					background-position: top center;
					height: 25px;
					.futurTitle {
						text-transform: uppercase;
						font-size: 13px;
						color: #ffee92;
						text-align: center;
						font-weight: bold;
						margin-top: -4px;
						& span {
							margin-left: 5px;
						}
					}
				}
				.futurDesc {
					background-image: url('../../assets/background/maj_bg.webp');
					background-repeat: repeat-y;
					background-position: top center;
					.futurInfo {
						color: #67220d;
						display: block;
						font-size: 14px;
						& ul {
							display: block;
							list-style: none;
							& li {
								margin-top: 4px;
								margin-left: 75px;
								margin-right: 110px;
								& span {
									margin-left: 6px;
								}
							}
						}
					}
				}
				.futurFooter {
					background-image: url('../../assets/background/maj_bg_footer.webp');
					background-repeat: no-repeat;
					height: 17px;
					background-position: top center;
				}
			}
			& td {
				border: none;
				background-color: transparent;
			}
		}
	}
	.disclaimer {
		font-size: 11px;
		font-style: italic;
		padding: 5px;
	}
}
@media screen and (max-width: 560px) {
	.roadmap {
		width: 97%;
		max-width: 97%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		overflow-x: hidden;
		h3 {
			text-align: center;
			padding: 0 10px;
		}
		.timeline {
			width: 100%;
			max-width: 100%;
			box-sizing: border-box;
			background-image: none !important;
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 10px;
			border: 1px solid #67220d;
			padding: 10px;
			height: auto;
			margin-left: 0;
			margin-right: 0;
			li {
				float: none;
				width: auto;
				height: auto;
				padding: 8px 4px;
				box-sizing: border-box;
				small {
					width: auto;
					height: auto;
					margin-top: 0;
				}
				strong {
					display: flex;
					justify-content: center;
					align-items: center;
					gap: 5px;
					span {
						margin-left: 0;
					}
				}
			}
		}
		.futur {
			display: table;
			width: 100% !important;
			max-width: 100% !important;
			min-width: 0;
			box-sizing: border-box;
			border: 1px solid #67220d;
			table-layout: fixed;
			.futurHeader {
				background-image: none !important;
				.futurTitle {
					color: #9a4029 !important;
				}
			}
			.futurDesc {
				background-image: none !important;
				.futurInfo {
					font-size: 14px;
					ul {
						display: flex;
						flex-direction: column;
						gap: 5px;
						margin: 0;
						padding: 10px;
						box-sizing: border-box;
						li {
							margin: 0 !important;
							display: flex;
							align-items: flex-start;
							gap: 6px;
							span {
								margin-left: 0;
								overflow-wrap: anywhere;
							}
						}
					}
				}
			}
			.futurFooter {
				background-image: none !important;
			}
		}
	}
}
</style>

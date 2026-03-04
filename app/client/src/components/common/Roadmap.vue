<template>
	<div class="roadmap">
		<h3>{{ $t('newsPage.roadmap.title') }}</h3>
		<ul class="timeline">
			<li @click="showTable(1)">
				<a>
					<small>{{ $t('newsPage.roadmap.small') }}</small>
					<strong>
						<img :src="getImgURL('icons', 'r_world')" alt="world" />
						<span>{{ $t('newsPage.roadmap.strong.title1') }}</span>
					</strong>
				</a>
			</li>
			<li @click="showTable(2)">
				<a>
					<small>{{ $t('newsPage.roadmap.small') }}</small>
					<strong>
						<img :src="getImgURL('icons', 'r_world')" alt="world" />
						<span>{{ $t('newsPage.roadmap.strong.title2') }}</span>
					</strong>
				</a>
			</li>
			<li @click="showTable(3)">
				<a>
					<small>{{ $t('newsPage.roadmap.small') }}</small>
					<strong>
						<img :src="getImgURL('icons', 'r_world')" alt="world" />
						<span>{{ $t('newsPage.roadmap.strong.title3') }}</span>
					</strong>
				</a>
			</li>
			<li @click="showTable(4)">
				<a>
					<small>{{ $t('newsPage.roadmap.small') }}</small>
					<strong>
						<img :src="getImgURL('icons', 'r_world')" alt="world" />
						<span>{{ $t('newsPage.roadmap.strong.title4') }}</span>
					</strong>
				</a>
			</li>
		</ul>
		<table class="futur" :style="{ display: showFuturTable ? 'table' : 'none' }">
			<tbody>
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
								<li v-for="(item, index) in futurInfoList" :key="index">
									<img v-if="item.imageUrl" :src="getImgURL(item.imageUrl.path, item.imageUrl.name)" alt="Image" />
									<span v-html="formatContent(item.text)" />
								</li>
							</ul>
						</div>
					</td>
				</tr>
				<tr>
					<td class="futurFooter"></td>
				</tr>
			</tbody>
		</table>
		<DZDisclaimer help content="newsPage.roadmap.help" />
		<DZDisclaimer content="newsPage.roadmap.disclaimer" />
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';

export default defineComponent({
	name: 'Roadmap',
	components: { DZDisclaimer },
	data() {
		return {
			showFuturTable: false,
			currentTableIndex: 0,
			futurInfoList: [] as { imageUrl: { path: string; name: string }; text: string }[]
		};
	},
	methods: {
		showTable(tableIndex: number) {
			this.showFuturTable = this.currentTableIndex !== tableIndex;
			if (this.showFuturTable) {
				this.updateFuturInfo(tableIndex);
				this.currentTableIndex = tableIndex;
			} else {
				this.currentTableIndex = 0;
			}
		},
		updateFuturInfo(tableIndex: number) {
			// You can add logic here to update the futurInfoList based on the clicked link
			switch (tableIndex) {
				case 1:
					this.futurInfoList = [
						{ imageUrl: { path: 'achievements', name: 'moves' }, text: this.$t('newsPage.roadmap.futureInfo1.text1') },
						{ imageUrl: { path: 'icons', name: 'small_mode' }, text: this.$t('newsPage.roadmap.futureInfo1.text2') },
						{ imageUrl: { path: 'icons', name: 'small_reput' }, text: this.$t('newsPage.roadmap.futureInfo1.text3') },
						{ imageUrl: { path: 'icons', name: 'small_reput' }, text: this.$t('newsPage.roadmap.futureInfo1.text4') },
						{ imageUrl: { path: 'icons', name: 'small_reput' }, text: this.$t('newsPage.roadmap.futureInfo1.text5') },
						{ imageUrl: { path: 'icons', name: 'small_missAct' }, text: this.$t('newsPage.roadmap.futureInfo1.text6') }
					];
					break;
				case 2:
					this.futurInfoList = [
						{ imageUrl: { path: 'icons', name: 'small_reput' }, text: this.$t('newsPage.roadmap.futureInfo2.text1') },
						{ imageUrl: { path: 'icons', name: 'small_reput' }, text: this.$t('newsPage.roadmap.futureInfo2.text2') },
						{ imageUrl: { path: 'icons', name: 'small_missAct' }, text: this.$t('newsPage.roadmap.futureInfo2.text3') }
					];
					break;
				case 3:
					this.futurInfoList = [
						{ imageUrl: { path: 'icons', name: 'small_mode' }, text: this.$t('newsPage.roadmap.futureInfo3.text1') },
						{ imageUrl: { path: 'icons', name: 'small_mode' }, text: this.$t('newsPage.roadmap.futureInfo3.text2') },
						{ imageUrl: { path: 'icons', name: 'small_missAct' }, text: this.$t('newsPage.roadmap.futureInfo3.text3') }
					];
					break;
				case 4:
					this.futurInfoList = [
						{ imageUrl: { path: 'icons', name: 'small_mode' }, text: this.$t('newsPage.roadmap.futureInfo4.text1') },
						{ imageUrl: { path: 'icons', name: 'small_mode' }, text: this.$t('newsPage.roadmap.futureInfo4.text2') },
						{ imageUrl: { path: 'icons', name: 'small_mode' }, text: this.$t('newsPage.roadmap.futureInfo4.text3') },
						{ imageUrl: { path: 'icons', name: 'small_missAct' }, text: this.$t('newsPage.roadmap.futureInfo4.text4') }
					];
					break;
				default:
					this.futurInfoList = [];
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
		width: 520px;
		& tbody {
			& tr {
				.futurHeader {
					background-image: url('../../assets/background/maj_bg_header.webp');
					background-repeat: no-repeat;
					background-position: top center;
					height: 27px;
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
							margin-top: 4px;
							& li {
								margin-top: 4px;
								margin-left: 75px;
								margin-right: 110px;
								& span {
									margin-left: 5px;
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
		max-width: 90%;
		display: flex;
		flex-direction: column;
		align-items: center;
		.timeline {
			background-image: none !important;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;
			border: 1px solid #67220d;
			padding: 0;
			height: auto;
		}
		.futur {
			max-width: 85%;
			border: 1px solid #67220d;
			.futurHeader {
				background-image: none !important;
				.futurTitle {
					color: #9a4029 !important;
				}
			}
			.futurDesc {
				background-image: none !important;
				.futurInfo {
					& ul {
						display: flex;
						flex-direction: column;
						gap: 5px;
						margin-left: -35px;
						& li {
							margin-left: 0 !important;
							margin-right: 0 !important;
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

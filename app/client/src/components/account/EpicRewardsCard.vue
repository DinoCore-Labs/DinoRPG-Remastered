<template>
	<div class="profil">
		<h3>
			<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			{{ $t(`accountPage.rewards`) }}
			<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
		</h3>
		<div class="rewards">
			<template v-for="reward in sortedEpicRewards" :key="rewardList[reward].id">
				<Tippy theme="normal" v-if="rewardList[reward].displayed">
					<img
						class="epicRewards"
						:src="getImgURL('epicRewards', `collec_${rewardList[reward].name}`)"
						:alt="rewardList[reward].name"
					/>
					<template #content>
						<h1 v-html="formatContent($t(`rewards.name.${rewardList[reward].name}`))" />
						<p v-html="formatContent($t(`rewards.description.${rewardList[reward].name}`))" />
					</template>
				</Tippy>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { rewardList, Reward } from '@dinorpg/core/models/rewards/rewardList.js';

export default defineComponent({
	name: 'EpicRewardsCard',
	data() {
		return {
			rewardList: rewardList
		};
	},
	props: {
		epicRewards: {
			type: Array as PropType<Reward[]>,
			default: () => []
		},
		isOwner: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		sortedEpicRewards(): Reward[] {
			return [...(this.epicRewards ?? [])].sort((a: Reward, b: Reward) => rewardList[a].id - rewardList[b].id);
		}
	}
});
</script>

<style lang="scss" scoped>
.profil {
	background:
		url('../../assets/background/info_header.webp') no-repeat,
		url('../../assets/background/info_footer.webp') no-repeat,
		url('../../assets/background/info_center.webp') repeat-y;
	background-position-y: top, bottom;
	min-height: auto;
	width: 305px;
	margin-bottom: 10px;
	min-height: 46px;
	h3 {
		display: flex;
		justify-content: space-evenly;
		font-family: Arial, sans-serif;
		font-size: 10pt;
		font-style: normal;
		font-variant-caps: small-caps;
		font-weight: 400;
		color: #ffee92;
		text-shadow: 1px 1px 1px #383522;
		margin-top: 3.5px;
		img {
			height: 7px;
			width: 7px;
			padding-top: 5px;
		}
	}
	.rewards {
		padding-left: 5px;
		padding-bottom: 7px;
		.epicRewards {
			width: 32px;
			height: 32px;
			object-fit: cover;
		}
	}
}
</style>

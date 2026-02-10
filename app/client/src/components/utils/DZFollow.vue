<template>
	<Tippy v-if="!display" class="action" tag="div" id="act_follow" theme="normal" @click="displayFollow()">
		<img class="arrow" :src="getImgURL('act', 'act_follow')" alt="act_follow" />
		<p>
			{{ $t(`action.name.follow`) }}
		</p>
		<template #content>
			<h1 v-html="formatContent($t(`action.name.follow`))" />
			<p v-html="formatContent($t(`action.description.follow`))" />
		</template>
	</Tippy>
	<div v-if="display" class="followList">
		<template v-for="dinozToFollow in dinozAvailableToFollow" :key="dinozToFollow.id">
			<DinozMini
				v-tippy="{
					content: dinozToFollow.name,
					theme: 'small'
				}"
				class="follower"
				:display="dinozToFollow.display"
				@click="followDinoz(dinozToFollow.id)"
			/>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//import { DinozService } from '../../services/index.js';
import eventBus from '../../events/index.js';
import { getFollowableDinoz, orderDinozList } from '@dinorpg/core/utils/dinozUtils.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { dinozStore } from '../../store/dinozStore.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { formatText } from '../../utils/formatText.js';
import DinozMini from '../dinoz/DinozMini.vue';

export default defineComponent({
	name: 'DZFollow',
	components: { DinozMini },
	data() {
		return {
			dinozStore: dinozStore(),
			dinozAvailableToFollow: [] as DinozFiche[],
			display: false as boolean
		};
	},
	props: {
		dinoz: {
			type: Number,
			required: true
		}
	},
	methods: {
		displayFollow(): void {
			if (!this.dinozStore.getDinozList) {
				this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
				return;
			}
			if (this.dinozAvailableToFollow.length > 0) {
				this.dinozAvailableToFollow = [];
				return;
			}
			const currentDinoz = this.dinozStore.getDinoz(this.dinoz);
			if (!currentDinoz) {
				this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
				return;
			}

			// Display the list of dinoz available to follow
			this.dinozAvailableToFollow = getFollowableDinoz(this.dinozStore.getDinozList, currentDinoz);
			this.display = true;
		},
		async followDinoz(targetId: number) {
			try {
				//await DinozService.follow(this.dinozId, targetId);

				// Reset the list of dinoz available to follow
				this.dinozAvailableToFollow = [];

				// Refresh followed and following status
				const currentDinozList = this.dinozStore.getDinozList;
				if (!currentDinozList) {
					this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
					return;
				}

				const targetDinoz = currentDinozList.find(dinoz => dinoz.id === targetId);
				if (!targetDinoz) {
					this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
					return;
				}

				this.dinozStore.setDinozList(
					orderDinozList(
						currentDinozList.map(dinoz => {
							if (dinoz.id === this.dinoz) {
								dinoz.leaderId = targetId;
							} else if (dinoz.id === targetId) {
								dinoz.followers.push({
									name: targetDinoz.name,
									id: this.dinoz,
									fight: targetDinoz.fight,
									remaining: targetDinoz.remaining
								});
							}
							return dinoz;
						})
					)
				);
				eventBus.emit('refreshDinoz', true);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.action {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 0.5rem;
	margin-right: 5px;
	border-radius: 7px;
	font-size: 11pt;
	font-variant: small-caps;
	line-height: 10.5pt;
	font-weight: 700;
	width: 100%;
	& img {
		margin-left: 5px;
	}
	&:hover {
		background-color: #9a4029;
		cursor: pointer;
		img {
			outline: 1px solid white;
		}
	}
}
.followList {
	display: flex;
	gap: 2px;
	flex-wrap: wrap;
	justify-content: space-around;
	.follower {
		background-color: #cd8956;
		border-radius: 5px;
		&:hover {
			outline: none;
			background-color: #9a4029;
			cursor: pointer;
		}
	}
}
.dinoz-to-follow {
	padding-left: 7px;
	padding-top: 2px;
	padding-bottom: 2px;
	&:hover {
		outline: none;
		background-color: #9a4029;
		cursor: pointer;
	}
}
@media (max-width: 539px) {
	.action {
		width: 46%;
	}
}
</style>

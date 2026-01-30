<template>
	<TitleHeader :title="$t('pageTitle.dinozShop')" :header="$t(`shop.dinoz.header`)" />
	<DZDisclaimer help round :content="$t('shop.dinoz.help')" />
	<div class="sheets">
		<div class="sheet" :id="'detail_' + index" v-for="(dinoz, index) in dinozList" :key="dinoz.id">
			<Suspense>
				<DinozAnimation class="dinoImg" :display="dinoz.display" flip :life="1"></DinozAnimation>
				<template #fallback
					><div class="loading-wrapper"><Loading /></div
				></template>
			</Suspense>
			<div class="infos">
				<div class="row1">
					<div class="race">
						<Tippy theme="normal">
							<strong>{{ $t(`race.race`) }}</strong>
							{{ $t(`race.name.${raceList[dinoz.race].name}`) }}
							<template #content>
								<h1>{{ $t(`race.name.${raceList[dinoz.race].name}`) }}</h1>
								<p>
									{{ $t(`race.description.${raceList[dinoz.race].name}`) }}
								</p>
							</template>
						</Tippy>
					</div>
					<div class="price1">
						<span class="money1"
							>{{ beautifulNumber(raceList[dinoz.race].price) }}
							<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
						</span>
					</div>
				</div>
				<div class="row2">
					<Elements
						:fire="raceList[dinoz.race].nbrFire"
						:wood="raceList[dinoz.race].nbrWood"
						:water="raceList[dinoz.race].nbrWater"
						:lightning="raceList[dinoz.race].nbrLightning"
						:air="raceList[dinoz.race].nbrAir"
						style="margin-top: -5px"
					></Elements>
				</div>
				<div class="row3">
					<template v-if="raceList[dinoz.race].skillId">
						<Tippy
							theme="normal"
							tag="div"
							class="skill"
							v-for="skillId in raceList[dinoz.race].skillId"
							:key="skillId"
						>
							<img :src="getImgURL('icons', 'small_follow')" alt="follow" />
							{{ $t(`skill.name.${getSkill(skillId)?.name}`) }}
							<template #content>
								<h1>
									{{ $t(`skill.name.${getSkill(skillId)?.name}`) }}
								</h1>
								<p v-html="formatContent($t(`skill.description.${getSkill(skillId)?.name}`))" />
							</template>
						</Tippy>
					</template>
					<DZButton class="bSmall" @click="openPopinConfirmChoice(dinoz)">{{ $t('button.chose') }}</DZButton>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { dinozStore } from '../store/dinozStore';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { DinozShopFicheLite } from '@dinorpg/core/models/shop/dinozShopFiche.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import type { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import DZButton from '../components/utils/DZButton.vue';
import Elements from '../components/dinoz/Elements.vue';
import { beautifulNumber } from '../utils/beautifulNumber';
import { ShopService } from '../services';
import { errorHandler } from '../utils/errorHandler';

export default defineComponent({
	name: 'ShopDinoz',
	data() {
		return {
			dinozStore: dinozStore(),
			dinozList: [] as Array<DinozShopFicheLite>,
			raceList,
			skillList
		};
	},
	components: {
		DZButton,
		DZDisclaimer,
		TitleHeader,
		Elements,
		DinozAnimation: defineAsyncComponent(() => import('../components/dinoz/DinozAnimation.vue'))
	},
	methods: {
		beautifulNumber,
		getSkill(id: number): SkillDetails | undefined {
			return (skillList as unknown as Readonly<Record<number, SkillDetails>>)[id];
		},
		async openPopinConfirmChoice(dinoz: DinozShopFicheLite): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				let dinozCreated: DinozFiche;
				try {
					dinozCreated = await ShopService.buyDinoz(parseInt(dinoz.id));
					await this.$refreshGold();
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}

				const dinozStore = this.dinozStore.getDinozList;

				dinozStore.push(dinozCreated);

				// Update dinoz list
				this.dinozStore.setDinozList(dinozStore);
				//console.log(this.dinozStore);

				// Go to dinoz page
				await this.$router.push({
					name: 'DinozPage',
					params: {
						id: dinozCreated.id
					}
				});
			}
		}
	},
	async mounted(): Promise<void> {
		// Get dinoz to display
		try {
			this.dinozList = await ShopService.getDinozFromDinozShop();
			//console.log(this.dinozList);
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
@media (max-width: 510px) {
	.sheets {
		max-width: 95%;
		align-items: center;
		.sheet {
			background-image: none;
			background-color: #bc683c;
			background-position: 5px 8px;
			background-repeat: no-repeat;
			border-radius: 8px;
			flex-direction: column;
			align-items: center;
			height: fit-content;
			.dinoImg {
				bottom: 0;
				left: 0;
			}
			.infos {
				display: flex;
				flex-direction: column;
				gap: 5px;
				padding: 5px;
				left: 0;
			}
		}
	}
}
.sheet {
	display: flex;
	align-items: flex-start;
	height: 76px;
	padding: 1px;
	clear: both;
	background-image: url('../assets/background/shop_dinoz_bg.webp');
	background-position: 2px 0px;
	background-repeat: no-repeat;
	.infos {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: 5px;
		left: -35px;
		position: relative;
		.race {
			margin-bottom: 1px;
			strong {
				color: white;
			}
		}
		.race,
		.skill {
			width: 210px;
			height: 18px;
			padding-left: 10px;
			font-size: 10pt;
			color: #ffee92;
			background-color: #9a4029;
			border-radius: 10px;
			cursor: help;
		}
	}
}
.loading-wrapper {
	width: 190px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.sheets {
	display: flex;
	gap: 30px;
	flex-direction: column;
	align-self: center;
	margin-top: 30px;
}
.row1 {
	display: flex;
	gap: 10px;
}
.row2 {
	display: flex;
	align-items: center;
}
.row3 {
	display: flex;
	gap: 6px;
	align-items: center;
	justify-content: end;
}
.bSmall {
	margin-top: -3px;
}
.price1 {
	width: 90px;
	height: 18px;
	font-size: 10pt;
	background-color: #9a4029;
	border-radius: 10px;
	text-align: center;
	.money1 {
		color: #ffee92;
		font-weight: bold;
		font-size: 9pt;
	}
}
.dinoImg {
	bottom: 70px;
	position: relative;
	left: -25px;
}
</style>

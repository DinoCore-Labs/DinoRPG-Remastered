<template>
	<TitleHeader :title="$t('pageTitle.manageDinoz')" :header="$t('manageDinoz.title')" />
	<DZDisclaimer :content="$t('manageDinoz.disclaimer')" />
	<table>
		<tbody>
			<tr>
				<th class="dinoz" colspan="3">{{ $t('manageDinoz.dinoz') }}</th>
				<th class="elements">{{ $t('manageDinoz.elements') }}</th>
				<th class="order"></th>
			</tr>
			<tr v-for="(dinoz, index) in dinozList" :key="dinoz.id">
				<td class="dinoz">
					<DinozMini :display="dinoz.display" />
				</td>
				<td class="level">{{ dinoz.level }}</td>
				<Tippy tag="td" theme="small">
					<span>{{ dinoz.name }}</span>
					<div class="life-full">
						<div class="life" :style="{ width: `${(dinoz.life / dinoz.maxLife) * 100}%` }" />
					</div>
					<div class="experience-full">
						<div
							class="experience"
							:style="{ width: `${dinoz.maxExperience > 0 ? (dinoz.experience / dinoz.maxExperience) * 100 : 0}%` }"
						/>
					</div>
					<template #content>
						<template v-for="status in dinoz.status" :key="status.statusId">
							<img
								v-if="isDisplayedStatus(status.statusId)"
								:src="getStatusImgURL(status.statusId)"
								:alt="getStatusImgName(status.statusId)"
							/>
						</template>
					</template>
				</Tippy>
				<td class="elements">
					<Elements
						:fire="dinoz.nbrUpFire"
						:wood="dinoz.nbrUpWood"
						:water="dinoz.nbrUpWater"
						:lightning="dinoz.nbrUpLightning"
						:air="dinoz.nbrUpAir"
					/>
				</td>
				<td class="order">
					<button type="button" class="up" :disabled="index === 0" @click="changeOrder(index, -1)">
						<img :src="getImgURL('icons', 'small_page_up')" alt="arrow_up" />
					</button>
					<button type="button" class="down" :disabled="index === dinozList.length - 1" @click="changeOrder(index, 1)">
						<img :src="getImgURL('icons', 'small_page_down')" alt="arrow_down" />
					</button>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts">
import type { ManageDinozPageData } from '@dinorpg/core/models/dinoz/manageDinoz.js';
import { orderDinozList } from '@dinorpg/core/utils/dinozUtils.js';
import { defineComponent } from 'vue';

import DinozMini from '../components/dinoz/DinozMini.vue';
import Elements from '../components/dinoz/Elements.vue';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { statusList } from '../constants/status.js';
import { DinozService } from '../services';
import { dinozStore } from '../store/dinozStore';
import { userStore } from '../store/userStore';
import { errorHandler } from '../utils/errorHandler.js';
import { getImgURL } from '../utils/getImgURL';

export default defineComponent({
	name: 'ManageDinoz',
	components: {
		DinozMini,
		DZDisclaimer,
		Elements,
		TitleHeader
	},
	data() {
		return {
			uStore: userStore(),
			dStore: dinozStore(),
			dinozList: [] as ManageDinozPageData,
			statusList
		};
	},
	methods: {
		getImgURL,
		isDisplayedStatus(statusId: number): boolean {
			const key = statusId as keyof typeof statusList.displayed;
			return Boolean(statusList.displayed[key] && statusList.imgName[key]);
		},
		getStatusImgName(statusId: number): string {
			const key = statusId as keyof typeof statusList.imgName;
			return statusList.imgName[key] ?? '';
		},
		getStatusImgURL(statusId: number): string {
			return getImgURL('status', `fx_${this.getStatusImgName(statusId)}`);
		},
		async changeOrder(index: number, direction: number) {
			const targetIndex = index + direction;
			if (targetIndex < 0 || targetIndex >= this.dinozList.length) {
				return;
			}
			const newList = [...this.dinozList];
			[newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
			try {
				const updatedList = await DinozService.updateOrders(newList.map(dinoz => dinoz.id));
				this.dinozList = updatedList;
				const updatedStoreDinoz = this.dStore.getDinozList.map(dinoz => {
					const updated = updatedList.find(current => current.id === dinoz.id);
					if (!updated) {
						return dinoz;
					}
					return {
						...dinoz,
						order: updated.order
					};
				});

				this.dStore.setDinozList(orderDinozList(updatedStoreDinoz));
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		}
	},
	async mounted() {
		if (!this.uStore.canManageDinozOrder) {
			this.$toast.open({
				message: this.$t('toast.noPDA').toString(),
				type: 'error'
			});

			this.$router.back();
			return;
		}
		try {
			this.dinozList = await DinozService.getDinozToManage();
		} catch (error) {
			errorHandler.handle(error, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 8px;
			&.order {
				width: 18px;
			}
		}
		td {
			font-size: 9pt;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
			padding: 2px 4px;
			&.dinoz {
				width: 50px;
				text-align: center;
			}
			&.level {
				text-align: center;
			}
			.life-full {
				width: 70px;
				height: 4px;
				background-color: #8c492f;
				border: 1px solid #8c492f;
				overflow: hidden;
				margin: 2px;
				.life {
					height: 4px;
					background-color: #f9e94c;
					border-right: 1px solid white;
					box-sizing: border-box;
				}
			}
			.experience-full {
				width: 70px;
				height: 4px;
				background-color: #8c492f;
				border: 1px solid #8c492f;
				overflow: hidden;
				margin: 2px;
				.experience {
					height: 4px;
					background-color: #c487ea;
					border-right: 1px solid white;
					box-sizing: border-box;
				}
			}
			&.order {
				& > div {
					display: flex;
					align-items: center;
					justify-content: center;
					border: 1px solid #f9e5b7;
					background-color: #bb5e46;
					margin: 1px;
					text-align: center;
					cursor: pointer;
					width: 16px;
					height: 16px;
					&:hover {
						border: 1px solid yellow;
						background-color: #f9e5b7;
					}
					img {
						width: 10px;
					}
					&.down img {
						transform: rotate(180deg);
					}
				}
			}
		}
	}
}
</style>

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
						<img :src="getImgURL('icons', 'small_equip')" alt="arrow_up" />
					</button>
					<button type="button" class="down" :disabled="index === dinozList.length - 1" @click="changeOrder(index, 1)">
						<img :src="getImgURL('icons', 'small_equip')" alt="arrow_down" />
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

<template>
	<TitleHeader :title="`${$t('pageTitle.dinozNaming')}`" :header="$t(`chooseDinoz.pageName`)"></TitleHeader>
	<DZDisclaimer help round content="chooseDinoz.information" />
	<div id="chooseDinozName">
		<div class="dinoz_display">
			<Suspense>
				<DinozAnimation
					:key="dinozData.display"
					:display="dinozData.display"
					:life="1"
					flip
					:race="dinozData.race.raceId"
				></DinozAnimation>
				<template #fallback> <Loading /> </template>
			</Suspense>
		</div>
		<div class="naming">
			<p class="name">{{ $t('chooseDinoz.nomDuDinoz') }}</p>
			<DZInput type="text" v-model="dinozName" />
			<DZButton @click="nameDinoz()">{{ $t('button.name') }}</DZButton>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, type PropType } from 'vue';
import { errorHandler } from '../../utils/errorHandler';
import { DinozService } from '../../services/dinoz.service';
import { dinozStore } from '../../store/dinozStore';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZButton from '../utils/DZButton.vue';
import DZInput from '../utils/DZInput.vue';

export default defineComponent({
	name: 'ChooseDinozName',
	components: {
		DZButton,
		DZDisclaimer,
		DZInput,
		TitleHeader,
		DinozAnimation: defineAsyncComponent(() => import('./DinozAnimation.vue'))
	},
	data() {
		return {
			dinozStore: dinozStore(),
			dinozName: undefined as string | undefined,
			regexName: /^(?=.{1,32}$)[A-Za-zÀ-ÿ0-9]+( [A-Za-zÀ-ÿ0-9]+)*$/
		};
	},
	props: {
		dinozData: { type: Object as PropType<DinozFiche>, required: true }
	},
	emits: ['setNameChoosen'],
	methods: {
		async nameDinoz(): Promise<void> {
			// Check if dinoz name matches regex
			if (this.dinozName) {
				try {
					await DinozService.setDinozName(this.dinozData.id, this.dinozName);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}

				// Update dinozList in store
				const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id == this.dinozData.id);

				if (!dinozToUpdate) {
					this.$toast.open({
						message: this.$t('toast.dinozNotFound'),
						type: 'error'
					});
					return;
				}

				dinozToUpdate.name = this.dinozName;

				this.dinozStore.setDinozList(dinozList);

				// Set parent's data to display dinoz page
				this.$emit('setNameChoosen', this.dinozName);
			}
		}
	},
	mounted() {}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	margin: 10px auto;
	justify-content: center;
}
#chooseDinozName {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
}
.naming {
	display: flex;
	align-items: center;
	max-width: 310px;
	flex-wrap: wrap;
	justify-content: center;
	gap: 10px;
}
.name {
	width: 95px;
	text-align: center;
	font-variant: normal;
	font-weight: bold;
	font-size: 8pt;
	color: #ffee92;
	background-color: #e4aa69;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	grid-column: 1;
	grid-row: 1;
}
input {
	width: 200px;
}
.button {
	grid-row: 2;
	grid-column: 1 / 2;
}
</style>

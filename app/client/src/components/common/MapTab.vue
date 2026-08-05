<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/common/MapTab.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-08-04.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div id="boxMap">
		<WorldMap :dinozData="dinozData" :key="dinozData.borderPlace[0]" />
		<p class="placeName" v-if="dinozData">
			{{ $t(`place.name.${getPlaceName(dinozData.placeId)}`) }}
		</p>
	</div>
	<div class="defenders-box" v-if="isDevourer && defendersData">
		<div class="defenders-title">
			Contrôlée par :
			<DZUser
				class="inline-user"
				:user="{ id: defendersData.userId, name: defendersData.username }"
				:me="userStore().id === defendersData.userId"
				:friend="false"
			/>
		</div>
		<div class="defenders-list">
			<div v-for="dinoz in defendersData.dinozs" :key="dinoz.id" class="defender-dinoz">
				<DinozAnimation :display="dinoz.apparence" :life="100" />
				<div class="defender-tooltip">Niveau {{ dinoz.level }}</div>
			</div>
		</div>
		<div class="defenders-attacks">Tentatives restantes : {{ attacksLeft }}</div>
	</div>
	<p class="placeDesc" v-if="dinozData">
		{{ $t(`place.description.${getPlaceName(dinozData.placeId)}`) }}
	</p>
</template>

<script lang="ts">
import { defineComponent, type PropType, defineAsyncComponent } from 'vue';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { placeList } from '../../constants/place';
import DevourerService, { type DevourerDefendersResponse } from '../../services/devourer.service';
import WorldMap from './WorldMap.vue';
import DinozAnimation from '../dinoz/DinozAnimation.vue';
import { userStore } from '../../store/userStore';
import eventBus from '../../events';

const DZUser = defineAsyncComponent(() => import('../utils/DZUser.vue'));

export default defineComponent({
	name: 'MapTab',
	props: { dinozData: { type: Object as PropType<DinozFiche>, required: true } },
	components: {
		WorldMap,
		DinozAnimation,
		DZUser
	},
	setup() {
		return { userStore };
	},
	data() {
		return {
			defendersData: null as DevourerDefendersResponse['defenders'] | null,
			attacksLeft: 0
		};
	},
	computed: {
		isDevourer(): boolean {
			const pId = this.dinozData?.placeId;
			return (
				pId === PlaceEnum.DEVOREUSE_DE_L_EST ||
				pId === PlaceEnum.DEVOREUSE_DE_L_OUEST ||
				pId === PlaceEnum.DEVOREUSE_DU_NORD
			);
		}
	},
	watch: {
		'dinozData.placeId': {
			immediate: true,
			async handler() {
				await this.fetchDefenders();
			}
		}
	},
	mounted() {
		eventBus.on('refreshDevourerDefenders', this.fetchDefenders);
	},
	beforeUnmount() {
		eventBus.off('refreshDevourerDefenders', this.fetchDefenders);
	},
	methods: {
		async fetchDefenders() {
			if (this.isDevourer) {
				try {
					const res = await DevourerService.getDefenders(this.dinozData.placeId);
					this.defendersData = res.defenders;
					this.attacksLeft = res.attacksLeft;
				} catch (e) {
					console.error('Failed to load devourer defenders', e);
				}
			} else {
				this.defendersData = null;
			}
		},
		changeTimezone(date: Date, ianatz: string) {
			const invdate = new Date(
				date.toLocaleString('en-US', {
					timeZone: ianatz
				})
			);
			const diff = date.getTime() - invdate.getTime();
			return new Date(date.getTime() - diff); // needs to substract
		},
		getPlaceName(placeId: number): string {
			const place = placeList.find(place => place.placeId === placeId);
			if (!place) return '';
			const today = this.changeTimezone(new Date(), 'GMT');
			if (place.placeId === 29) {
				const day = today.getDay();
				switch (day) {
					case 1:
					case 2:
					case 5:
						return 'marais';
					case 4:
					case 6:
						return 'marais_flood';
					case 0:
					case 3:
						return 'marais_fog';
					default:
						return 'marais';
				}
			}
			return place.name;
		}
	}
});
</script>

<style lang="scss" scoped>
.placeDesc {
	padding: 5px;
	font-size: 9pt;
	line-height: 10.5pt;
	font-style: italic;
	color: #fdf1c4;
	text-align: justify;
	cursor: help;
	background-color: #cd8956;
	border-radius: 10px;
	max-width: 95%;
}
#boxMap {
	display: block;
	width: 95%;
	height: 275px;
	border: 1px solid #874b2e;
	outline: 2px solid #cc8557;
	padding: 1px;
}
.placeName {
	margin-top: 1px;
	display: block;
	height: 20px;
	padding-left: 8px;
	padding-top: 4px;
	color: #ffee92;
	font-size: 12pt;
	font-variant: small-caps;
	font-weight: bold;
	background-color: #bc683c;
	border-radius: 0px;
	text-align: justify;
}

.defenders-box {
	margin-top: 10px;
	padding: 5px;
	border: 1px solid #874b2e;
	background-color: #cd8956;
	border-radius: 5px;
	color: #fdf1c4;
	width: 95%;
}

.defenders-title {
	font-weight: bold;
	text-align: center;
	margin-bottom: 5px;
	font-size: 10pt;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 5px;
}

.inline-user {
	display: inline-flex;
	align-items: center;
}

.defenders-list {
	display: flex;
	justify-content: center;
	gap: 5px;
	flex-wrap: wrap;
	flex-direction: row;
	margin-bottom: 5px;
}

.defenders-attacks {
	font-size: 0.8em;
	color: #666;
	text-align: center;
	font-style: italic;
}

.defender-dinoz {
	position: relative;
	cursor: help;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 50px;
	height: 50px;
}

.defender-dinoz :deep(img) {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.defender-tooltip {
	visibility: hidden;
	background-color: rgba(0, 0, 0, 0.8);
	color: #fff;
	text-align: center;
	padding: 5px;
	border-radius: 6px;
	position: absolute;
	z-index: 1;
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%);
	white-space: nowrap;
	font-size: 12px;
	opacity: 0;
	transition: opacity 0.3s;
	pointer-events: none;
}

.defender-dinoz:hover .defender-tooltip {
	visibility: visible;
	opacity: 1;
}
</style>

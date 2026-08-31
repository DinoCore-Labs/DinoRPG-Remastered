<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/components/dojo/SelectDinoz.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-08-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="wrapper">
		<div
			v-for="dinoz in dinozList"
			:key="dinoz.id"
			:class="['dinoz-button', { 'not-selected': !selectedDinoz.includes(dinoz.id) }]"
			@click="toggleDinoz(dinoz.id)"
		>
			<div class="background">
				<DinozMini :display="dinoz.display" />
			</div>

			<div class="textbox">
				<p class="name">{{ dinoz.name }}</p>
				<p class="level">{{ $t('accountPage.level') }} {{ dinoz.level }}</p>
			</div>
		</div>
	</div>
	<div class="df jcc mt-1" v-if="selectedDinoz.length && selectedDinoz.length >= minLimit">
		<DZButton @click="validate">{{
			selectionOver ? $t('dojo.challenge.edit') : $t('dojo.challenge.validate')
		}}</DZButton>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { userStore } from '../../store/userStore.js';
import { dinozStore } from '../../store/dinozStore.js';
import DZButton from '../utils/DZButton.vue';
import DinozMini from '../dinoz/DinozMini.vue';
import type { DinozDojoFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';

export default defineComponent({
	name: 'SelectDinoz',
	components: {
		DinozMini,
		DZButton
	},
	data() {
		return {
			playerStore: userStore(),
			selectionOver: false,
			selectedDinoz: [] as number[]
		};
	},
	props: {
		dinozList: {
			type: Object as PropType<DinozDojoFiche[]>,
			required: true
		},
		selectLimit: {
			type: Number,
			default: 10
		},
		minLimit: {
			type: Number,
			default: 0
		}
	},
	emits: ['validate'],
	methods: {
		toggleDinoz(dinozId: number) {
			if (this.selectionOver) return;
			if (this.selectedDinoz.includes(dinozId)) {
				this.selectedDinoz = this.selectedDinoz.filter(id => id !== dinozId);
			} else {
				// Max selectLimit
				if (this.selectedDinoz.length >= this.selectLimit) {
					this.$toast.open({ message: this.$t(`toast.maxDinozSelected`), type: 'error' });
					return;
				}

				this.selectedDinoz.push(dinozId);
			}
		},
		async validate() {
			if (!this.selectionOver) {
				if (this.selectedDinoz.length === 0) {
					this.$toast.open({ message: this.$t(`toast.noDinozSelected`), type: 'error' });
					return;
				}
				if (this.selectedDinoz.length < this.minLimit) {
					this.$toast.open({ message: this.$t(`toast.notEnoughDinozSelected`), type: 'error' });
					return;
				}
				this.$emit('validate', this.selectedDinoz);
			}

			this.selectionOver = !this.selectionOver;
		}
	},
	async mounted() {
		if (!dinozStore().dinozList) {
			this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}

.wrapper {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	.dinoz-button {
		width: 96px;
		margin: 4px;
		border-radius: 5px;
		text-align: center;
		border: 1px solid #874b2e;
		cursor: pointer;
		user-select: none;
		display: flex;
		flex-direction: column;

		.background {
			background-image: url('../../assets/place/forcebrut.webp');
			background-repeat: no-repeat;
			background-size: cover;
			width: 100%;
			display: flex;
			justify-content: center;
		}

		.textbox {
			background: rgb(255 249 0);
			background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
			border-top: 1px solid #874b2e;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			font-size: 10px;
			font-weight: bold;

			.name {
				color: #874b2e;
			}

			.level {
				color: #fce3bc;
			}
		}

		&.not-selected {
			filter: grayscale(100%);
		}
	}
}
</style>

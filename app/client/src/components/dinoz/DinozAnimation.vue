<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/dinoz/DinozWithoutFlash.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-02-09.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<img v-if="loaded" :src="dinoImg" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dino as DinoCtor } from '@eternaltwin/dinorpg_animations';

type DinoInstance = {
	toRawImage: (callback: (base64: string) => void, width?: number, height?: number) => void;
};

type DinoConstructor = new (options: {
	data: string;
	flip?: boolean;
	damages?: number;
	dark?: boolean;
	scale?: number;
	shadow?: boolean;
	congel?: boolean;
}) => DinoInstance;

export default defineComponent({
	name: 'DinozAnimation',
	data() {
		return {
			dinoImg: undefined as string | undefined,
			loaded: false as boolean
		};
	},
	props: {
		display: { type: String, required: true },
		life: { type: Number, required: true },
		flip: { type: Boolean, default: false },
		isFrozen: { type: Boolean, required: false }
	},
	mounted() {
		const Dino = DinoCtor as unknown as DinoConstructor;

		const dinos = new Dino({
			data: this.display,
			flip: this.flip,
			damages: this.life > 0.5 ? 0 : this.life > 0.1 ? 1 : 2,
			dark: false,
			scale: 1,
			shadow: true,
			congel: this.isFrozen ?? false
		});
		dinos.toRawImage(
			value => {
				this.dinoImg = value;
				this.loaded = true;
			},
			190,
			165
		);
	}
});
</script>

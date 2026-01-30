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

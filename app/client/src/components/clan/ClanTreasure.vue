<template>
	<div class="wrapper">
		<DZDisclaimer round help :content="$t('clan.ingredients.help', { value: treasureValue })" />
		<Tippy theme="normal" tag="div" v-for="ingredient in treasure" :key="ingredient.name" class="container">
			<img :src="getImgURL('ingredients', ingredient.name)" :alt="ingredient.name" />
			<p>x {{ ingredient.quantity }}</p>
			<template #content>
				<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
				<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
				<h2 v-html="formatContent($t(`clan.ingredients.price`, { price: ingredient.price }))" />
			</template>
		</Tippy>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanService } from '../../services/clan.service.ts';
import { userStore } from '../../store/userStore.ts';
import { errorHandler } from '../../utils/errorHandler.ts';
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/IngredientFiche.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { beautifulNumber } from '../../utils/beautifulNumber.js';
import DZDisclaimer from '../utils/DZDisclaimer.vue';

export default defineComponent({
	name: 'ClanTreasure',
	components: { DZDisclaimer },
	data() {
		return {
			treasure: [] as Pick<IngredientFiche, 'name' | 'quantity' | 'price'>[],
			userStore: userStore()
		};
	},
	computed: {
		treasureValue(): string {
			return beautifulNumber(this.treasure.reduce((acc, cur) => acc + cur.price * (cur.quantity ?? 0), 0));
		}
	},
	methods: {
		async load() {
			const clanId = this.userStore.getClanId;
			if (!clanId) {
				this.$toast.open({ message: this.$t('toast.error'), type: 'error' });
				return;
			}
			try {
				const treasure = await ClanService.getClanTreasure(clanId);
				treasure.forEach((t: { ingredientId: number; quantity: number }) => {
					const ingredient = Object.values(ingredientList).find(i => i.ingredientId === t.ingredientId);
					if (!ingredient) {
						this.$toast.open({ message: this.$t('toast.error'), type: 'error' });
						return;
					}
					this.treasure.push({ name: ingredient.name, quantity: t.quantity, price: ingredient.price });
				});
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async created() {
		await this.load();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	display: flex;
	gap: 5px;
	flex-wrap: wrap;
	margin: 10px;
}
.container {
	display: flex;
	gap: 7px;
	align-items: center;
	background-color: #bc683c;
	border-radius: 80% 30px 30px 80%;
	color: white;
	width: 100px;
	padding-right: 10px;

	img {
		object-fit: contain;
		flex-shrink: 0;
	}

	p {
		font-weight: bold;
		font-size: 0.9rem;
		margin: 0;
		white-space: nowrap;

		&:first-letter {
			font-weight: normal;
			font-size: 75%;
			color: #fce3bc;
		}
	}
}
</style>

<template>
	<TitleHeader :title="$t('pageTitle.dinoz')" :header="$t('trainingCenter.title')" />
	<div class="training-center-page">
		<section class="training-card">
			<img class="logo" :src="getImgURL('places', 'cef')" alt="C.E.F." />
			<h2>{{ $t('trainingCenter.title') }}</h2>
			<p class="intro" v-html="$t('trainingCenter.access')" />
			<img class="arena" :src="getImgURL('backgrounds', 's_cef')" alt="" />
			<p class="description">
				{{ $t('trainingCenter.description') }}
			</p>
			<DZDisclaimer help content="trainingCenter.warning" />
			<div class="programs">
				<button
					v-for="program in programs"
					:key="program.key"
					class="program"
					type="button"
					@click="start(program.key)"
				>
					<span class="name">{{ $t(program.labelKey) }}</span>
					<span class="program-description">
						{{ $t(program.descriptionKey) }}
					</span>
					<span class="price">
						{{ program.price }}
						<img :src="getImgURL('icons', 'small_gold')" alt="" />
					</span>
					<span v-if="program.xpMultiplier > 1" class="bonus">
						+{{ Math.round((program.xpMultiplier - 1) * 100) }}%
						{{ $t('trainingCenter.xpBonus') }}
					</span>
				</button>
			</div>
			<p class="note">
				{{ $t('trainingCenter.monstersNote') }}
			</p>
		</section>
	</div>
</template>

<script lang="ts">
import {
	trainingCenterPrograms,
	type TrainingCenterProgramKey
} from '@dinorpg/core/models/trainingCenter/trainingCenter.js';
import { computed, defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { getImgURL } from '../utils/getImgURL';

export default defineComponent({
	name: 'TrainingCenterPage',
	components: {
		DZDisclaimer,
		TitleHeader
	},
	setup() {
		const route = useRoute();
		const router = useRouter();
		const dinozId = computed(() => Number(route.params.id));
		const programs = Object.values(trainingCenterPrograms);
		function start(program: TrainingCenterProgramKey) {
			router.push({
				name: 'fight',
				params: {
					id: dinozId.value
				},
				query: {
					source: 'training_center',
					program
				}
			});
		}
		return {
			getImgURL,
			programs,
			start
		};
	}
});
</script>

<style scoped lang="scss">
.training-center-page {
	display: flex;
	justify-content: center;
}
.training-card {
	width: min(560px, 100%);
	padding: 1rem;
	background: #c9915d;
	color: #fff;
	font-weight: 700;
	text-align: left;
	border-right: 3px solid #2d5f7c;
	border-bottom: 3px solid #2d5f7c;
	.logo {
		display: block;
		width: 122px;
		height: auto;
		margin: 0 auto 1rem;
		border: 1px solid #fff;
	}
	h2 {
		margin: 0 0 1rem;
		color: red;
		font-size: 1.15rem;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.intro,
	.description,
	.note {
		margin: 1rem 0;
		line-height: 1.35;
	}
	.arena {
		display: block;
		width: 100%;
		max-width: 422px;
		margin: 1.5rem auto;
		border: 1px solid #fff;
	}
}
.programs {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.75rem;
	margin-top: 1rem;
}

.program {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.35rem;
	padding: 0.75rem;
	background: #efb873;
	border: 2px solid #d36f35;
	color: #9e2100;
	font-weight: 700;
	cursor: pointer;
	&:hover {
		background: #f8ca82;
	}
	.name {
		font-size: 1rem;
	}
	.program-description {
		font-size: 0.8rem;
		text-align: center;
	}
	.price,
	.bonus {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
	.price img {
		width: 16px;
		height: 16px;
	}
	.bonus {
		color: #7d1400;
		font-size: 0.75rem;
	}
}
@media (max-width: 768px) {
	.programs {
		grid-template-columns: 1fr;
	}
}
</style>

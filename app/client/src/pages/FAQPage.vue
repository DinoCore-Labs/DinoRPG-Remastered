<template>
	<TitleHeader :title="`${$t('pageTitle.faq')}`" :header="$t(`topBar.userMenu.faq`)" />
	<DZDisclaimer help round content="faq.intro" />
	<div class="search">
		<form @submit.prevent="e => e.preventDefault()">
			<table>
				<tbody>
					<tr>
						<td>
							<DZInput name="search" v-model="searchQuery" />
						</td>
						<td>
							<DZButton type="submit">{{ $t(`faq.search`) }}</DZButton>
						</td>
					</tr>
				</tbody>
			</table>
		</form>
	</div>
	<div class="faq">
		<h3 class="titleSection">{{ $t('faq.qa') }}</h3>
		<dl class="results">
			<template v-for="pair in filteredPairs" :key="pair.id">
				<dt @click="toggleCollapsed(pair.id)">
					<span><img :src="getImgURL('icons', 'small_follow')" /></span>
					<p v-html="formatContent(pair.question)" />
				</dt>
				<dd v-show="!isCollapsed(pair.id)" v-html="formatContent(pair.answer)" />
			</template>
		</dl>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import DZButton from '../components/utils/DZButton.vue';
import DZInput from '../components/utils/DZInput.vue';

interface FaqPair {
	id: number;
	question: string;
	answer: string;
	collapsed: boolean;
}

export default defineComponent({
	name: 'FAQ',
	components: {
		DZButton,
		DZDisclaimer,
		DZInput,
		TitleHeader
	},
	data() {
		const faqPairs = computed<FaqPair[]>(() => [
			{ id: 1, question: this.$t('faq.faq1.question'), answer: this.$t('faq.faq1.answer'), collapsed: true },
			{ id: 2, question: this.$t('faq.faq2.question'), answer: this.$t('faq.faq2.answer'), collapsed: true },
			{ id: 3, question: this.$t('faq.faq8.question'), answer: this.$t('faq.faq8.answer'), collapsed: true },
			{ id: 4, question: this.$t('faq.faq3.question'), answer: this.$t('faq.faq3.answer'), collapsed: true },
			{ id: 5, question: this.$t('faq.faq9.question'), answer: this.$t('faq.faq9.answer'), collapsed: true },
			{ id: 6, question: this.$t('faq.faq10.question'), answer: this.$t('faq.faq10.answer'), collapsed: true },
			{ id: 7, question: this.$t('faq.faq4.question'), answer: this.$t('faq.faq4.answer'), collapsed: true },
			{ id: 8, question: this.$t('faq.faq5.question'), answer: this.$t('faq.faq5.answer'), collapsed: true },
			{ id: 9, question: this.$t('faq.faq6.question'), answer: this.$t('faq.faq6.answer'), collapsed: true },
			{ id: 10, question: this.$t('faq.faq11.question'), answer: this.$t('faq.faq11.answer'), collapsed: true },
			{ id: 11, question: this.$t('faq.faq12.question'), answer: this.$t('faq.faq12.answer'), collapsed: true },
			{ id: 12, question: this.$t('faq.faq13.question'), answer: this.$t('faq.faq13.answer'), collapsed: true },
			{ id: 13, question: this.$t('faq.faq14.question'), answer: this.$t('faq.faq14.answer'), collapsed: true },
			{ id: 14, question: this.$t('faq.faq15.question'), answer: this.$t('faq.faq15.answer'), collapsed: true },
			{ id: 15, question: this.$t('faq.faq16.question'), answer: this.$t('faq.faq16.answer'), collapsed: true },
			{ id: 16, question: this.$t('faq.faq7.question'), answer: this.$t('faq.faq7.answer'), collapsed: true },
			{ id: 17, question: this.$t('faq.faq17.question'), answer: this.$t('faq.faq17.answer'), collapsed: true },
			{ id: 18, question: this.$t('faq.faq18.question'), answer: this.$t('faq.faq18.answer'), collapsed: true },
			{ id: 19, question: this.$t('faq.faq19.question'), answer: this.$t('faq.faq19.answer'), collapsed: true },
			{ id: 20, question: this.$t('faq.faq20.question'), answer: this.$t('faq.faq20.answer'), collapsed: true },
			{ id: 21, question: this.$t('faq.faq21.question'), answer: this.$t('faq.faq21.answer'), collapsed: true },
			{ id: 22, question: this.$t('faq.faq22.question'), answer: this.$t('faq.faq22.answer'), collapsed: true },
			{ id: 23, question: this.$t('faq.faq23.question'), answer: this.$t('faq.faq23.answer'), collapsed: true },
			{ id: 24, question: this.$t('faq.faq24.question'), answer: this.$t('faq.faq24.answer'), collapsed: true },
			{ id: 25, question: this.$t('faq.faq25.question'), answer: this.$t('faq.faq25.answer'), collapsed: true },
			{ id: 26, question: this.$t('faq.faq26.question'), answer: this.$t('faq.faq26.answer'), collapsed: true },
			{ id: 27, question: this.$t('faq.faq27.question'), answer: this.$t('faq.faq27.answer'), collapsed: true },
			{ id: 28, question: this.$t('faq.faq28.question'), answer: this.$t('faq.faq28.answer'), collapsed: true },
			{ id: 29, question: this.$t('faq.faq29.question'), answer: this.$t('faq.faq29.answer'), collapsed: true },
			{ id: 30, question: this.$t('faq.faq30.question'), answer: this.$t('faq.faq30.answer'), collapsed: true }
		]);

		const searchQuery = ref<string>('');
		const filteredPairs = computed(() => {
			const searchTerm = searchQuery.value.toLowerCase();
			return faqPairs.value.filter(pair => pair.question.toLowerCase().includes(searchTerm));
		});
		const collapsedPairs = new Map<number, boolean>();

		return {
			faqPairs,
			searchQuery,
			filteredPairs,
			collapsedPairs
		};
	},
	methods: {
		toggleCollapsed(id: number) {
			this.collapsedPairs.set(id, !this.isCollapsed(id));
		},
		isCollapsed(id: number): boolean {
			return this.collapsedPairs.get(id) ?? true;
		}
	}
});
</script>
<style lang="scss" scoped>
.intro {
	align-items: first baseline;
	background-color: #bc683c;
	color: #fce3bc;
	display: flex;
	font-size: 10pt;
	gap: 6px;
	padding: 5px;
}
.search {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 10px;
}
.faq {
	margin-top: 20px;
	.titleSection {
		background-color: #bc683c;
		color: #fff1ad;
		margin-bottom: 10px;
		padding-left: 10px;
	}
	.results {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 10px;
		& dt {
			color: #8e3e26;
			cursor: pointer;
			display: flex;
			align-items: center;
			font-variant: small-caps;
			font-weight: bold;
			gap: 6px;
			margin-top: 10px;
			padding-left: 20px;
			&:hover {
				background-color: #8e3e26;
				color: #fff1ad;
			}
		}
		& dd {
			background-color: #f3ca92;
			border: 1px solid #fcf9d1;
			display: block;
			margin-inline-start: 40px;
			outline: 2px solid #f8d39c;
			padding: 5px;
			max-width: calc(100% - 52px);
		}
		:deep(strong) {
			color: rgb(142, 62, 38);
		}
		:deep(i) {
			color: rgb(142, 62, 38);
		}
	}
}
</style>

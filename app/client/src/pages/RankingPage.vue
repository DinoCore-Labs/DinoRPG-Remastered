<template>
	<TitleHeader :title="`${$t('pageTitle.ranking')}`" :header="$t('common.ranking')" :sub-header="$t(subHeader)" />
	<ul class="onglets main-tabs">
		<li :class="{ active: isPlayerTab }">
			<RouterLink :to="{ name: 'RankingPlayers', params: { pageLoaded: 1 } }">
				<img :src="getImgURL('icons', 'small_member')" alt="member" /> {{ $t('ranking.tabs.players') }}
			</RouterLink>
		</li>
		<li :class="{ active: isClanTab }">
			<RouterLink :to="{ name: 'RankingClans', params: { pageLoaded: 1 } }">
				{{ $t('common.clans') }}
			</RouterLink>
		</li>
		<li :class="{ active: isEventTab }" v-if="isEventActive || isEventTab">
			<RouterLink :to="{ name: 'RankingEventClans', params: { eventId: currentEventId, pageLoaded: 1 } }">
				{{ $t('ranking.tabs.event') }}
			</RouterLink>
		</li>
	</ul>
	<ul class="onglets sub-tabs" v-if="isPlayerTab">
		<li :class="{ active: $route.name === 'RankingPlayers' }">
			<RouterLink :to="{ name: 'RankingPlayers', params: { pageLoaded: 1 } }">
				{{ $t('ranking.tabs.players') }}
			</RouterLink>
		</li>
		<li :class="{ active: $route.name === 'RankingAverage' }">
			<RouterLink :to="{ name: 'RankingAverage', params: { pageLoaded: 1 } }">
				{{ $t('ranking.tabs.average') }}
			</RouterLink>
		</li>
		<li :class="{ active: $route.name === 'RankingCompletion' }">
			<RouterLink :to="{ name: 'RankingCompletion', params: { pageLoaded: 1 } }">
				{{ $t('common.completion') }}
			</RouterLink>
		</li>
	</ul>
	<ul class="onglets sub-tabs" v-if="isClanTab">
		<li :class="{ active: $route.name === 'RankingClans' }">
			<RouterLink :to="{ name: 'RankingClans', params: { pageLoaded: 1 } }">
				{{ $t('common.clans') }}
			</RouterLink>
		</li>
		<li :class="{ active: $route.name === 'RankingTreasure' }">
			<RouterLink :to="{ name: 'RankingTreasure', params: { pageLoaded: 1 } }">
				{{ $t('common.treasureValue') }}
			</RouterLink>
		</li>
	</ul>
	<ul class="onglets sub-tabs" v-if="isEventTab">
		<li :class="{ active: $route.name === 'RankingEventClans' }">
			<RouterLink
				:to="{ name: 'RankingEventClans', params: { eventId: currentEventId, pageLoaded: 1 }, query: $route.query }"
			>
				{{ $t('common.clans') }}
			</RouterLink>
		</li>
		<li :class="{ active: $route.name === 'RankingEventPlayers' }">
			<RouterLink
				:to="{ name: 'RankingEventPlayers', params: { eventId: currentEventId, pageLoaded: 1 }, query: $route.query }"
			>
				{{ $t('ranking.tabs.players') }}
			</RouterLink>
		</li>
	</ul>
	<div v-if="isEventTab && eventEditionOptions.length > 0" class="event-edition-selector">
		<span>{{ $t('ranking.event.edition') }}</span>
		<DZSelect
			id="event-ranking-edition"
			v-model="selectedEventEdition"
			:options="eventEditionOptions"
			@change="changeEventEdition"
		/>
	</div>
	<RouterView />
</template>

<script lang="ts">
import type { UserData } from '@dinorpg/core/models/user/userData.js';
import { gameConfigStore } from '../store/gameConfigStore.js';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouterView } from 'vue-router';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { getImgURL } from '../utils/getImgURL';
import DZSelect, { type SelectOption } from '../components/utils/DZSelect.vue';
import { RankingService } from '../services';

export default defineComponent({
	name: 'Ranking',
	components: {
		TitleHeader,
		RouterView,
		DZSelect
	},
	setup() {
		const route = useRoute();
		const router = useRouter();

		const eventEditions = ref<number[]>([]);
		const selectedEventEdition = ref<number | undefined>(route.query.edition ? Number(route.query.edition) : undefined);

		const eventEditionOptions = computed<SelectOption<number>[]>(() =>
			eventEditions.value.map(edition => ({
				value: edition,
				label: edition.toString()
			}))
		);

		const loadEventEditions = async () => {
			const eventId = (route.params.eventId as string | undefined) ?? currentEventId.value;
			if (!eventId) {
				eventEditions.value = [];
				return;
			}
			const response = await RankingService.getEventRankingEditions(eventId);
			eventEditions.value = response.editions;
			if (selectedEventEdition.value === undefined && response.editions.length > 0) {
				selectedEventEdition.value = response.editions[0];
			}
		};

		const changeEventEdition = async () => {
			if (!selectedEventEdition.value) {
				return;
			}
			await router.push({
				name: route.name ?? undefined,
				params: {
					...route.params,
					pageLoaded: 1
				},
				query: {
					...route.query,
					edition: selectedEventEdition.value.toString()
				}
			});
		};

		watch(
			() => route.params.eventId,
			() => {
				void loadEventEditions();
			},
			{
				immediate: true
			}
		);

		const isPlayerTab = computed(() =>
			['RankingPlayers', 'RankingAverage', 'RankingCompletion'].includes(route.name as string)
		);

		const isClanTab = computed(() => ['RankingClans', 'RankingTreasure'].includes(route.name as string));

		const isEventTab = computed(() => ['RankingEventPlayers', 'RankingEventClans'].includes(route.name as string));

		const isEventActive = computed(() => gameConfigStore().activeEvents.length > 0);

		const currentEventId = computed(() => {
			const events = gameConfigStore().activeEvents;
			return events.length > 0 ? events[0].event : '';
		});

		const subHeader = computed(() => {
			switch (route.name) {
				case 'RankingPlayers':
					return 'ranking.tabs.players';
				case 'RankingAverage':
					return 'ranking.tabs.average';
				case 'RankingCompletion':
					return 'common.completion';
				case 'RankingClans':
					return 'common.clans';
				case 'RankingTreasure':
					return 'common.treasureValue';
				case 'RankingEventPlayers':
					return 'ranking.tabs.eventPlayers';
				case 'RankingEventClans':
					return 'ranking.tabs.eventClans';
				default:
					return 'ranking.tabs.players';
			}
		});
		return {
			subHeader,
			isPlayerTab,
			isClanTab,
			isEventTab,
			isEventActive,
			currentEventId,
			eventEditionOptions,
			selectedEventEdition,
			changeEventEdition
		};
	},
	methods: {
		getImgURL,
		goToAccount(u: Pick<UserData, 'id' | 'name'>): void {
			this.$router.push({ name: 'MyAccount', params: { id: u.id } });
		}
	}
});
</script>

<style lang="scss" scoped>
.search::placeholder {
	color: #fce3bc;
}
a {
	cursor: pointer;
}
.main-tabs {
	margin-bottom: 0;
	padding-bottom: 0;
	li a {
		font-size: 11pt;
		font-weight: bold;
		background-color: #8b3e1e; // plus sombre pour les onglets principaux
	}
	li.active a {
		background-color: #bc683c;
	}
}

.sub-tabs {
	margin-top: 1px;
}
.onglets {
	list-style: none;
	height: 20px;
	align-self: center;
	background-color: transparent;
	background-image: url('../assets/design/tabs/tabsBg.webp');
	background-repeat: no-repeat;
	border-bottom: 1.2px solid #ffe7aa;
	li {
		float: left;
		position: relative;
		margin-right: 5px;
		&.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
		a {
			color: #fce3bc;
			text-decoration: none;
			padding-left: 5px;
			padding-right: 5px;
			background-color: #bc683c;
			border-right: 1px solid black;
			border-left: 1px solid #d39a65;
			border-top: 1px solid #d39a65;
			font-size: 10pt;
			border-radius: 0px;
		}
	}
}
</style>

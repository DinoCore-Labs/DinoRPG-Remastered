<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/components/dojo/DojoTournament.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-08-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.tournaments`)" />
	<ul class="tournament-list" v-if="!displayFinal">
		<li v-for="(_, group) in GROUP_COUNT" :key="group" class="group">
			<RouterLink :to="`/dojo/tournament/${tournamentId}/${group}`">
				{{ $t('dojo.group', { group: ALPHABET[group] }) }}
			</RouterLink>
		</li>
	</ul>
	<div class="container">
		<div class="wrapper tournament" v-if="!displayFinal">
			<div class="header">
				<RouterLink :to="`/dojo/tournament/${tournamentId}/16`">
					<DZButton>{{ $t('dojo.seeFinal') }}</DZButton>
				</RouterLink>
				<DZButton @click="viewAll()">{{ $t('dojo.markAsRead') }}</DZButton>
			</div>
			<div class="rounds">
				<template v-for="(team, count) in pool" :key="`${count}${team?.fight ?? 'undefined'}`">
					<div v-if="!team"></div>
					<Tippy
						tag="div"
						theme="normal"
						class="dinoz"
						v-else-if="team.show"
						:class="{ me: team.player && team.player.id === userStore.id, lost: !team.won && team.watched }"
						@click="goToPage('ShareFight', { archive: team.fight })"
					>
						<DinozMini
							v-if="team.dinoz"
							:display="team.dinoz.display"
							:width="50"
							:height="50"
							:flip="displayFinal && isFlipped(count)"
							class="dinoz-display"
						/>
						<span class="name" v-if="team.player || team.dinoz">{{ team.player?.name ?? '???' }}</span>

						<template #content>
							<h1>{{ team?.player?.name + ' Vs ' + team?.opponent?.name }}</h1>
							<p>{{ $t('dojo.seeFight', { playerA: team?.player?.name, playerB: team?.opponent?.name }) }}</p>
						</template>
					</Tippy>
					<Tippy tag="div" theme="normal" class="dinoz" v-else @click="goToPage('ShareFight', { archive: team.fight })">
						<span class="name">{{ $t('dojo.soon') }}</span>

						<template #content>
							<h1>{{ team?.player?.name + ' Vs ' + team?.opponent?.name }}</h1>
							<p>{{ $t('dojo.seeFight', { playerA: team?.player?.name, playerB: team?.opponent?.name }) }}</p>
						</template>
					</Tippy>
				</template>
			</div>
		</div>
		<div class="wrapper final" v-if="displayFinal">
			<div class="header">
				<RouterLink :to="`/dojo/tournament/${tournamentId}/0`">
					<DZButton>{{ $t('dojo.return') }}</DZButton>
				</RouterLink>
				<DZButton @click="viewAllFinals()">{{ $t('dojo.markAsRead') }}</DZButton>
			</div>
			<div class="rounds">
				<template v-for="(team, index) in final" :key="index">
					<div v-if="!team"></div>
					<Tippy
						v-else-if="team.show"
						tag="div"
						theme="normal"
						class="dinoz"
						:class="{ me: team.player && team.player.id === userStore.id, lost: !team.won && team.watched }"
						@click="goToPage('ShareFight', { archive: team.fight })"
					>
						<DinozMini
							v-if="team.dinoz"
							:display="team.dinoz.display"
							:width="50"
							:height="50"
							:flip="isFinalFlipped(index)"
							class="dinoz-display"
						/>
						<span class="name" v-if="team.player || team.dinoz">{{ team.player?.name ?? '???' }}</span>

						<template #content>
							<h1>{{ team?.player?.name + ' Vs ' + team?.opponent?.name }}</h1>
							<p>{{ $t('dojo.seeFight', { playerA: team?.player?.name, playerB: team?.opponent?.name }) }}</p>
						</template>
					</Tippy>

					<Tippy v-else tag="div" theme="normal" class="dinoz" @click="goToPage('ShareFight', { archive: team.fight })">
						<span class="name">{{ $t('dojo.soon') }}</span>
						<template #content>
							<h1>{{ team?.player?.name + ' Vs ' + team?.opponent?.name }}</h1>
							<p>{{ $t('dojo.seeFight', { playerA: team?.player?.name, playerB: team?.opponent?.name }) }}</p>
						</template>
					</Tippy>
				</template>
			</div>
		</div>
	</div>

	<DZDisclaimer help :content="$t('dojo.tournamentInfo')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import { userStore } from '../../store/userStore.js';
import DZButton from '../utils/DZButton.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DinozMini from '../dinoz/DinozMini.vue';
import { DojoService } from '../../services/dojo.service.ts';
import {
	type DisplayedLeader,
	type PublicTournament,
	TournamentPhase,
	type TournamentTeam
} from '@dinorpg/core/models/dojo/tournament.js';
import { errorHandler } from '../../utils/errorHandler.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default defineComponent({
	name: 'DojoTournament',
	components: {
		TitleHeader,
		DZButton,
		DZDisclaimer,
		DinozMini
	},
	data() {
		return {
			userStore: userStore(),
			GROUP_COUNT: 16 as number,
			ALPHABET,
			dinozInFights: [] as DisplayedLeader[],
			tournament: [] as PublicTournament[],
			final: [] as (DisplayedLeader | undefined)[],
			pool: [] as (DisplayedLeader | undefined)[],
			activeGroup: 10,
			displayFinal: false,
			tournamentId: undefined as undefined | string
		};
	},
	methods: {
		goToPage(pageName: string, params?: Record<string, string>) {
			if (!params) return;
			this.$router.push({
				name: pageName,
				params
			});
		},
		getPoolIndex(round: number, matchNumber: number, slot: 'left' | 'right'): number {
			const isLeft = slot === 'left' ? 0 : 1;
			if (round === 0) {
				return (matchNumber - 1) * 2 + isLeft;
			}
			if (round === 1) {
				return 4 + (matchNumber - 3) * 2 + isLeft;
			}
			if (round === 2) {
				return 8 + isLeft;
			}
			return -1;
		},
		async showFinal() {
			if (typeof this.tournamentId !== 'string') return;

			const FINALS_STEP_OFFSET = 10;
			this.displayFinal = true;
			try {
				this.tournament = await DojoService.getTournamentFights(this.tournamentId, TournamentPhase.FINALS, 0);

				this.dinozInFights = this.tournament.reduce((acc, fight) => {
					const d1 = {
						dinoz: fight.tournamentTeamLeft?.dinoz ?? null,
						player: fight.tournamentTeamLeft?.user ?? null,
						opponent: fight.tournamentTeamRight?.user ?? null,
						fight: fight.id,
						won: fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: true,
						slot: 'left'
					} as DisplayedLeader;
					const d2 = {
						dinoz: fight.tournamentTeamRight?.dinoz ?? null,
						player: fight.tournamentTeamRight?.user ?? null,
						opponent: fight.tournamentTeamLeft?.user ?? null,
						fight: fight.id,
						won: !fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: true,
						slot: 'right'
					} as DisplayedLeader;

					acc.push(d1, d2);

					return acc;
				}, [] as DisplayedLeader[]);
				this.tournament.sort((a, b) => a.metadata.matchNumber - b.metadata.matchNumber);
				this.tournament.sort((a, b) => a.metadata.round - b.metadata.round);

				this.dinozInFights.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				this.dinozInFights.sort((d1, d2) => d1.round - d2.round);

				this.dinozInFights.forEach(d => {
					d.round = d.round - FINALS_STEP_OFFSET;
				});

				this.GROUP_COUNT = 0;
				this.final = Array.from({ length: 62 });

				this.dinozInFights.forEach(d => {
					let idx = -1;
					if (d.round === 0) {
						idx = d.matchNumber * 2 + (d.slot === 'left' ? 0 : 1);
					} else if (d.round === 1) {
						idx = 32 + d.matchNumber * 2 + (d.slot === 'left' ? 0 : 1);
					} else if (d.round === 2) {
						idx = 48 + d.matchNumber * 2 + (d.slot === 'left' ? 0 : 1);
					} else if (d.round === 3) {
						idx = 56 + d.matchNumber * 2 + (d.slot === 'left' ? 0 : 1);
					} else if (d.round === 4) {
						idx = 60 + (d.slot === 'left' ? 0 : 1);
					}
					if (idx >= 0 && idx < 62) {
						this.final[idx] = { ...d, show: true };
					} else {
						console.warn('Dino finale non mappé (round/matchNumber inattendu) :', d);
					}
				});
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		formatDinoz(
			match: PublicTournament,
			team: TournamentTeam | null,
			opponent: TournamentTeam | null
		): DisplayedLeader {
			return {
				dinoz: team?.dinoz ?? null,
				player: team?.user ?? null,
				opponent: opponent?.user ?? null,
				fight: match.id,
				won: true,
				round: match.metadata.round,
				pool: match.metadata.poolNumber,
				matchNumber: match.metadata.matchNumber,
				watched: match.watched,
				show: true,
				slot: 'left'
			};
		},
		isFlipped(index: number) {
			return index % 2 === 1;
		},
		isFinalFlipped(index: number): boolean {
			// Right side of bracket (bottom half): indices 16-31 (R0), 40-47 (R1), 52-55 (R2), 58-59 (R3)
			if (index >= 16 && index <= 31) return true; // Round 0 bottom half
			if (index >= 40 && index <= 47) return true; // Round 1 bottom half
			if (index >= 52 && index <= 55) return true; // Round 2 bottom half
			if (index >= 58 && index <= 59) return true; // Round 3 semifinal 2
			if (index === 61) return true; // Final - right side
			return false;
		},
		async loadPage() {
			if (typeof this.tournamentId !== 'string') return;

			this.GROUP_COUNT = 16;
			try {
				this.tournament = await DojoService.getTournamentFights(
					this.tournamentId,
					TournamentPhase.POOLS,
					this.activeGroup
				);
				this.pool = Array.from({ length: 12 });
				this.dinozInFights = this.tournament.reduce((acc, fight) => {
					const d1 = {
						dinoz: fight.tournamentTeamLeft?.dinoz ?? null,
						player: fight.tournamentTeamLeft?.user ?? null,
						opponent: fight.tournamentTeamRight?.user ?? null,
						fight: fight.id,
						won: fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: true,
						slot: 'left'
					} as DisplayedLeader;
					const d2 = {
						dinoz: fight.tournamentTeamRight?.dinoz ?? null,
						player: fight.tournamentTeamRight?.user ?? null,
						opponent: fight.tournamentTeamLeft?.user ?? null,
						fight: fight.id,
						won: !fight.result,
						round: fight.metadata.round,
						pool: fight.metadata.poolNumber,
						matchNumber: fight.metadata.matchNumber,
						watched: fight.watched,
						show: true,
						slot: 'right'
					} as DisplayedLeader;

					acc.push(d1, d2);

					return acc;
				}, [] as DisplayedLeader[]);
				this.dinozInFights.sort((d1, d2) => d1.matchNumber - d2.matchNumber);
				this.dinozInFights.sort((d1, d2) => d1.round - d2.round);

				this.dinozInFights.forEach(d => {
					const idx = this.getPoolIndex(d.round, d.matchNumber, d.slot);
					if (idx >= 0) {
						this.pool[idx] = { ...d, show: true };
					}
				});

				// Place qualified winners in dedicated slots at the far right
				// Match 3 winner (2-0) -> index 10
				const match3Winner = this.dinozInFights.find(d => d.round === 1 && d.matchNumber === 3 && d.won);
				if (match3Winner && match3Winner.watched) {
					this.pool[10] = { ...match3Winner, show: true };
				}
				// Match 5 winner (2-1) -> index 11
				const match5Winner = this.dinozInFights.find(d => d.round === 2 && d.matchNumber === 5 && d.won);
				if (match5Winner && match5Winner.watched) {
					this.pool[11] = { ...match5Winner, show: true };
				}

				this.displayFinal = false;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async viewAll() {
			if (typeof this.tournamentId !== 'string') return;

			try {
				await DojoService.viewAllFightFromPool(this.tournamentId, TournamentPhase.POOLS, this.activeGroup);
				this.loadPage();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async viewAllFinals() {
			if (typeof this.tournamentId !== 'string') return;

			try {
				await DojoService.viewAllFightFromFinals(this.tournamentId);
				this.showFinal();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		this.tournamentId = this.$route.params.id as string;
		this.activeGroup = +(this.$route.params.group as string);
	},
	watch: {
		'$route.params.group': {
			handler(newGroup) {
				if (newGroup !== undefined && this.$route.name === 'DojoTournament') {
					this.activeGroup = Number(newGroup);
				}
			},
			immediate: true
		},
		activeGroup: {
			handler(newValue) {
				if (newValue === 16) {
					this.showFinal();
				} else if (newValue < 16) {
					this.loadPage();
				}
			},
			immediate: true
		}
	}
});
</script>

<style lang="scss" scoped>
.tournament-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin: 0;
	padding: 0;
	list-style: none;

	.group {
		margin: 2px 4px;

		a {
			cursor: pointer;
			text-decoration: underline;
			text-transform: uppercase;
			font-size: 11px;
			color: black;

			&:hover {
				background-color: inherit;
				color: #bc683c;
			}
		}
	}
}

@media (max-width: 505px) {
	.container {
		overflow-x: auto;
		margin: 10px;
	}
}

.wrapper {
	width: 495px;
	height: 531px;
	margin: 10px auto;

	background-repeat: no-repeat;

	.header {
		height: 45px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
.wrapper.final {
	width: 700px;
	height: 1032px;
}

.wrapper.tournament {
	width: 620px;
	height: 666px;
}

.tournament {
	background-image: url('../../assets/design/dojo/dojo_tournament_bg.webp');
	background-repeat: repeat-y;
	background-size: 100% 100%;

	.rounds {
		position: relative;
		height: 470px;

		.dinoz {
			position: absolute;
			width: 50px;
			height: 50px;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			background-image: url('../../assets/design/dojo/dojo_dino_available.webp');
			background-size: cover;
			cursor: pointer;
			z-index: 10;
			border-radius: 4px;

			&.lost {
				filter: grayscale(100%);
			}

			&.me {
				background-image: url('../../assets/design/dojo/dojo_dino_selected.webp');
				background-size: cover;
			}

			.name {
				text-shadow: #000000 0px 0px 5px;
				color: white;
				font-size: 9px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 100%;
			}

			/* =========================================================
               WINNER BRACKET 
               ========================================================= */

			// Round 0 - Match 1
			&:nth-child(1) {
				top: 20px;
				left: 80px;
			}
			&:nth-child(2) {
				top: 75px;
				left: 80px;
			}

			// Round 0 - Match 2
			&:nth-child(3) {
				top: 145px;
				left: 80px;
			}
			&:nth-child(4) {
				top: 200px;
				left: 80px;
			}

			// Round 1 - Match 3
			&:nth-child(5) {
				top: 47.5px;
				left: 240px;
			}
			&:nth-child(6) {
				top: 172.5px;
				left: 240px;
			}

			// Qualified N°1
			&:nth-child(11) {
				top: 110px;
				left: 420px;
			}

			/* =========================================================
               LOSER BRACKET 
               ========================================================= */

			// Round 1 - Match 4
			&:nth-child(7) {
				top: 325px;
				left: 130px;
			}
			&:nth-child(8) {
				top: 380px;
				left: 130px;
			}

			// Round 2 - Match 5
			&:nth-child(9) {
				top: 297.5px;
				left: 290px;
			}
			&:nth-child(10) {
				top: 352.5px;
				left: 290px;
			}

			// Qualified N°2
			&:nth-child(12) {
				top: 325px;
				left: 420px;
			}
		}
	}
}

.final {
	background-image: url('../../assets/design/dojo/dojo_tournament_bg.webp');
	background-repeat: repeat-y;
	background-size: 100% 100%;

	.rounds {
		position: relative;
		height: 980px;
		width: 620px;

		.dinoz {
			position: absolute;
			width: 50px;
			height: 50px;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			background-image: url('../../assets/design/dojo/dojo_dino_available.webp');
			background-size: cover;
			cursor: pointer;
			z-index: 10;
			border-radius: 4px;

			&.lost {
				filter: grayscale(100%);
			}

			&.me {
				background-image: url('../../assets/design/dojo/dojo_dino_selected.webp');
				background-size: cover;
			}

			.name {
				text-shadow: #000000 0px 0px 5px;
				color: white;
				font-size: 9px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 100%;
			}

			/* Round 0 - left */
			&:nth-child(1) {
				top: 20px;
				left: 10px;
			}
			&:nth-child(2) {
				top: 75px;
				left: 10px;
			}

			&:nth-child(3) {
				top: 137px;
				left: 10px;
			}
			&:nth-child(4) {
				top: 192px;
				left: 10px;
			}

			&:nth-child(5) {
				top: 254px;
				left: 10px;
			}
			&:nth-child(6) {
				top: 309px;
				left: 10px;
			}

			&:nth-child(7) {
				top: 371px;
				left: 10px;
			}
			&:nth-child(8) {
				top: 426px;
				left: 10px;
			}

			&:nth-child(9) {
				top: 488px;
				left: 10px;
			}
			&:nth-child(10) {
				top: 543px;
				left: 10px;
			}

			&:nth-child(11) {
				top: 605px;
				left: 10px;
			}
			&:nth-child(12) {
				top: 660px;
				left: 10px;
			}

			&:nth-child(13) {
				top: 722px;
				left: 10px;
			}
			&:nth-child(14) {
				top: 777px;
				left: 10px;
			}

			&:nth-child(15) {
				top: 839px;
				left: 10px;
			}
			&:nth-child(16) {
				top: 894px;
				left: 10px;
			}

			/* Round 0 - right */
			&:nth-child(17) {
				top: 20px;
				left: 560px;
			}
			&:nth-child(18) {
				top: 75px;
				left: 560px;
			}

			&:nth-child(19) {
				top: 137px;
				left: 560px;
			}
			&:nth-child(20) {
				top: 192px;
				left: 560px;
			}

			&:nth-child(21) {
				top: 254px;
				left: 560px;
			}
			&:nth-child(22) {
				top: 309px;
				left: 560px;
			}

			&:nth-child(23) {
				top: 371px;
				left: 560px;
			}
			&:nth-child(24) {
				top: 426px;
				left: 560px;
			}

			&:nth-child(25) {
				top: 488px;
				left: 560px;
			}
			&:nth-child(26) {
				top: 543px;
				left: 560px;
			}

			&:nth-child(27) {
				top: 605px;
				left: 560px;
			}
			&:nth-child(28) {
				top: 660px;
				left: 560px;
			}

			&:nth-child(29) {
				top: 722px;
				left: 560px;
			}
			&:nth-child(30) {
				top: 777px;
				left: 560px;
			}

			&:nth-child(31) {
				top: 839px;
				left: 560px;
			}
			&:nth-child(32) {
				top: 894px;
				left: 560px;
			}

			/* Round 1 - left */
			&:nth-child(33) {
				top: 47px;
				left: 100px;
			}
			&:nth-child(34) {
				top: 164px;
				left: 100px;
			}
			&:nth-child(35) {
				top: 281px;
				left: 100px;
			}
			&:nth-child(36) {
				top: 398px;
				left: 100px;
			}
			&:nth-child(37) {
				top: 515px;
				left: 100px;
			}
			&:nth-child(38) {
				top: 632px;
				left: 100px;
			}
			&:nth-child(39) {
				top: 749px;
				left: 100px;
			}
			&:nth-child(40) {
				top: 866px;
				left: 100px;
			}

			/* Round 1 - right */
			&:nth-child(41) {
				top: 47px;
				left: 470px;
			}
			&:nth-child(42) {
				top: 164px;
				left: 470px;
			}
			&:nth-child(43) {
				top: 281px;
				left: 470px;
			}
			&:nth-child(44) {
				top: 398px;
				left: 470px;
			}
			&:nth-child(45) {
				top: 515px;
				left: 470px;
			}
			&:nth-child(46) {
				top: 632px;
				left: 470px;
			}
			&:nth-child(47) {
				top: 749px;
				left: 470px;
			}
			&:nth-child(48) {
				top: 866px;
				left: 470px;
			}

			/* Round 2 - left */
			&:nth-child(49) {
				top: 105px;
				left: 190px;
			}
			&:nth-child(50) {
				top: 339px;
				left: 190px;
			}
			&:nth-child(51) {
				top: 573px;
				left: 190px;
			}
			&:nth-child(52) {
				top: 807px;
				left: 190px;
			}

			/* Round 2 - Right */
			&:nth-child(53) {
				top: 105px;
				left: 380px;
			}
			&:nth-child(54) {
				top: 339px;
				left: 380px;
			}
			&:nth-child(55) {
				top: 573px;
				left: 380px;
			}
			&:nth-child(56) {
				top: 807px;
				left: 380px;
			}

			/* Round 3 - 1/2 */
			&:nth-child(57) {
				top: 222px;
				left: 250px;
			}
			&:nth-child(58) {
				top: 690px;
				left: 250px;
			}
			&:nth-child(59) {
				top: 222px;
				left: 320px;
			}
			&:nth-child(60) {
				top: 690px;
				left: 320px;
			}

			/* Round 4 - Final */
			&:nth-child(61) {
				top: 398px;
				left: 285px;
			}
			&:nth-child(62) {
				top: 515px;
				left: 285px;
			}
		}
	}
}
</style>

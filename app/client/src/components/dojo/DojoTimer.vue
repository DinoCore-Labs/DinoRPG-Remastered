<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/components/dojo/DojoTimer.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-08-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DZDisclaimer v-if="isFinished" round :content="$t(`dojo.timer.nextQualif`, timeRemaining)" />
	<DZDisclaimer v-else round :content="$t(`dojo.timer.${state.phase}`, timeRemaining)" />
	<DZDisclaimer round :content="$t(`dojo.timer.cashPrice`, { cashPrice: beautifulNumber(state.cashPrice) })" />
	<DZDisclaimer v-if="!tournamentTeam && state" round help :content="$t(`dojo.timer.noTeam`)" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { dojoStore } from '../../store/dojoStore.js';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import type { TournamentState } from '@dinorpg/core/models/dojo/tournament.js';
import { beautifulNumber } from '../../utils/beautifulNumber.js';

export default defineComponent({
	name: 'DojoTimer',
	data() {
		return {
			beautifulNumber,
			now: new Date(),
			timer: null as ReturnType<typeof setInterval> | null
		};
	},
	computed: {
		tournamentTeam() {
			return dojoStore().TournamentTeam;
		},
		isFinished(): boolean {
			// Round 15 = lastFight.tournamentStep 14 + 1 (finale jouée)
			return this.state.round >= 15;
		},
		timeRemaining(): { day: number; hours: number; minutes: number } {
			if (!this.state.nextScheduledMatch) {
				return { day: 0, hours: 0, minutes: 0 };
			}

			const targetedDate = new Date(this.state.nextScheduledMatch);
			const difference = targetedDate.getTime() - this.now.getTime();

			if (difference <= 0) {
				return {
					day: 0,
					hours: 0,
					minutes: 0
				};
			}

			const millisecondsPerMinute = 1000 * 60;
			const millisecondsPerHour = millisecondsPerMinute * 60;
			const millisecondsPerDay = millisecondsPerHour * 24;

			const day = Math.floor(difference / millisecondsPerDay);
			const remainingHours = Math.floor((difference % millisecondsPerDay) / millisecondsPerHour);
			const remainingMinutes = Math.floor((difference % millisecondsPerHour) / millisecondsPerMinute);

			return {
				day,
				hours: remainingHours,
				minutes: remainingMinutes
			};
		}
	},
	props: {
		state: {
			type: Object as PropType<TournamentState>,
			required: true
		}
	},
	mounted() {
		this.timer = setInterval(() => {
			this.now = new Date();
		}, 1000);
	},
	beforeUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	},
	components: { DZDisclaimer }
});
</script>

<style scoped lang="scss"></style>

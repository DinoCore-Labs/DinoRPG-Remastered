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
	<DZDisclaimer
		v-if="state.round === 8"
		round
		:content="$t(`dojo.timer.nextQualif`, calculateTimeRemaining(state.nextScheduledMatch))"
	/>
	<DZDisclaimer
		v-else
		round
		:content="$t(`dojo.timer.${state.phase}`, calculateTimeRemaining(state.nextScheduledMatch))"
	/>
	<DZDisclaimer round :content="$t(`dojo.timer.cashPrice`, { cashPrice: beautifulNumber(state.cashPrice) })" />
	<DZDisclaimer v-if="!tournamentTeam && tournamentState" round help :content="$t(`dojo.timer.noTeam`)" />
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
			beautifulNumber
		};
	},
	computed: {
		tournamentTeam() {
			if (!dojoStore().TournamentTeam) {
				return;
			}
			return dojoStore().TournamentTeam;
		},
		tournamentState() {
			if (!dojoStore().getState) {
				return;
			}
			return dojoStore().getState;
		}
	},
	props: {
		state: {
			type: Object as PropType<TournamentState>,
			required: true
		}
	},
	methods: {
		calculateTimeRemaining(targetDate: Date): { day: number; hours: number; minutes: number } {
			const now = new Date();
			const targetedDate = new Date(targetDate);
			const difference = targetedDate.getTime() - now.getTime();

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
	components: { DZDisclaimer }
});
</script>

<style scoped lang="scss"></style>

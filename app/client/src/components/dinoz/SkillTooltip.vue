<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/dinoz/SkillTooltip.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-02-09.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<Tippy theme="normal">
		<slot />
		<template #content>
			<h1 v-html="formatContent($t(`skill.name.${skillList[skill.id].name}`))" />
			<p v-html="formatContent($t(`skill.description.${skillList[skill.id].name}`))" />
			<hr v-if="skillList[skill.id].type === SkillType.A || skillList[skill.id].type === SkillType.E" />
			<div class="stats" v-if="skillList[skill.id].type === SkillType.A || skillList[skill.id].type === SkillType.E">
				<p v-html="formatContent($t(`skill.energy`, { energy: skill.energy }))" />
				<p
					v-if="skill.priority !== undefined && skill.priority !== null"
					v-html="formatContent($t(`skill.priority`, { priority: skill.priority }))"
				/>
				<p
					v-if="skill.probability !== undefined && skill.probability !== null"
					v-html="formatContent($t(`skill.probability`, { probability: skill.probability }))"
				/>
			</div>
		</template>
	</Tippy>
</template>

<script setup lang="ts">
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { SkillType } from '@dinorpg/core/models/enums/SkillType.js';
import { computed } from 'vue';
import { Tippy } from 'vue-tippy';

const props = defineProps<{
	skill: Skill;
}>();

const skill = computed(() => skillList[props.skill]);
</script>

<style scoped>
hr {
	border: 1px solid #fff;
	margin-top: 7px;
	margin-bottom: 7px;
	width: 90%;
}
.stats {
	display: flex;
	flex-wrap: wrap;
	& p {
		font-size: 8.5pt !important;
	}
}
</style>

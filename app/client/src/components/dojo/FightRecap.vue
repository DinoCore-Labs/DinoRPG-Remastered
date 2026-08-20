<template>
	<DZTable class="small-icons">
		<tr>
			<th></th>
			<th>{{ $t('dojo.fightRecap.myTeam') }}</th>
			<th>{{ $t('dojo.fightRecap.enemyTeam') }}</th>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.hpRemaining'))" />
			<td>{{ Math.round((stats.attack.endingHp / stats.attack.startingHp) * 100 * 100) / 100 }}%</td>
			<td>{{ Math.round((stats.defense.endingHp / stats.defense.startingHp) * 100 * 100) / 100 }}%</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.hpLost'))" />
			<td>{{ stats.attack.hpLost }}</td>
			<td>{{ stats.defense.hpLost }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.hpHealed'))" />
			<td>{{ stats.attack.hpHealed }}</td>
			<td>{{ stats.defense.hpHealed }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.attacks'))" />
			<td>{{ stats.attack.attacks }}</td>
			<td>{{ stats.defense.attacks }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.multiHit'))" />
			<td>{{ stats.attack.multiHits }}</td>
			<td>{{ stats.defense.multiHits }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.assaults'))" />
			<td>{{ stats.attack.assaults }}</td>
			<td>{{ stats.defense.assaults }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.evasions'))" />
			<td>{{ stats.attack.evasions }}</td>
			<td>{{ stats.defense.evasions }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.counters'))" />
			<td>{{ stats.attack.counters }}</td>
			<td>{{ stats.defense.counters }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.criticalHits'))" />
			<td>{{ stats.attack.criticalHits }}</td>
			<td>{{ stats.defense.criticalHits }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.poisoned'))" />
			<td>{{ stats.attack.poisoned }}</td>
			<td>{{ stats.defense.poisoned }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.times_poisoned'))" />
			<td>{{ stats.attack.times_poisoned }}</td>
			<td>{{ stats.defense.times_poisoned }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.poison_damage'))" />
			<td>{{ stats.attack.poison_damage }}</td>
			<td>{{ stats.defense.poison_damage }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.burn_damage'))" />
			<td>{{ stats.attack.burn_damage }}</td>
			<td>{{ stats.defense.burn_damage }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.reinforcements'))" />
			<td>{{ stats.attack.reinforcements }}</td>
			<td>{{ stats.defense.reinforcements }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.petrified'))" />
			<td>{{ stats.attack.petrified }}</td>
			<td>{{ stats.defense.petrified }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.damageFire'))" />
			<td>{{ stats.attack.elements['1'].damage_dealt }}</td>
			<td>{{ stats.defense.elements['1'].damage_dealt }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.assaultFire'))" />
			<td>{{ stats.attack.elements['1'].attacks }}</td>
			<td>{{ stats.defense.elements['1'].attacks }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.damageWood'))" />
			<td>{{ stats.attack.elements['2'].damage_dealt }}</td>
			<td>{{ stats.defense.elements['2'].damage_dealt }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.assaultWood'))" />
			<td>{{ stats.attack.elements['2'].attacks }}</td>
			<td>{{ stats.defense.elements['2'].attacks }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.damageWater'))" />
			<td>{{ stats.attack.elements['3'].damage_dealt }}</td>
			<td>{{ stats.defense.elements['3'].damage_dealt }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.assaultWater'))" />
			<td>{{ stats.attack.elements['3'].attacks }}</td>
			<td>{{ stats.defense.elements['3'].attacks }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.damageLightning'))" />
			<td>{{ stats.attack.elements['4'].damage_dealt }}</td>
			<td>{{ stats.defense.elements['4'].damage_dealt }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.assaultLightning'))" />
			<td>{{ stats.attack.elements['4'].attacks }}</td>
			<td>{{ stats.defense.elements['4'].attacks }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.damageAir'))" />
			<td>{{ stats.attack.elements['5'].damage_dealt }}</td>
			<td>{{ stats.defense.elements['5'].damage_dealt }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.assaultAir'))" />
			<td>{{ stats.attack.elements['5'].attacks }}</td>
			<td>{{ stats.defense.elements['5'].attacks }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.damageVoid'))" />
			<td>{{ stats.attack.elements['6'].damage_dealt }}</td>
			<td>{{ stats.defense.elements['6'].damage_dealt }}</td>
		</tr>
		<tr>
			<td v-html="formatContent($t('dojo.fightRecap.assaultVoid'))" />
			<td>{{ stats.attack.elements['6'].attacks }}</td>
			<td>{{ stats.defense.elements['6'].attacks }}</td>
		</tr>
	</DZTable>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import DZTable from '../utils/DZTable.vue';
import type { FullFightStats } from '@dinorpg/core/models/fight/FightResult.js';

export default defineComponent({
	name: 'FightRecap',
	props: {
		stats: {
			type: Object as PropType<FullFightStats>,
			required: true
		}
	},
	components: { DZTable }
});
</script>

<style scoped lang="scss">
.small-icons {
	:deep(tr) {
		cursor: default !important;
	}
	:deep(img) {
		width: 7px;
	}
}
</style>

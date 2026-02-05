<template>
	<div class="details">
		<!--<DZSelect
			v-if="playerStore.playerOptions.hasPAC && ownBuilds.length"
			id="build-select"
			:options="ownBuilds.map(build => ({ label: build.name, value: build.id }))"
			:placeholder="$t('skillTrees.build')"
			v-model="dinozBuild"
			@change="changeDinozBuild"
			class="build-select"
		/>
		<p
			v-if="playerStore.playerOptions.hasPAC"
			class="wrapperMenu"
			@click="goTo($router, 'DinozSkills', { params: { id: dinozStore.currentDinozId } })"
		>
			{{ $t('skillTrees.title') }}
		</p>-->
		<p class="wrapperMenu" @click="hidden = !hidden">
			{{ $t('dinozPage.details.sort.title') }}
		</p>
		<div ref="butt" class="wrapper" :class="hidden ? 'hidden' : 'shown'">
			<div class="label">
				<DZSelect class="sort-select" id="sort" v-model="selectedSort" :options="sortOptions" @change="sort()" />
			</div>
			<div class="label">
				<DZRadio id="asc" :label="$t('details.asc')" value="asc" v-model="picked" @change="reverse()" />
				<DZRadio id="desc" :label="$t('details.desc')" value="desc" v-model="picked" @change="reverse()" />
			</div>
		</div>
		<DZTable>
			<tr>
				<th class="name">{{ $t('dinozPage.details.th.comp') }}</th>
				<th class="type">{{ $t('dinozPage.details.th.type') }}</th>
				<th class="state" v-if="hasAmulst()">
					{{ $t('dinozPage.details.th.active') }}
				</th>
			</tr>
			<tr
				v-for="skill in dinozSkill as SkillDetails[]"
				:key="skill.id"
				:class="skill.state === false ? 'disabled' : ''"
			>
				<td class="name">
					<SkillTooltip :skill="skill.id">
						<img
							v-for="(element, index) in skill.element"
							:key="index"
							:src="getImgURL('elements', `elem_${elementKey(element)}`)"
							:alt="elementLabel(element)"
						/>
						<p>{{ $t(`skill.name.${skillList[skill.id].name}`) }}</p>
					</SkillTooltip>
				</td>
				<td class="type">
					<Tippy theme="normal">
						{{ skill.type }}
						<template #content>
							<h1 v-html="formatContent($t(`details.type.name.${skill.type}`))" />
							<p v-html="formatContent($t(`details.type.description.${skill.type}`))" />
						</template>
					</Tippy>
				</td>
				<template v-if="hasAmulst()">
					<td class="state">
						<img
							:src="getImgURL('icons', `small_skill_${skill.state}`)"
							:alt="skill.state ? 'active' : 'inactive'"
							v-if="skill.activatable"
							@click="changeState(skill)"
							v-tippy="{
								content: formatContent($t(`dinozPage.details.activate.${skill.state}`)),
								theme: 'small'
							}"
						/>
						<img
							v-else
							src="../../assets/icons/small_skill_inactive.webp"
							v-tippy="{
								content: formatContent($t(`dinozPage.details.activate.locked`)),
								theme: 'small'
							}"
						/>
					</td>
				</template>
			</tr>
		</DZTable>
		<p class="title">
			{{ $t('dinozPage.details.statistics') }}
		</p>
		<div class="stats">
			<p class="subtitle">
				<span>{{ $t('dinozPage.details.assaults') }}</span>
				<Tippy tag="img" :src="getImgURL('icons', `help${getLanguage()}`)" theme="normal" class="help">
					<template #content>
						<h1 v-html="$t('dinozPage.details.assaults')" />
						<p v-html="''" />
					</template>
				</Tippy>
			</p>
			<ul class="stat-values">
				<Tippy tag="li" v-for="stat in assaultStats" :key="stat.name" theme="normal">
					<img :src="getImgURL('elements', `elem_${stat.name}`)" :alt="stat.name" />
					<span>{{ stat.value }}</span>
					<template #content>
						<h1 v-html="formatContent($t(`details.${stat.name}Assault`))" />
						<ul class="stat-details">
							<li v-for="(detail, i) in stat.details" :key="i">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<span v-if="detail.type === 'element'">{{ detail.value }}</span>
								<span v-if="detail.type === 'element'" class="detail-name"
									>x 5 ({{ $t('dinozPage.details.baseElementContribution') }})</span
								>
								<span v-if="detail.type !== 'element'">+{{ detail.value }}</span>
								<span v-if="detail.type === 'skill'" class="detail-name">
									<span>{{ $t(`skill.name.${detail.name}`) }}</span>
									<img
										v-for="element in detail.elements"
										:key="element"
										:src="getImgURL('elements', `elem_${element}`)"
										alt="info_button"
									/>
								</span>
								<span v-if="detail.type === 'status'" class="detail-name">
									<img
										:src="getImgURL('status', `fx_${getStatusImgName(detail.name)}`)"
										:alt="$t(`status.name.${detail.name}`)"
									/>
									<span>{{ $t(`status.name.${detail.name}`) }}</span>
								</span>
							</li>
						</ul>
					</template>
				</Tippy>
			</ul>
		</div>
		<div class="stats">
			<p class="subtitle">
				<span>{{ $t('dinozPage.details.defenses') }}</span>
				<Tippy tag="img" :src="getImgURL('icons', `help${getLanguage()}`)" theme="normal" class="help">
					<template #content>
						<h1 v-html="$t('dinozPage.details.defenses')" />
						<p v-html="''" />
					</template>
				</Tippy>
			</p>
			<ul class="stat-values">
				<Tippy tag="li" v-for="stat in defenseStats" :key="stat.name" theme="normal">
					<img :src="getImgURL('elements', `elem_${stat.name}`)" :alt="stat.name" />
					<span>{{ stat.value }}</span>
					<template #content>
						<h1 v-html="formatContent($t(`dinozPage.details.${stat.name}Defense`))" />
						<ul class="stat-details">
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.weak2?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.weak2?.value }}</span>
								<span class="detail-name"> x 0.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.weak1?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.weak1?.value }}</span>
								<span class="detail-name"> x 0.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.element?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.element?.value }}</span>
								<span class="detail-name"> x 1</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.strong1?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.strong1?.value }}</span>
								<span class="detail-name"> x 1.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.strong2?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.strong2?.value }}</span>
								<span class="detail-name"> x 1.5</span>
							</li>
							<li v-for="(detail, i) in stat.details" :key="i">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<span v-if="detail.type === 'element'">{{ detail.value }}</span>
								<img
									v-if="detail.type === 'element'"
									:src="getImgURL('elements', `elem_${detail.elements[0]}`)"
									alt="info_button"
									class="ml-4"
								/>
								<span v-if="detail.type === 'skill' || detail.type === 'status'"
									>{{ detail.value < 0 ? '-' : '+' }}{{ Math.abs(detail.value) }}</span
								>
								<span v-if="detail.type !== 'element' && detail.global" class="detail-name">
									{{ 'x ' }}
									<span v-if="detail.element === stat.weak1?.name || detail.element === stat.weak2?.name"> 0.5</span>
									<span v-else-if="detail.element === stat.element?.name">1</span>
									<span v-else>1.5</span>
									{{ ' - ' }}
								</span>
								<span v-if="detail.type === 'skill'" class="detail-name">
									<span>{{ $t(`skill.name.${detail.name}`) }}</span>
									<img
										v-for="element in detail.elements"
										:key="element"
										:src="getImgURL('elements', `elem_${element}`)"
										alt="info_button"
									/>
								</span>
								<span v-if="detail.type === 'status'" class="detail-name">
									<img
										:src="getImgURL('status', `fx_${getStatusImgName(detail.name)}`)"
										:alt="$t(`status.name.${detail.name}`)"
									/>
									<span>{{ $t(`status.name.${detail.name}`) }}</span>
								</span>
							</li>
						</ul>
					</template>
				</Tippy>
			</ul>
		</div>
		<div class="stats">
			<p class="subtitle">
				<span>{{ $t('dinozPage.details.specials') }}</span>
			</p>
			<ul class="stat-values">
				<Tippy v-for="stat in specialStats" :key="stat.name" tag="li" theme="normal">
					<img :src="getImgURL('specialStats', stat.name)" :alt="stat.name" />
					<span>
						{{ stat.percent ? Math.round((stat.value - 1) * 100) : stat.value }}{{ stat.percent ? '%' : '' }}
					</span>
					<template #content>
						<h1 v-html="formatContent($t(`details.${stat.name}`))" />
						<ul class="stat-details">
							<li v-if="stat.name === SpecialStat.BUBBLE_RATE">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<span>
									<span />
									<img :src="getImgURL('elements', 'elem_water')" />
									<img :src="getImgURL('elements', 'elem_air')" />
									/
									<img :src="getImgURL('elements', 'elem_water')" />
									<img :src="getImgURL('elements', 'elem_air')" />
									<img :src="getImgURL('elements', 'elem_wood')" />
									<img :src="getImgURL('elements', 'elem_fire')" />
									<img :src="getImgURL('elements', 'elem_lightning')" />
								</span>
							</li>
							<li v-for="(detail, i) in stat.details" :key="i">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<span v-if="detail.type === 'base'">
									{{ detail.value }}{{ detail.percent ? '%' : '' }}
									<span class="detail-name">
										{{ stat.name === SpecialStat.ACID_BLOOD_DAMAGE ? '/ 2' : '' }} ({{
											$t('dinozPage.details.baseValue')
										}})
									</span>
								</span>
								<span v-else>
									{{ detail.multiplier ? 'x' : detail.value < 0 ? '-' : '+' }}
									{{ Math.abs(detail.value) }} {{ detail.percent ? '%' : '' }}
								</span>
								<span v-if="detail.type === 'skill'" class="detail-name">
									<span>{{ $t(`skill.name.${detail.name}`) }}</span>
									<img
										v-for="element in detail.elements"
										:key="element"
										:src="getImgURL('elements', `elem_${element}`)"
										alt="info_button"
									/>
								</span>
								<span v-if="detail.type === 'status'" class="detail-name">
									<img
										:src="getImgURL('status', `fx_$${getStatusImgName(detail.name)}`)"
										:alt="$t(`status.name.${detail.name}`)"
									/>
									<span>{{ $t(`status.name.${detail.name}`) }}</span>
								</span>
								<span v-if="detail.type === 'item'" class="detail-name">
									<img :src="getImgURL('item', `item_${detail.name}`)" :alt="$t(`item.name.${detail.name}`)" />
									<span>{{ $t(`item.name.${detail.name}`) }}</span>
								</span>
							</li>
						</ul>
					</template>
				</Tippy>
			</ul>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent, type PropType } from 'vue';
import { statusList } from '../../constants/status.js';
import type { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { DinozService } from '../../services/dinoz.service.js';
import { errorHandler } from '../../utils/errorHandler.js';
//import eventBus from '../../events/index.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { AssaultElement, getAssaultStat } from '@dinorpg/core/models/skills/getAssaultStats.js';
import { DefenseElement, getDefenseStat } from '@dinorpg/core/models/skills/getDefenseStats.js';
//import { SpecialStat, getSpecialStat } from '@drpg/core/utils/getSpecialStat';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { dinozStore } from '../../store/dinozStore.js';
import { userStore } from '../../store/userStore.js';
import SkillTooltip from '../dinoz/SkillTooltip.vue';
import { goTo } from '../../utils/goTo.js';
import { toSkillDetails } from '@dinorpg/core/models/skills/toSkillDetails.js';
import DZSelect from '../utils/DZSelect.vue';
import DZTable from '../utils/DZTable.vue';
import DZRadio from '../utils/DZRadio.vue';
//import { TIME_BASE } from '@drpg/core/utils/fightConstants';

//import { GetOwnDinozBuildResponse } from '@drpg/core/returnTypes/DinozBuild';
//import { DinozBuildService } from '../../services/DinozBuildService.js';
//import { DinozBuild } from '@drpg/prisma';

export default defineComponent({
	name: 'DetailsTab',
	props: { dinozData: { type: Object as PropType<DinozFiche>, required: true } },
	components: {
		SkillTooltip,
		DZSelect,
		DZTable,
		DZRadio
	},
	data() {
		return {
			dinozStore: dinozStore(),
			dinozSkill: [] as Array<SkillDetails>,
			skillList,
			statusList,
			selectedSort: 'Default' as string,
			picked: 'Ascendant' as string,
			hidden: true as boolean,
			ElementType,
			AssaultElement,
			getAssaultStat,
			assaultStats: [] as ReturnType<typeof getAssaultStat>[],
			DefenseElement: DefenseElement,
			getDefenseStat,
			defenseStats: [] as ReturnType<typeof getDefenseStat>[],
			//SpecialStat: SpecialStat,
			//getSpecialStat,
			//specialStats: [] as NonNullable<ReturnType<typeof getSpecialStat>>[],
			userStore: userStore(),
			goTo,
			sortOptions: [
				{ label: this.$t('dinozPage.details.sort.default'), value: 'Default' },
				{ label: this.$t('dinozPage.details.sort.energy'), value: 'Energy' },
				{ label: this.$t('dinozPage.details.sort.type'), value: 'Type' },
				{ label: this.$t('dinozPage.details.sort.state'), value: 'State' }
			]
			//ownBuilds: [] as GetOwnDinozBuildResponse,
			//dinozBuild: undefined as DinozBuild['id'] | undefined
		};
	},
	methods: {
		async changeState(skill: SkillDetails): Promise<void> {
			const dinozId = this.$route.params.id as string;

			try {
				await DinozService.setSkillState(parseInt(dinozId), skill.id, !skill.state);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}

			skill.state = !skill.state;
		},
		hasAmulst(): boolean {
			return this.dinozData?.status.some(s => s.statusId === statusList.id.amulst) ?? false;
		},
		sort(): void {
			switch (this.selectedSort) {
				case 'Default':
					this.dinozSkill = this.dinozSkill.sort((a: SkillDetails, b: SkillDetails) =>
						a.id > b.id ? 1 : b.id > a.id ? -1 : 0
					);
					break;
				case 'Type':
					this.dinozSkill = this.dinozSkill.sort((a: SkillDetails, b: SkillDetails) =>
						a.type > b.type ? 1 : b.type > a.type ? -1 : 0
					);
					break;
				case 'Energy':
					this.dinozSkill = this.dinozSkill.sort((a: SkillDetails, b: SkillDetails) =>
						a.energy > b.energy ? 1 : b.energy > a.energy ? -1 : 0
					);
					break;
				case 'State':
					this.dinozSkill = this.dinozSkill.sort((a: SkillDetails, b: SkillDetails) =>
						!!a.state > !!b.state ? 1 : !!b.state > !!a.state ? -1 : 0
					);
					break;
				default:
					break;
			}
		},
		reverse(): void {
			this.dinozSkill = this.dinozSkill.reverse();
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		},
		elementKey(element: ElementType): string {
			return ElementType[element].toLowerCase();
		},
		elementLabel(element: ElementType): string {
			return ElementType[element];
		},
		getStatusImgName(idLike: string | number | null | undefined): string {
			const id = Number(idLike ?? 0);
			// On force le type de clé attendu par imgName
			const key = id as keyof typeof statusList.imgName;
			return statusList.imgName[key] ?? 'unknown';
		},
		/*refreshStats() {
			// Get stats
			this.assaultStats = Object.values(AssaultElement).map(stat =>
				getAssaultStat(
					this.dinozData,
					this.dinozData.status.map(s => s.statusId),
					this.dinozSkill,
					stat as AssaultElement
				)
			);

			this.defenseStats = Object.values(DefenseElement).map(stat =>
				getDefenseStat(
					this.dinozData,
					this.dinozData.status.map(s => s.statusId),
					this.dinozSkill,
					stat as DefenseElement
				)
			);

			const priest = this.playerStore.isPriest;

			// Find global speed value to compute it with elemental speed
			const global_speed_special = getSpecialStat(
				this.dinozData,
				this.dinozData.status.map(s => s.statusId),
				this.dinozSkill,
				SpecialStat.SPEED,
				priest
			);

			// Find global critical value
			const global_critical_hit = getSpecialStat(
				this.dinozData,
				this.dinozData.status.map(s => s.statusId),
				this.dinozSkill,
				SpecialStat.CRITICAL_HIT_CHANCE,
				priest
			);

			let global_speed = 1;
			if (global_speed_special) {
				global_speed = global_speed_special.value;
			}

			this.specialStats = Object.values(SpecialStat)
				.map(stat => {
					let special = getSpecialStat(
						this.dinozData,
						this.dinozData.status.map(s => s.statusId),
						this.dinozSkill,
						stat as SpecialStat,
						priest
					);

					// Add +1 to bubble for proper display
					if (special && special.name.includes('bubble')) {
						special.value += 1;
					}

					// Transform speed into the duration of a turn
					if (special && special.name.toLowerCase().includes('speed')) {
						special.percent = false;
						// Specific handling for elemental speed
						if (!special.name.startsWith('speed')) {
							if (special.value === 1) {
								// Hide element speeds if they are only at the base value
								special = null;
							} else {
								// Multiply by global speed
								special.value = Math.round(100 * TIME_BASE * special.value * global_speed) / 100;
								// Set base as global speed
								if (special.details) {
									special.details.map(detail => {
										detail.percent = false;
										if (detail.type === 'base') {
											detail.value = Math.round(global_speed * TIME_BASE * 100) / 100;
										}
										return detail;
									});
								}
							}
						} else {
							special.value = Math.round(TIME_BASE * special.value * 100) / 100;
							if (special.details) {
								special.details.map(detail => {
									detail.percent = false;
									if (detail.type === 'base') {
										detail.value = TIME_BASE;
									}
									return detail;
								});
							}
						}
					}

					// Filter out other special stats that are at default value
					if (special && !special.name.startsWith('speed') && special.value === 100) {
						special = null;
					}

					// Filter out critical hit damage if critical hit chance is default (0%)
					if (
						special &&
						special.name.startsWith('criticalHitDamage') &&
						global_critical_hit &&
						global_critical_hit.value === 1
					) {
						special = null;
					}

					// Filter out stats with no details, with some exceptions
					if (
						special &&
						((special.details && special.details.length > 0) || special.name === SpecialStat.BUBBLE_RATE)
					) {
						return special;
					} else {
						return null;
					}
				})
				.filter(Boolean) as NonNullable<ReturnType<typeof getSpecialStat>>[];
		}*/ async loadComponent(): Promise<void> {
			try {
				this.dinozSkill = toSkillDetails(this.dinozData.skills);
				this.sort();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}

			/*if (this.playerStore.playerOptions.hasPAC) {
				try {
					this.ownBuilds = await DinozBuildService.getOwn();

					this.dinozBuild = this.dinozData.build?.id;
				} catch (err) {
					errorHandler.handle(err, this.$toast);
				}
			}*/

			//this.refreshStats();

			// Refresh special stats on EventBus `refreshDinozStats`
			/*EventBus.on('refreshDinozStats', () => {
				this.refreshStats();
			});*/
		} /*,
		async changeDinozBuild() {
			if (!this.dinozBuild || !this.dinozStore.currentDinozId) {
				return;
			}

			try {
				await DinozService.assignBuild(this.dinozStore.currentDinozId, this.dinozBuild);
				const currentDinoz = this.dinozStore.getDinoz(this.dinozStore.currentDinozId);

				if (!currentDinoz) {
					throw new Error('Dinoz not found in store after assigning build');
				}

				const build = this.ownBuilds.find(b => b.id === this.dinozBuild);

				this.dinozStore.setDinoz({
					...currentDinoz,
					build
				});

				this.$toast.success(this.$t('toast.buildAssigned', { name: build?.name ?? '' }).toString());
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}*/
	},
	async mounted(): Promise<void> {
		await this.loadComponent();
	},
	watch: {
		'$route.params.id': 'loadComponent',
		dinozData() {
			this.loadComponent();
		}
	} /*,
	unmounted() {
		EventBus.off('refreshDinozStats');
	}*/
});
</script>

<style lang="scss" scoped>
.wrapperMenu {
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	border: 1px dashed rgba(0, 0, 0, 0.1);
	text-align: center;
	cursor: pointer;
	&:hover {
		background-color: #9a4029;
		color: #fce3bc;
	}
}
.hidden {
	max-height: 0;
}
.shown {
	max-height: 54px;
}
.wrapper {
	overflow: hidden;
	transition: max-height 0.2s ease-out;
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	select {
		margin-bottom: 5px;
	}
	.label {
		display: flex;
		justify-content: space-around;

		label[for] {
			cursor: pointer;
		}
	}
	.sort-select {
		width: 100%;
		margin-bottom: 8px;
	}
	&.shown {
		overflow: visible;
	}
}
.details {
	margin: 5px;
	table {
		margin-bottom: 10px;
		border: 2px solid #bc683c;
		:deep(tr) {
			th {
				max-width: 222px;
				&.name {
					width: 200px;
				}
				&.type {
					max-width: 26px;
				}
				&.state {
					max-width: 38px;
				}
			}
			td {
				&.name {
					background-image: url('../../assets/background/table_cell.webp');
					background-position: 0px 0px;
					padding-left: 15px;
					max-width: 222px;
					img {
						float: left;
						position: relative;
						margin-top: 8px;
						margin-right: 5px;
						vertical-align: bottom;
					}
				}
				&.type {
					font-weight: bold;
					text-align: center;
					color: #bc683c;
					background-image: url('../../assets/background/table_cell.webp');
					background-position: -10px 0px;
					max-width: 4px;
				}
				&.state {
					vertical-align: top;
					max-width: 40px;
					img {
						float: left;
						position: relative;
						left: 17px;
						top: 5px;
						cursor: help;
					}
					background-image: url('../../assets/background/table_cell.webp');
					background-position: -10px 0px;
				}
			}
		}
		.disabled {
			td {
				opacity: 0.4;
				&.state {
					background-color: red;
					background-image: none;
					opacity: 1;
				}
			}
		}
	}
	.title {
		color: #f8efa4;
		background-color: #bc683c;
		padding: 4px 8px;
		font-variant: small-caps;
		margin-bottom: 4px;
	}
	.stats {
		border: 1px solid #f8efa4;
		border-radius: 10px;
		padding: 2px 0;
		margin-bottom: 6px;
		.subtitle {
			display: flex;
			align-items: center;
			color: #f8efa4;
			font-variant: small-caps;
			border-bottom: 1px solid #f8efa4;
			font-size: 9pt;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 2px;
			.help {
				border: 1px solid #bc683c;
				cursor: help;
				margin-left: 5px;
				&:hover {
					outline: 1px solid white;
				}
			}
		}
		.stat-values {
			list-style-type: none;
			padding: 4px 8px;
			padding-bottom: 0;
			li {
				position: relative;
				display: inline-flex;
				align-items: center;
				justify-content: space-around;
				min-width: 42px;
				font-size: 10pt;
				font-weight: bold;
				color: white;
				letter-spacing: -0.2pt;
				z-index: 2;
				padding-right: 4px;
				&:not(:last-child) {
					margin-right: 2px;
				}
				&::before {
					content: '';
					position: absolute;
					width: 80%;
					height: 13px;
					background-color: #90452c;
					left: 20%;
					top: 5px;
					border-radius: 10px;
					z-index: -1;
				}
				& > img {
					width: 22px;
				}
				span {
					margin-left: 2px;
				}
			}
		}
	}
}
.stat-details {
	list-style-type: none;
	color: white;
	font-size: 9pt;
	li {
		display: flex;
		align-items: center;
		& > img {
			margin-right: 4px;
			&:first-child {
				width: 7px;
				margin-left: 8px;
			}
		}
		.detail-name {
			color: #fdf1c4;
			font-style: italic;
			margin-left: 2px;
			img {
				margin: 0 2px;
			}
		}
	}
}
.ml-4 {
	margin-left: 4px;
}
.build-select {
	width: 100%;
}
</style>

<template>
	<TitleHeader
		v-if="availableSkills"
		:title="`${$t('pageTitle.levelup', { dinoz: availableSkills.name })}`"
		:header="$t(`levelup.title`, { name: availableSkills.name })"
	></TitleHeader>
	<div class="levelUp">
		<DZDisclaimer
			content="levelup.disclaimer"
			:params="{ name: availableSkills?.name, level: (availableSkills?.level ?? 0) + 1 }"
		/>
		<div class="wrapper border" v-if="availableSkills">
			<LevelUpGrid
				v-if="availableSkills.upChance && availableSkills.element"
				:grid="availableSkills.upChance"
				:element="availableSkills.element"
				@spinOver="spinOver"
			/>
			<div class="dinozWrapper">
				<Suspense>
					<DinozAnimation
						:style="{
							position: `relative`,
							top: `45px`
						}"
						:display="availableSkills.display"
						:life="1"
					/>
					<template #fallback><Loading /></template>
				</Suspense>
			</div>
		</div>
		<div class="slide-bottom" :class="isSpinOver ? '' : 'hidden'" v-if="availableSkills">
			<div class="result" v-if="ElementType[availableSkills.element]">
				{{ availableSkills.name }}
				<p v-html="formatContent($t(`levelup.${ElementType[availableSkills.element].toLowerCase()}`))" />
				<Elements
					:fire="
						ElementType[availableSkills.element] === 'fire' ? availableSkills.nbrUpFire + 1 : availableSkills.nbrUpFire
					"
					:wood="
						ElementType[availableSkills.element] === 'wood' ? availableSkills.nbrUpWood + 1 : availableSkills.nbrUpWood
					"
					:water="
						ElementType[availableSkills.element] === 'water'
							? availableSkills.nbrUpWater + 1
							: availableSkills.nbrUpWater
					"
					:lightning="
						ElementType[availableSkills.element] === 'lightning'
							? availableSkills.nbrUpLightning + 1
							: availableSkills.nbrUpLightning
					"
					:air="
						ElementType[availableSkills.element] === 'air' ? availableSkills.nbrUpAir + 1 : availableSkills.nbrUpAir
					"
					class="elements"
				/>
				{{ $t(`levelup.helper`) }}
			</div>
			<a
				class="button"
				v-if="availableSkills.canRelaunch"
				@click="retry()"
				v-tippy="{
					content: formatContent($t('levelup.pdc')),
					theme: 'small'
				}"
			>
				{{ $t(`skill.name.PlanDeCarriere`) }}
			</a>
			<div class="select">
				<table>
					<tbody>
						<tr>
							<th class="name">{{ $t('details.th.comp') }}</th>
							<th class="type">{{ $t('details.th.type') }}</th>
							<th class="type">{{ $t('levelup.level') }}</th>
							<th class="type"></th>
						</tr>
						<tr
							v-for="skill in availableSkills.learnableSkills"
							:key="skill.skillId"
							:class="{ 'in-build': dinoz?.build?.skills.some(bs => bs === skill.skillId) }"
						>
							<Tippy
								theme="normal"
								tag="td"
								class="name"
								v-if="skillList[skill.skillId].type === SkillType.A || skillList[skill.skillId].type === SkillType.E"
							>
								<div>
									<div class="skillName">
										<img
											v-for="element in skill.element"
											:key="element"
											:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
											alt="elementUp"
										/>
										<p>{{ $t(`skill.name.${skillList[skill.skillId].name}`) }}</p>
									</div>
									<p class="desc" v-html="formatContent($t(`skill.description.${skillList[skill.skillId].name}`))" />
								</div>
								<template #content>
									<h1>{{ $t('skill.properties') }}</h1>
									<div class="hidden-stats">
										<p
											class="desc"
											v-html="
												formatContent(
													$t(`skill.energy`, {
														energy: skillList[skill.skillId].energy
													})
												)
											"
										/>
										<p
											class="desc"
											v-if="
												skillList[skill.skillId].priority !== undefined && skillList[skill.skillId].priority !== null
											"
											v-html="
												formatContent(
													$t(`skill.priority`, {
														priority: skillList[skill.skillId].priority
													})
												)
											"
										/>
										<p
											class="desc"
											v-if="
												skillList[skill.skillId].probability !== undefined &&
												skillList[skill.skillId].probability !== null
											"
											v-html="
												formatContent(
													$t(`skill.probability`, {
														probability: skillList[skill.skillId].probability
													})
												)
											"
										/>
									</div>
								</template>
							</Tippy>
							<td
								class="name"
								v-if="skillList[skill.skillId].type !== SkillType.A && skillList[skill.skillId].type !== SkillType.E"
							>
								<div>
									<div class="skillName">
										<img
											v-for="element in skill.element"
											:key="element"
											:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
											alt="elementUp"
										/>
										<p>{{ $t(`skill.name.${skillList[skill.skillId].name}`) }}</p>
									</div>
									<p class="desc" v-html="formatContent($t(`skill.description.${skillList[skill.skillId].name}`))" />
								</div>
							</td>
							<Tippy theme="normal" tag="td" class="type">
								{{ skill.type }}
								<template #content>
									<h1 v-html="formatContent($t(`details.type.name.${skill.type}`))" />
									<p v-html="formatContent($t(`details.type.description.${skill.type}`))" />
								</template>
							</Tippy>
							<td class="type">
								{{ String(skill.skillId)[2] }}
							</td>
							<td class="learn">
								<DZButton @click="learnSkill(skill.skillId)" class="learnSkill">
									<img :src="getImgURL('icons', 'small_right')" alt="right" />
									{{ $t('levelup.learn') }}
								</DZButton>
							</td>
						</tr>
						<template v-if="availableSkills.unlockableSkills">
							<tr v-if="availableSkills.unlockableSkills.length > 0" @click="unlockSkill()">
								<td class="name unlockable" colspan="4">
									<div class="skillName">
										<img :src="getImgURL('icons', 'small_right')" alt="right" />
										{{ $t('levelup.unlockSkills', { count: availableSkills.unlockableSkills.length }) }}
										<Tippy tag="img" :src="getImgURL('icons', `help${getLanguage()}`)" theme="normal" class="help">
											<template #content>
												<h1 v-html="formatContent($t(`levelup.helperUnlock.title`))" />
												<p v-html="formatContent($t(`levelup.helperUnlock.description`))" />
											</template>
										</Tippy>
									</div>
									<ul class="unlock">
										<Tippy
											tag="li"
											theme="small"
											v-for="(skill, index) in (availableSkills as DinozSkillOwnAndUnlockable).unlockableSkills"
											:key="index"
										>
											<img
												v-for="element in skill.element"
												:key="element"
												:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
												alt="elementUp"
											/>
											{{ $t(`skill.name.${skillList[skill.skillId].name}`) }}
											<template #content>
												{{ $t(`levelup.unlock`) }}
											</template>
										</Tippy>
									</ul>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
			<!--<SkillTree
				v-if="userStore.playerOptions.hasPAC"
				:type="availableSkills.element"
				:dinoz="dinoz"
				:buildSkills="dinoz?.build?.skills"
			/>-->
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { LevelService } from '../services/level.service.js';
import { errorHandler } from '../utils/errorHandler.js';
import type { DinozSkillOwnAndUnlockable } from '@dinorpg/core/models/skills/dinozSkillOwnAndUnlockable.js';
import { dinozPlacement } from '../constants/dinozPlacement.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { userStore } from '../store/userStore.js';
import { dinozStore } from '../store/dinozStore.js';
//import LevelUpGrid from '../components/dinoz/LevelUpGrid.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import Elements from '../components/dinoz/Elements.vue';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { SkillType } from '@dinorpg/core/models/enums/SkillType.js';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
//import { FBService } from '../services/FBTournamentService.js';
import DZButton from '../components/utils/DZButton.vue';
//import SkillTree from '../components/dinoz/SkillTree.vue';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';

export default defineComponent({
	name: 'LevelUp',
	components: {
		DZDisclaimer,
		//LevelUpGrid,
		TitleHeader,
		Elements,
		DinozAnimation: defineAsyncComponent(() => import('../components/dinoz/DinozAnimation.vue')),
		DZButton
		//SkillTree
	},
	data() {
		return {
			dinozStore: dinozStore(),
			userStore: userStore(),
			availableSkills: null as DinozSkillOwnAndUnlockable | null,
			tryNumber: 1 as number,
			skillList,
			SkillType,
			ElementType: ElementType,
			isSpinOver: false as boolean,
			position: dinozPlacement,
			dinoz: undefined as DinozFiche | undefined
		};
	},
	props: {
		id: { type: String, required: true },
		event: {
			type: String,
			required: false,
			default: null
		},
		eventId: {
			type: String,
			required: false,
			default: null
		}
	},
	methods: {
		spinOver(): void {
			this.isSpinOver = true;
		},
		async learnSkill(skillId: number): Promise<void> {
			try {
				const prompt = await this.$confirm({
					message: this.$t('levelup.confirmSkill', {
						skill: this.$t(`skill.name.${skillList[skillId as Skill].name}`),
						level: (this.availableSkills?.level ?? 0) + 1
					}),
					header: this.$t('popup.attention'),
					acceptLabel: this.$t('popup.accept'),
					rejectLabel: this.$t('popup.reject'),
					icon: 'pi pi-trash'
				});
				if (prompt) {
					const skillIdList: Array<number> = [skillId];

					await this.learnSkillAndSetStore(skillIdList);
				}
			} catch (error) {
				//Do nothing
			}
		},
		unlockSkill(): void {
			/*if (!this.availableSkills) {
				return;
			}
			if (confirm(this.$t('levelup.confirmUnlock', { quantity: this.availableSkills.unlockableSkills?.length }))) {
				if (!this.availableSkills.unlockableSkills) {
					return;
				}
				const skillIdList: Array<number> = this.availableSkills.unlockableSkills.map(skill => skill.skillId);

				this.learnSkillAndSetStore(skillIdList);
			}*/
		},
		async learnSkillAndSetStore(skillIdList: Array<number>): Promise<void> {
			const dinozId: number = +this.id;

			try {
				//if (!this.event) {
				/*const { discoveredSkill } = */ await LevelService.learnSkill(dinozId, skillIdList, this.tryNumber);

				/*if (discoveredSkill) {
						this.userStore.setDiscoveredSkills(this.userStore.getDiscoveredSkills.concat(discoveredSkill));
					}*/

				this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
				/*} else {
					const { discoveredSkill } = await FBService.learnSkill(dinozId, skillIdList, this.tryNumber, this.event);

					if (discoveredSkill) {
						this.userStore.setDiscoveredSkills(this.userStore.getDiscoveredSkills.concat(discoveredSkill));
					}

					this.$router.push({ name: 'FBTournament', query: { id: this.eventId } });
				}*/
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		retry(): void {
			this.isSpinOver = false;
			//this.availableSkills = null;
			this.tryNumber = this.tryNumber === 1 ? 2 : 1;
			this.getLearnableSkills(+this.id, this.tryNumber);
		},
		async getLearnableSkills(dinozId: number, tryNumber: number): Promise<void> {
			try {
				/*if (this.event) {
					this.availableSkills = await FBService.levelUp(dinozId, tryNumber, this.event);
				} else {*/
				this.availableSkills = await LevelService.levelUp(dinozId, tryNumber.toString());
				//}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		}
	},
	async created(): Promise<void> {
		await this.getLearnableSkills(+this.id, 1);
		this.dinoz = this.dinozStore.getDinoz(+this.id);
	}
});
</script>

<style lang="scss" scoped>
.levelUp {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}
.disclaimer {
	border-radius: 5px;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
	width: 90%;
}
.border {
	border: 1px solid #874b2e;
	outline: 3px solid #f1c98e;
}
.dinozWrapper {
	background-color: #d99b73;
	height: 211px;
	max-width: 195px;
	width: 50%;
}
.wrapper {
	display: flex;
	width: 90%;
	max-width: 362px;
	justify-content: center;
	color: #fce3bc;
	text-align: center;
	background-color: #854b25;
	align-self: center;
	align-items: center;
}
@keyframes bounce-in-top {
	0% {
		transform: translateY(-200px);
		animation-timing-function: ease-in;
		opacity: 0;
	}
	38% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 1;
	}
	55% {
		transform: translateY(-65px);
		animation-timing-function: ease-in;
		opacity: 60%;
	}
	72% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 1;
	}
	81% {
		transform: translateY(-28px);
		animation-timing-function: ease-in;
		opacity: 80%;
	}
	90% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 92%;
	}
	95% {
		transform: translateY(-8px);
		-webkit-animation-timing-function: ease-in;
		animation-timing-function: ease-in;
		opacity: 96%;
	}
	100% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 1;
	}
}
.slide-bottom {
	animation: bounce-in-top 1.1s both;
	animation-timing-function: ease-in-out;
	animation-delay: 1s;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.hidden {
	display: none;
}
.skillName {
	font-size: 12pt;
	text-align: left;
	padding-left: 15px;
	display: flex;
	align-items: baseline;
	img {
		height: fit-content;
	}
}
.help {
	border: 1px solid #bc683c;
	cursor: help;
	margin-left: 5px;
	&:hover {
		outline: 1px solid white;
	}
}
.result {
	width: 90%;
	display: flex;
	flex-direction: column;
	align-items: center;
	align-self: center;
	color: #fce3bc;
	text-align: center;
	background-color: #bc683c;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	font-size: 10pt;
	padding: 5px;
	margin-bottom: 10px;
}
.demarcation {
	border: 1px solid #bc683c;
	margin-top: 10px;
	margin-bottom: 10px;
	width: 92%;
}
:deep(.hidden-stats) {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
	& p {
		font-size: 8.5pt !important;
	}
}
.desc {
	font-size: 9pt;
	line-height: 10pt;
	margin-left: 15px;
	margin-top: -5px;
	margin-bottom: 6px;
	font-style: italic;
}
:deep(strong) {
	color: #710;
}
.elements {
	display: flex;
	justify-content: space-evenly;
}
.unlock {
	list-style: none;
	padding-left: 20px;
	display: block;
	img {
		margin-top: -7px;
	}
	li {
		float: left;
		position: relative;
		margin-right: 8px;
		padding-left: 4px;
		padding-right: 4px;
		padding-top: 7px;
		font-size: 9pt;
		font-weight: normal;
	}
}
.select {
	margin: 5px;
	table {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 5px;
		margin-bottom: 10px;
		border: 2px solid #bc683c;
		background-color: #ecbd84;
		border-collapse: separate;
		border-spacing: 1px;
		tr {
			display: table-row;
			&.in-build {
				td {
					&.name {
						background-image:
							repeating-linear-gradient(
								45deg,
								transparent,
								transparent 5px,
								rgba(0, 0, 0, 0.1) 5px,
								rgba(0, 0, 0, 0.1) 10px
							),
							url('../assets/background/table_cell.webp');
						background-position:
							0px 0px,
							0px 0px;
					}
					&.type,
					&.learn {
						background-image:
							repeating-linear-gradient(
								45deg,
								transparent,
								transparent 5px,
								rgba(0, 0, 0, 0.1) 5px,
								rgba(0, 0, 0, 0.1) 10px
							),
							url('../assets/background/table_cell.webp');
						background-position:
							0px 0px,
							-10px 0px;
					}
				}
			}
			th {
				font-size: 8pt;
				letter-spacing: 0pt;
				text-shadow: 1px 1px 0px #356847;
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
				height: 41px;
				vertical-align: bottom;
				color: #fffdba;
				text-transform: uppercase;
				font-weight: bold;
				letter-spacing: 1pt;
				text-align: left;
				white-space: nowrap;
				border: 1px solid #356847;
				background-color: #c64e36;
				background-image: url('../assets/background/table_header.webp');
				background-position: left bottom;
				&.name {
					width: 330px;
				}
				&.type {
					max-width: 30px;
				}
			}
			td {
				font-size: 9pt;
				padding-right: 5px;
				padding-top: 1px;
				padding-bottom: 1px;
				color: #710 !important;
				background-color: #f3ca92;
				border: 1px solid #c88f44;
				&.name {
					background-image: url('../assets/background/table_cell.webp');
					background-position: 0px 0px;
					max-width: 337px;
					p {
						padding-top: 4px;
					}
					img {
						float: left;
						position: relative;
						margin-right: 5px;
						vertical-align: bottom;
					}
				}
				&.type {
					font-weight: bold;
					text-align: center;
					color: #bc683c;
					background-image: url('../assets/background/table_cell.webp');
					background-position: -10px 0px;
					max-width: 4px;
				}
				&.learn {
					padding: 5px;
					font-weight: bold;
					text-align: center;
					color: #bc683c;
					background-image: url('../assets/background/table_cell.webp');
					background-position: -10px 0px;
					text-decoration: underline;
					background-repeat: no-repeat;
				}
				&.unlockable {
					cursor: pointer;
					&:hover {
						outline: 1px solid #9a4029;
						color: white !important;
					}
				}
			}
		}
	}
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Tippy } from 'vue-tippy';

import { ElementNames, ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { SkillTreeType } from '@dinorpg/core/models/enums/SkillTreeType.js';
import type { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';

import SkillTooltip from '../dinoz/SkillTooltip.vue';
import { userStore } from '../../store/userStore';
import { getImgURL } from '../../utils/getImgURL';

type DinozSkillLike = {
	skillId: number;
};

type DisplayedSkill = SkillDetails & {
	rowspan: number;
	discovered: boolean;
	learned: boolean;
};

type Tree = DisplayedSkill[][];

const props = withDefaults(
	defineProps<{
		type: ElementType;
		treeType?: SkillTreeType;
		dinozSkills?: DinozSkillLike[];
	}>(),
	{
		treeType: SkillTreeType.VANILLA,
		dinozSkills: () => []
	}
);

const uStore = userStore();

const tree = ref<Tree>([]);
const maxLevel = ref(1);

const elementName = computed(() => ElementNames[props.type]);

const isDiscovered = (skillId: Skill) => uStore.discoveredSkills.includes(skillId);

const isLearned = (skillId: Skill) => props.dinozSkills.some(skill => skill.skillId === skillId);

const getChildren = (skillId: Skill) =>
	Object.values(skillList).filter(
		skill =>
			!skill.isSphereSkill &&
			skill.tree === props.treeType &&
			skill.unlockedFrom?.length === 1 &&
			skill.unlockedFrom.includes(skillId)
	);

const buildTree = (row: number, column: number, parents: DisplayedSkill[]) => {
	const skill = parents[parents.length - 1];
	const children = getChildren(skill.id);

	let rowspan = 0;

	children.forEach((child, index) => {
		let targetRow = row + index;

		while (tree.value[targetRow]?.length > column + 1) {
			targetRow++;
		}

		if (!tree.value[targetRow]) {
			tree.value[targetRow] = [];
		}

		const childSkill: DisplayedSkill = {
			...child,
			rowspan: 1,
			discovered: isDiscovered(child.id),
			learned: isLearned(child.id)
		};

		tree.value[targetRow][column + 1] = childSkill;

		if (maxLevel.value < column + 2) {
			maxLevel.value = column + 2;
		}

		if (childSkill.discovered) {
			buildTree(targetRow, column + 1, [...parents, childSkill]);
		}

		rowspan += childSkill.rowspan;
	});

	if (rowspan > 1) {
		skill.rowspan = rowspan;
	}
};

const init = () => {
	tree.value = [];
	maxLevel.value = 1;

	const baseSkills = Object.values(skillList).filter(
		skill =>
			skill.tree === props.treeType &&
			!skill.isSphereSkill &&
			skill.element.includes(props.type) &&
			!skill.unlockedFrom?.length
	);

	baseSkills.forEach(skill => {
		const displayedSkill: DisplayedSkill = {
			...skill,
			rowspan: 1,
			discovered: isDiscovered(skill.id),
			learned: isLearned(skill.id)
		};

		tree.value.push([displayedSkill]);

		if (displayedSkill.discovered) {
			buildTree(tree.value.length - 1, 0, [displayedSkill]);
		}
	});

	tree.value = tree.value.map(row => row.filter(Boolean));
};

watch(() => [uStore.discoveredSkills, props.type, props.treeType, props.dinozSkills], init, {
	deep: true,
	immediate: true
});
</script>

<template>
	<div :class="`skill-tree-wrapper element-${props.type}`">
		<p class="element">
			<img :src="getImgURL('elements', `elem_${elementName}`)" :alt="elementName" />
		</p>
		<table>
			<thead>
				<tr>
					<th v-for="i in maxLevel" :key="i">
						{{ $t('skillTrees.level', { level: i }) }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(row, rowIndex) in tree" :key="rowIndex">
					<td
						v-for="skill in row"
						:key="skill.id"
						:rowspan="skill.rowspan || 1"
						:class="{
							learned: skill.learned,
							base: !skill.unlockedFrom?.length,
							unknown: !skill.discovered
						}"
					>
						<SkillTooltip v-if="skill.discovered" :skill="skill.id">
							{{ $t(`skill.name.${skill.name}`) }}
						</SkillTooltip>
						<Tippy v-else theme="normal">
							???
							<template #content>
								<h1 v-html="$t('skill.unknown')" />
								<p v-html="$t('skill.unknownDesc')" />
							</template>
						</Tippy>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="scss" scoped>
.skill-tree-wrapper {
	overflow-x: auto;
	margin: 8px;
	padding: 10px;
	padding-top: 0;
	&.element-1 {
		background-color: #d83a2f;
	}
	&.element-2 {
		background-color: #af7d5d;
	}
	&.element-3 {
		background-color: #4ea0e2;
		.element {
			color: white;
		}
	}
	&.element-4 {
		background-color: #faf24e;
	}
	&.element-5 {
		background-color: #a9d7e8;
	}
	.element {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2px;
		color: #fbdca5;
		font-size: 8pt;
		font-variant: small-caps;
		font-weight: bold;
		img {
			width: 16px;
		}
	}
	table {
		width: 100%;
		border-collapse: collapse;
		background-color: #e0b785;
		border: 3px solid #793f1f;
		tr {
			background-color: #e0b785;
		}
		th {
			border: 3px solid #793f1f;
			background-color: #793f1f;
			text-align: center;
			color: #e0b785;
			font-variant: small-caps;
			font-weight: bold;
			font-size: 8pt;
			padding: 2px;
			white-space: nowrap;
		}
		td {
			border: 3px solid #793f1f;
			text-align: center;
			color: #793f1f;
			font-variant: small-caps;
			font-weight: bold;
			font-size: 8pt;
			padding: 2px;
			min-width: 90px;
			&.learned {
				background-color: #d39f63;
			}
			&.unknown {
				color: rgba(121, 63, 31, 0.65);
			}
			&:not(.base) {
				position: relative;
				&::before {
					content: '';
					position: absolute;
					left: -5px;
					top: 50%;
					transform: translateY(-50%);
					width: 8px;
					border-top: 3px solid #793f1f;
				}
			}
		}
	}
}
@media (max-width: 530px) {
	.skill-tree-wrapper {
		width: 96%;
		max-width: 100%;
		margin: 8px 0;
		padding: 8px;
		box-sizing: border-box;
		table {
			width: max-content;
			min-width: 100%;
		}
	}
}
</style>

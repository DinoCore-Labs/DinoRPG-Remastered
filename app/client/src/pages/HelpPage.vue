<template>
	<TitleHeader :title="`${$t('pageTitle.guide')}`" :header="$t('guide.title')" :sub-header="selectedItem?.name ?? ''" />
	<div class="intro">
		<div class="menu">
			<ul class="list">
				<li
					v-for="(item, index) in items"
					:key="index"
					@click="showContent(item)"
					:class="{ selected: selectedItemIndex === index }"
				>
					<img v-if="item.nameImageUrl" :src="getImgURL(item.nameImageUrl.path, item.nameImageUrl.name)" alt="Image" />
					{{ item.name }}
				</li>
			</ul>
		</div>
		<div class="image">
			<img :src="getImgURL('design', 'rocky_01')" />
		</div>
	</div>
	<div class="showContent">
		<div v-if="selectedItem" class="content">
			<div class="titleContent">
				<h3>{{ selectedItem.name }}</h3>
			</div>
			<div v-for="(section, index) in selectedItem.contentSections" :key="index" class="sectionContent">
				<h3 class="titleSection">{{ section.name }}</h3>
				<ul v-if="section.texts" class="textContent">
					<li v-for="(text, i) in section.texts" :key="i">
						<p v-html="formatContent(text)" />
					</li>
				</ul>
				<img
					v-if="section.ImageUrl"
					:src="getImgURL(section.ImageUrl.path, section.ImageUrl.name)"
					alt="Image"
					class="imageContent"
				/>
				<ul v-if="section.listItems" class="listItemsContent">
					<li v-for="(item, i) in section.listItems" :key="i">
						<img v-if="item.imageUrl" :src="getImgURL(item.imageUrl.path, item.imageUrl.name)" alt="Image" />
						<span v-html="formatContent(item.text)" />
					</li>
				</ul>
			</div>
			<button @click="showPrevItem" v-if="selectedItem?.prevItem !== undefined" class="next">
				<img :src="getImgURL('icons', 'small_page_up')" />
				{{ prevItemName }}
			</button>
			<button @click="showNextItem" v-if="selectedItem?.nextItem !== undefined" class="next">
				<img :src="getImgURL('icons', 'small_page_down')" />
				{{ nextItemName }}
			</button>

			<button @click="goToPage('News')" class="next">
				<img :src="getImgURL('icons', 'small_delete')" />
				{{ $t(`guide.text.stop`) }}
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';

type HelpPageImage = {
	path: string;
	name: string;
};

type HelpPageListItem = {
	imageUrl?: HelpPageImage;
	text: string;
};

type HelpPageContentSection = {
	name?: string;
	texts?: string[];
	ImageUrl?: HelpPageImage;
	listItems?: HelpPageListItem[];
};

type HelpPageItem = {
	name: string;
	nameImageUrl?: HelpPageImage;
	contentSections: HelpPageContentSection[];
	nextItem?: number;
	prevItem?: number;
};

export default defineComponent({
	name: 'Help',
	components: {
		TitleHeader
	},
	data() {
		return {
			selectedItemIndex: 0
		};
	},
	computed: {
		items(): HelpPageItem[] {
			return [
				{
					name: this.$t('guide.sections.intro'),
					nameImageUrl: { path: 'icons', name: 'small_home' },
					contentSections: [{ texts: [this.$t('guide.text.intro')] }],
					nextItem: 1
				},
				{
					name: this.$t('guide.sections.adopt'),
					nameImageUrl: { path: 'icons', name: 'small_member' },
					contentSections: [
						{
							texts: [this.$t('guide.text.adopt')],
							ImageUrl: { path: 'guide', name: 'adopt' }
						},
						{ texts: [this.$t('guide.text.adopt2')] }
					],
					nextItem: 2,
					prevItem: 0
				},
				{
					name: this.$t('guide.sections.name'),
					nameImageUrl: { path: 'icons', name: 'small_question' },
					contentSections: [
						{ texts: [this.$t('guide.text.name')], ImageUrl: { path: 'guide', name: 'name' } },
						{ texts: [this.$t('guide.text.name2')] }
					],
					nextItem: 3,
					prevItem: 1
				},
				{
					name: this.$t('guide.sections.card'),
					nameImageUrl: { path: 'status', name: 'fx_ccard' },
					contentSections: [
						{ texts: [this.$t('guide.text.card')], ImageUrl: { path: 'guide', name: 'card' } },
						{
							texts: [this.$t('guide.text.card2')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.card2-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.card2-2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.card2-3') }
							]
						},
						{ texts: [this.$t('guide.text.card3')] }
					],
					nextItem: 4,
					prevItem: 2
				},
				{
					name: this.$t('guide.sections.move'),
					nameImageUrl: { path: 'icons', name: 'small_follow' },
					contentSections: [
						{ texts: [this.$t('guide.text.move')], ImageUrl: { path: 'guide', name: 'move' } },
						{
							texts: [this.$t('guide.text.move2')],
							listItems: [{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.move2-1') }]
						},
						{ texts: [this.$t('guide.text.move3')] }
					],
					nextItem: 5,
					prevItem: 3
				},
				{
					name: this.$t('guide.sections.fight'),
					nameImageUrl: { path: 'icons', name: 'small_fire' },
					contentSections: [
						{ texts: [this.$t('guide.text.fight')], ImageUrl: { path: 'guide', name: 'fight' } },
						{
							texts: [this.$t('guide.text.fight2')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight2-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight2-2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight2-3') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight2-4') }
							]
						},
						{
							name: this.$t('guide.text.fight3'),
							texts: [this.$t('guide.text.fight3-1')],
							listItems: [
								{ imageUrl: { path: 'elements', name: 'elem_fire' }, text: this.$t('guide.text.fight3-1-1') },
								{ imageUrl: { path: 'elements', name: 'elem_wood' }, text: this.$t('guide.text.fight3-1-2') },
								{ imageUrl: { path: 'elements', name: 'elem_water' }, text: this.$t('guide.text.fight3-1-3') },
								{ imageUrl: { path: 'elements', name: 'elem_lightning' }, text: this.$t('guide.text.fight3-1-4') },
								{ imageUrl: { path: 'elements', name: 'elem_air' }, text: this.$t('guide.text.fight3-1-5') }
							]
						},
						{
							texts: [this.$t('guide.text.fight3-2')],
							ImageUrl: { path: 'guide', name: 'elements' }
						},
						{ texts: [this.$t('guide.text.fight3-3')] },
						{
							name: this.$t('guide.text.fight4'),
							texts: [this.$t('guide.text.fight4-1')],
							ImageUrl: { path: 'guide', name: 'assault' }
						},
						{
							texts: [this.$t('guide.text.fight4-2')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight4-2-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight4-2-2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight4-2-3') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.fight4-2-4') }
							]
						},
						{ texts: [this.$t('guide.text.fight4-3')] },
						{ name: this.$t('guide.text.fight5'), texts: [this.$t('guide.text.fight5-1')] },
						{ name: this.$t('guide.text.fight6'), texts: [this.$t('guide.text.fight6-1')] },
						{ name: this.$t('guide.text.fight7'), ImageUrl: { path: 'guide', name: 'energy' } },
						{ texts: [this.$t('guide.text.fight7-1')] },
						{
							name: this.$t('guide.text.fight8'),
							texts: [this.$t('guide.text.fight8-1')],
							listItems: [
								{ imageUrl: { path: 'guide', name: 'status_sleep' }, text: this.$t('guide.text.fight8-1-1') },
								{ imageUrl: { path: 'guide', name: 'status_untouchable' }, text: this.$t('guide.text.fight8-1-2') },
								{ imageUrl: { path: 'guide', name: 'status_slow_down' }, text: this.$t('guide.text.fight8-1-3') },
								{ imageUrl: { path: 'guide', name: 'status_faster' }, text: this.$t('guide.text.fight8-1-4') },
								{ imageUrl: { path: 'guide', name: 'status_petrified' }, text: this.$t('guide.text.fight8-1-5') },
								{ imageUrl: { path: 'guide', name: 'status_assault_bonus' }, text: this.$t('guide.text.fight8-1-6') },
								{ imageUrl: { path: 'guide', name: 'status_poisoned' }, text: this.$t('guide.text.fight8-1-7') },
								{ imageUrl: { path: 'guide', name: 'status_locked' }, text: this.$t('guide.text.fight8-1-8') },
								{ imageUrl: { path: 'guide', name: 'status_dazzled' }, text: this.$t('guide.text.fight8-1-9') },
								{ imageUrl: { path: 'guide', name: 'status_protected' }, text: this.$t('guide.text.fight8-1-10') },
								{ imageUrl: { path: 'guide', name: 'status_mute' }, text: this.$t('guide.text.fight8-1-11') },
								{ imageUrl: { path: 'guide', name: 'status_sharingan' }, text: this.$t('guide.text.fight8-1-12') },
								{
									imageUrl: { path: 'guide', name: 'status_blocked_inventory' },
									text: this.$t('guide.text.fight8-1-13')
								},
								{ imageUrl: { path: 'guide', name: 'status_energy_penalty' }, text: this.$t('guide.text.fight8-1-14') },
								{ imageUrl: { path: 'guide', name: 'status_energy_bonus' }, text: this.$t('guide.text.fight8-1-15') },
								{ imageUrl: { path: 'guide', name: 'status_bonus_def_fire' }, text: this.$t('guide.text.fight8-1-16') },
								{ imageUrl: { path: 'guide', name: 'status_bonus_def_wood' }, text: this.$t('guide.text.fight8-1-17') },
								{
									imageUrl: { path: 'guide', name: 'status_bonus_def_water' },
									text: this.$t('guide.text.fight8-1-18')
								},
								{
									imageUrl: { path: 'guide', name: 'status_bonus_def_lightning' },
									text: this.$t('guide.text.fight8-1-19')
								},
								{ imageUrl: { path: 'guide', name: 'status_bonus_def_air' }, text: this.$t('guide.text.fight8-1-20') },
								{
									imageUrl: { path: 'guide', name: 'status_initiative_bonus' },
									text: this.$t('guide.text.fight8-1-21')
								},
								{
									imageUrl: { path: 'guide', name: 'status_initiative_penalty' },
									text: this.$t('guide.text.fight8-1-22')
								},
								{ imageUrl: { path: 'guide', name: 'status_dodge_bonus' }, text: this.$t('guide.text.fight8-1-23') },
								{ imageUrl: { path: 'guide', name: 'status_def_bonus' }, text: this.$t('guide.text.fight8-1-24') }
							]
						}
					],
					nextItem: 6,
					prevItem: 4
				},
				{
					name: this.$t('guide.sections.heal'),
					nameImageUrl: { path: 'icons', name: 'small_use' },
					contentSections: [
						{
							texts: [this.$t('guide.text.heal')],
							ImageUrl: { path: 'guide', name: 'heal' }
						},
						{ name: this.$t('guide.text.heal2'), texts: [this.$t('guide.text.heal2-1')] }
					],
					nextItem: 7,
					prevItem: 5
				},
				{
					name: this.$t('guide.sections.death'),
					nameImageUrl: { path: 'icons', name: 'small_delete' },
					contentSections: [
						{
							texts: [this.$t('guide.text.death')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.death-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.death-2') }
							]
						},
						{ texts: [this.$t('guide.text.death2')] }
					],
					nextItem: 8,
					prevItem: 6
				},
				{
					name: this.$t('guide.sections.exp'),
					nameImageUrl: { path: 'icons', name: 'small_xp' },
					contentSections: [
						{ texts: [this.$t('guide.text.exp')], ImageUrl: { path: 'guide', name: 'exp' } },
						{ name: this.$t('guide.text.exp2'), texts: [this.$t('guide.text.exp2-1')] },
						{ name: this.$t('guide.text.exp3'), texts: [this.$t('guide.text.exp3-1')] }
					],
					nextItem: 9,
					prevItem: 7
				},
				{
					name: this.$t('guide.sections.missions'),
					nameImageUrl: { path: 'icons', name: 'small_gold' },
					contentSections: [
						{ texts: [this.$t('guide.text.missions')], ImageUrl: { path: 'guide', name: 'missions' } },
						{ texts: [this.$t('guide.text.missions2')] }
					],
					nextItem: 10,
					prevItem: 8
				},
				{
					name: this.$t('guide.sections.status'),
					nameImageUrl: { path: 'icons', name: 'small_edit' },
					contentSections: [{ texts: [this.$t('guide.text.status')] }],
					nextItem: 11,
					prevItem: 9
				},
				{
					name: this.$t('guide.sections.equipment'),
					nameImageUrl: { path: 'status', name: 'fx_bckpck' },
					contentSections: [
						{ texts: [this.$t('guide.text.equipment')], ImageUrl: { path: 'guide', name: 'equipment' } },
						{ texts: [this.$t('guide.text.equipment2')] }
					],
					nextItem: 12,
					prevItem: 10
				},
				{
					name: this.$t('guide.sections.epic'),
					nameImageUrl: { path: 'icons', name: 'small_mode' },
					contentSections: [{ texts: [this.$t('guide.text.epic')] }],
					nextItem: 13,
					prevItem: 11
				},
				{
					name: this.$t('guide.sections.group'),
					nameImageUrl: { path: 'icons', name: 'small_leader' },
					contentSections: [
						{ texts: [this.$t('guide.text.group')], ImageUrl: { path: 'guide', name: 'group' } },
						{ texts: [this.$t('guide.text.group2')] }
					],
					nextItem: 14,
					prevItem: 12
				},
				{
					name: this.$t('guide.sections.ingredient'),
					nameImageUrl: { path: 'status', name: 'fx_pelle' },
					contentSections: [
						{ texts: [this.$t('guide.text.ingredient')], ImageUrl: { path: 'guide', name: 'gather' } },
						{ texts: [this.$t('guide.text.ingredient2')] }
					],
					nextItem: 15,
					prevItem: 13
				},
				{
					name: this.$t('guide.sections.clans'),
					nameImageUrl: { path: 'icons', name: 'small_leader' },
					contentSections: [
						{ texts: [this.$t('guide.text.clans')] },
						{ name: this.$t('guide.text.clans1'), texts: [this.$t('guide.text.clans1-1')] },
						{ name: this.$t('guide.text.clans2'), texts: [this.$t('guide.text.clans2-1')] }
					],
					nextItem: 16,
					prevItem: 14
				},
				{
					name: this.$t('guide.sections.dojo'),
					nameImageUrl: { path: 'icons', name: 'small_dojo' },
					contentSections: [
						{
							texts: [this.$t('guide.text.dojos')],
							listItems: [{ imageUrl: { path: 'act', name: 'act_train' }, text: this.$t('guide.text.dojos-1') }]
						},
						{ texts: [this.$t('guide.text.dojos-2')] },
						{ name: this.$t('guide.text.dojos1'), texts: [this.$t('guide.text.dojos1-1')] },
						{
							name: this.$t('guide.text.dojos2'),
							texts: [this.$t('guide.text.dojos2-1')],
							listItems: [{ imageUrl: { path: 'act', name: 'act_defi' }, text: this.$t('guide.text.dojos2-2') }]
						},
						{
							name: this.$t('guide.text.dojos3'),
							texts: [this.$t('guide.text.dojos3-1')],
							listItems: [{ imageUrl: { path: 'act', name: 'act_tournament' }, text: this.$t('guide.text.dojos3-2') }]
						},
						{ texts: [this.$t('guide.text.dojos3-3')] },
						{
							name: this.$t('guide.text.dojos4'),
							listItems: [{ imageUrl: { path: 'act', name: 'act_history' }, text: this.$t('guide.text.dojos4-1') }]
						},
						{
							name: this.$t('guide.text.dojos5'),
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.dojos5-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.dojos5-2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.dojos5-3') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.dojos5-4') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.dojos5-5') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.dojos5-6') }
							]
						}
					],
					nextItem: 17,
					prevItem: 15
				},
				{
					name: this.$t('guide.sections.gdc'),
					nameImageUrl: { path: 'icons', name: 'small_attack' },
					contentSections: [
						{ texts: [this.$t('guide.text.gdc')] },
						{
							name: this.$t('guide.text.gdc1'),
							texts: [this.$t('guide.text.gdc1-1')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.gdc1-2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.gdc1-3') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.gdc1-4') }
							]
						},
						{
							name: this.$t('guide.text.gdc2'),
							texts: [this.$t('guide.text.gdc2-1')],
							ImageUrl: { path: 'guide', name: 'castle' }
						},
						{
							texts: [this.$t('guide.text.gdc2-2')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.gdc2-2-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.gdc2-2-2') }
							]
						},
						{ name: this.$t('guide.text.gdc3'), texts: [this.$t('guide.text.gdc3-1')] },
						{
							name: this.$t('guide.text.gdc4'),
							texts: [this.$t('guide.text.gdc4-1')],
							ImageUrl: { path: 'guide', name: 'attack_castle' }
						},
						{
							name: this.$t('guide.text.gdc5'),
							texts: [this.$t('guide.text.gdc5-1')],
							ImageUrl: { path: 'guide', name: 'def_castle' }
						},
						{ name: this.$t('guide.text.gdc6'), texts: [this.$t('guide.text.gdc6-1')] }
					],
					nextItem: 18,
					prevItem: 16
				},
				{
					name: this.$t('guide.sections.cdc'),
					nameImageUrl: { path: 'icons', name: 'small_attack' },
					contentSections: [
						{ texts: [this.$t('guide.text.cdc')] },
						{ name: this.$t('guide.text.cdc1'), texts: [this.$t('guide.text.cdc1-1')] },
						{
							name: this.$t('guide.text.cdc2'),
							texts: [this.$t('guide.text.cdc2-1')],
							ImageUrl: { path: 'guide', name: 'battle_cdc' }
						},
						{ texts: [this.$t('guide.text.cdc2-2')] },
						{ name: this.$t('guide.text.cdc3'), texts: [this.$t('guide.text.cdc3-1')] },
						{
							name: this.$t('guide.text.cdc4'),
							texts: [this.$t('guide.text.cdc4-1')],
							ImageUrl: { path: 'guide', name: 'position_cdc' }
						},
						{ texts: [this.$t('guide.text.cdc4-2')] }
					],
					nextItem: 19,
					prevItem: 17
				},
				{
					name: this.$t('guide.sections.question'),
					nameImageUrl: { path: 'icons', name: 'small_mail' },
					contentSections: [
						{
							texts: [this.$t('guide.text.questions')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.questions1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.questions2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.questions3') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.questions4') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.questions5') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.questions6') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.questions7') }
							]
						}
					],
					nextItem: 20,
					prevItem: 18
				},
				{
					name: this.$t('guide.sections.support'),
					nameImageUrl: { path: 'icons', name: 'small_browse_next' },
					contentSections: [
						{ name: this.$t('guide.text.support'), texts: [this.$t('guide.text.support-1')] },
						{
							texts: [this.$t('guide.text.support1')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support1-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support1-2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support1-3') }
							]
						},
						{
							texts: [this.$t('guide.text.support2')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support2-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support2-2') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support2-3') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support2-4') }
							]
						},
						{
							texts: [this.$t('guide.text.support3')],
							listItems: [
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support3-1') },
								{ imageUrl: { path: 'icons', name: 'info_button' }, text: this.$t('guide.text.support3-2') }
							]
						},
						{ name: this.$t('guide.text.support4'), texts: [this.$t('guide.text.support4-1')] }
					],
					nextItem: 21,
					prevItem: 19
				},
				{
					name: this.$t('guide.sections.security'),
					nameImageUrl: { path: 'icons', name: 'small_lock' },
					contentSections: [{ name: this.$t('guide.text.security'), texts: [this.$t('guide.text.security-1')] }],
					prevItem: 20
				}
			];
		},
		selectedItem() {
			return this.items[this.selectedItemIndex] || null;
		},
		prevItemName(): string {
			const idx = this.selectedItem?.prevItem;
			return idx !== undefined ? (this.items[idx]?.name ?? '') : '';
		},
		nextItemName(): string {
			const idx = this.selectedItem?.nextItem;
			return idx !== undefined ? (this.items[idx]?.name ?? '') : '';
		}
	},
	methods: {
		showContent(item: HelpPageItem) {
			this.selectedItemIndex = this.items.indexOf(item);
		},
		showNextItem() {
			if (this.selectedItem && this.selectedItem.nextItem !== undefined) {
				this.selectedItemIndex = this.selectedItem.nextItem;
			}
		},
		showPrevItem() {
			if (this.selectedItem && this.selectedItem.prevItem !== undefined) {
				this.selectedItemIndex = this.selectedItem.prevItem;
			}
		},
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		}
	}
});
</script>

<style lang="scss" scoped>
.intro {
	display: flex;
	margin-left: 10px;
	max-width: 95%;
	align-self: baseline;
	.menu {
		background-color: #e09b6244;
		border-radius: 5px;
		width: 220px;
		.list {
			color: rgb(142, 62, 38);
			cursor: pointer;
			font-variant: small-caps;
			font-weight: bold;
			list-style: none;
			margin-top: 6px;
			margin-left: -25px;
			& li:hover,
			& li.selected {
				color: #fce3bc;
				background-color: rgb(142, 62, 38);
			}
		}
	}
	.image {
		margin-top: auto;
		& img {
			max-width: 95%;
			height: auto;
		}
	}
}
.showContent {
	max-width: 95%;
	align-self: center;
	.content {
		margin-top: 10px;
		.titleContent {
			height: fit-content;
			background-image: url('../assets/design/title/title_h1.webp');
			background-position: left bottom;
			background-repeat: no-repeat;
			padding-bottom: 22px;
			h3 {
				margin-left: 5px;
				color: #71b703;
				font-variant: small-caps;
			}
		}
		:deep(strong) {
			color: rgb(142, 62, 38);
		}
		:deep(i) {
			color: rgb(142, 62, 38);
		}
		.sectionContent {
			margin-top: 15px;
			.titleSection {
				background-color: rgb(142, 62, 38);
				border-radius: 2px;
				color: #fff1ad;
				margin-bottom: 10px;
			}
			.textContent {
				display: flex;
				flex-direction: column;
				gap: 10px;
				list-style: none;
				margin-left: -35px;
			}
			.imageContent {
				margin-bottom: 10px;
				margin-top: 10px;
				max-width: -moz-available;
				max-width: -webkit-fill-available;
				max-width: stretch;
			}
			.listItemsContent {
				list-style: none;
				margin-top: 12px;
				& li {
					margin-top: 10px;
					margin-left: 10px;
					& img {
						margin-right: 8px;
					}
				}
			}
		}
		.next {
			background-image: url('../assets/button/button.webp');
			border: none;
			color: #fff1ad;
			font-variant: small-caps;
			font-weight: bold;
			text-align: center;
			height: 28px;
			width: 145px !important;
			background-repeat: no-repeat;
			font-size: 7pt;
			margin-left: 10px;
			margin-right: 10px;
			margin-top: 20px;
			cursor: pointer;
			&:hover {
				color: white;
				background-image: url('../assets/button/button_hover.webp');
			}
		}
	}
}
</style>

<template>
	<Transition name="opacity">
		<div v-show="menuCalled" class="backDrop" @click="close()"></div>
	</Transition>
	<Transition name="slide">
		<div v-show="menuCalled" class="root">
			<div class="player">
				<div class="money">{{ beautifulMoney }} <img :src="getImgURL('icons', 'small_gold')" alt="or" /></div>
				<div class="close">
					<button @click="close" class="burgerClose">
						<svg class="svgIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="MenuIcon">
							<path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"></path>
						</svg>
					</button>
				</div>
			</div>
			<div class="shortCutMenu">
				<div class="shortCuts">
					<RouterLink class="link" :to="`/shop/flying`">
						<img :src="getImgURL('act', 'act_boutique')" alt="shop" />
						<span>{{ $t('topBar.leftUserMenu.shop') }}</span>
					</RouterLink>
					<RouterLink class="link" :to="`/dojo`">
						<img :src="getImgURL('act', 'act_dojo')" alt="dojo" />
						<span>{{ $t('topBar.leftUserMenu.dojo') }}</span>
					</RouterLink>
					<!--
					<RouterLink class="link" :to="`/manage`" v-if="playerStore.playerOptions.hasPDA">
						<img :src="getImgURL('icons', 'act_pda')" alt="pda" />
						<span>{{ $t('topBar.leftMenu.order') }}</span>
					</RouterLink>
					<RouterLink class="link" :to="`/skill-trees`" v-if="playerStore.playerOptions.hasPAC">
						<img :src="getImgURL('icons', 'act_pac')" />
						<span>{{ $t('button.skills') }}</span>
					</RouterLink>
					<RouterLink class="link" :to="`/missions`" v-if="playerStore.playerOptions.hasPMI">
						<img :src="getImgURL('icons', 'act_pmi')" alt="pmi" />
						<span>{{ $t('topBar.leftMenu.missions') }}</span>
					</RouterLink>
					<RouterLink class="link" :to="`/shop/dinoz`">
						<img :src="getImgURL('icons', 'act_treasure')" alt="enclosure" />
						<span>{{ $t('topBar.leftMenu.enclosure') }}</span>
					</RouterLink>-->
				</div>
			</div>
			<div class="dinozList">
				<RouterLink
					v-for="(dinoz, index) in dinozList"
					:key="index"
					:to="`/dino/${dinoz.id}`"
					class="dinoz"
					:class="{
						selected: currentDinozId() ? dinoz.id === currentDinozId() : dinoz.id === pageId
						//group: getLeaderGroup(dinoz),
						//exhausted: dinoz.remaining === 0 && !dinoz.fight
					}"
				>
					<DinozMini class="display" :display="dinoz.display" :key="dinoz.display" />
					<div class="dinozName">
						<p
							:class="{
								dead: dinoz.life === 0
							}"
						>
							{{ dinoz.name }}
						</p>
						<span class="place">{{ $t(`place.name.${getPlaceName(dinoz.placeId)}`) }}</span>
					</div>

					<div class="bars">
						<span class="tinyBar">
							<span class="life" :style="getBarWidth(dinoz.life, dinoz.maxLife)"></span>
						</span>
						<span class="tinyBar">
							<span class="xp" :style="getBarWidth(dinoz.experience, dinoz.maxExperience)"></span>
						</span>
					</div>
					<div class="icons">
						<template v-for="_ in dinoz.remaining" :key="_">
							<img
								:src="getImgURL('icons', `small_hourglass`)"
								v-tippy="{
									content: formatContent($t('dinoz.hud.remainingActions')),
									theme: 'small'
								}"
								alt="actions"
							/>
						</template>
						<img
							v-if="dinoz.experience >= dinoz.maxExperience && dinoz.maxExperience !== 0"
							:src="getImgURL('icons', 'small_lup')"
							v-tippy="{
								content: formatContent($t('levelup.small')),
								theme: 'small'
							}"
							alt="lvlup"
						/>
					</div>
					<div class="icons">
						<!--<img
							v-if="dinoz.fight"
							:src="getImgURL('icons', 'small_attack')"
							v-tippy="{
								content: formatContent($t('dinoz.hud.following')),
								theme: 'small'
							}"
							alt="fight"
						/>
						<img
							v-if="dinoz.actions.some(a => a.imgName === 'act_gather')"
							:src="getImgURL('icons', 'small_gather')"
							v-tippy="{
								content: formatContent($t('dinoz.hud.gather')),
								theme: 'small'
							}"
							alt="gather"
						/>
						<svg
							v-if="dinoz.actions.some(a => a.name === Action.STOP_REST)"
							v-tippy="{
								content: formatContent($t('dinoz.hud.rest')),
								theme: 'small'
							}"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							height="11.25px"
							width="12.1px"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g transform="matrix(1.0, 0.0, 0.0, 1.0, 0.15, 0)">
								<path
									d="M6.2 2.3 L2.9 6.35 6.4 6.35 6.4 7.65 0.85 7.65 0.85 6.4 4.15 2.3 1.0 2.3 1.0 1.0 6.2 1.0 6.2 2.3"
									fill="#ffffff"
									fill-rule="evenodd"
									stroke="none"
								/>
								<path
									d="M10.8 6.15 L8.25 9.3 10.95 9.3 10.95 10.25 6.65 10.25 6.65 9.3 9.2 6.15 6.75 6.15 6.75 5.15 10.8 5.15 10.8 6.15"
									fill="#ffffff"
									fill-rule="evenodd"
									stroke="none"
								/>
							</g>
						</svg>-->
					</div>
					<div class="lead">
						<!--<img
							v-if="dinoz.leaderId"
							:src="getImgURL('icons', 'small_follow')"
							v-tippy="{
								content: formatContent($t('dinoz.hud.following')),
								theme: 'small'
							}"
							alt="lvlup"
						/>
						<img
							v-if="dinoz.followers.length > 0"
							:src="getImgURL('icons', 'crown', true)"
							v-tippy="{
								content: formatContent($t('dinoz.hud.followed')),
								theme: 'small'
							}"
							alt="lvlup"
						/>-->
					</div>
				</RouterLink>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
//import { orderDinozList } from '@drpg/core/utils/DinozUtils';
//import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';
import DinozMini from '../dinoz/DinozMini.vue';
import { beautifulNumber } from '../../utils/beautifulNumber.js';
//import { Action } from '@drpg/core/models/dinoz/ActionList';
import { placeList } from '../../constants/place.js';
import { userStore } from '../../store/userStore.js';
import { dinozStore } from '../../store/dinozStore.js';

export default defineComponent({
	name: 'LeftUserMenu',
	components: { DinozMini },
	data() {
		return {
			menuCalled: false,
			//localStore: localStore(),
			dinozStore: dinozStore(),
			userStore: userStore(),
			dinozList: dinozStore().getDinozList as Array<DinozFiche>
		};
	},
	computed: {
		/*Action() {
			return Action;
		},*/
		beautifulMoney(): string | undefined {
			if (!this.userStore.gold) {
				return;
			}
			return beautifulNumber(this.userStore.gold);
		},
		pageId(): number {
			return parseInt(this.$route.params.id as string);
		}
	},
	methods: {
		close() {
			this.menuCalled = false;
		},
		getBarWidth(actual: number, max: number): string {
			if (actual > max) actual = max;
			const width: number = Math.round((actual / max) * 36);
			return `width : ${width}px`;
		},
		getPlaceName(placeId: number): string {
			return placeList.find(place => place.placeId === placeId)?.name ?? '';
		},
		currentDinozId(): number {
			return this.dinozStore.currentDinozId ?? 0;
		} /*,
		getLeaderGroup(dinoz: DinozFiche) {
			const selectedDinoz = this.dinozStore.getDinoz(this.currentDinozId());
			if (!selectedDinoz) return false;
			// Le dinoz est leader
			if (!dinoz.leaderId && selectedDinoz.leaderId === dinoz.id) {
				return true;
			}
			// Le dinoz n'est pas suiveur
			if (!dinoz.leaderId) return false;

			const leader = this.dinozStore.getDinoz(dinoz.leaderId);
			if (!leader) return false;
			// Si le dinoz est follower et que le dinoz courrant est son leader
			if (dinoz.leaderId && leader.id === selectedDinoz.id) {
				return true;
			}
			if (dinoz.followers && dinoz.followers.map(d => d.id).includes(selectedDinoz.id)) {
				return true;
			}
			if (dinoz.id === this.currentDinozId()) {
				return true;
			}
			return !!selectedDinoz?.followers.map(d => d.id).includes(dinoz.id);
		}*/
	},
	/*watch: {
		'dinozStore.getDinozList': {
			handler(dinozList: Array<DinozFiche>) {
				this.dinozList = orderDinozList(dinozList.filter(d => d.unavailableReason !== UnavailableReasonFront.frozen));
			},
			deep: true
		}
		// Removed watcher for currentDinozId as it's a computed property and should not be assigned directly
	},*/
	mounted() {
		EventBus.on('leftUserMenu', async e => {
			this.menuCalled = e;
		});
	}
});
</script>

<style scoped lang="scss">
.shortCutMenu {
	padding: 16px;
	background-color: rgb(29, 32, 40);
	.shortCuts {
		display: flex;
		-moz-box-pack: center;
		justify-content: center;
		flex-wrap: wrap;
		.link {
			display: flex;
			flex-direction: column;
			-moz-box-pack: center;
			justify-content: center;
			-moz-box-align: center;
			align-items: center;
			width: 64px;
			height: 64px;
			color: rgb(108, 113, 136);
			border-radius: 3px;
			text-decoration: none;
			cursor: pointer;
			span {
				margin: 0px;
				font-family: arial, sans-serif;
				font-weight: 400;
				font-size: 1rem;
				line-height: 1.66;
				text-align: center;
			}
			.svgLinkIcon {
				user-select: none;
				width: 1em;
				height: 1em;
				display: inline-block;
				fill: currentcolor;
				flex-shrink: 0;
				transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1);
				font-size: 2.8rem;
				color: rgb(254, 125, 0);
			}
			.admin {
				fill: currentcolor;
				color: rgb(2, 136, 209);
			}
			.logout {
				fill: currentcolor;
				color: rgb(211, 47, 47);
			}
			&:hover {
				color: rgb(255, 255, 255);
				background-color: rgb(254, 125, 0);
				box-shadow: rgb(189, 61, 0) 0px 0px 8px;
				svg {
					color: rgb(255, 255, 255);
				}
			}
		}
	}
	.language {
		display: flex;
		-moz-box-pack: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 8px;
		padding-top: 8px;
	}
}
.modal {
	position: fixed;
	inset: 0px;
	z-index: 1200;
}
.svgIcon {
	user-select: none;
	width: 1em;
	height: 1em;
	display: inline-block;
	fill: currentcolor;
	flex-shrink: 0;
	transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 2rem;
}
.money {
	margin: 0px;
	font-size: 20px;
	letter-spacing: -0.24px;
	padding-top: 3px;
	font-family: arial, sans-serif;
	line-height: 1.2;
	font-weight: 600;
	text-align: right;
	background-color: rgb(254, 125, 0);
	-moz-box-flex: 1;
	flex-grow: 1;
	padding-left: 16px;
	padding-right: 16px;
}
.burgerClose {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	background-color: transparent;
	outline: 0px;
	border: 0px;
	margin: 0px;
	cursor: pointer;
	user-select: none;
	vertical-align: middle;
	appearance: none;
	text-decoration: none;
	text-align: center;
	flex: 0 0 auto;
	border-radius: 50%;
	overflow: visible;
	transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
	padding: 5px;
	font-size: 1.2rem;
	color: rgb(255, 255, 255);
}
.close {
	display: flex;
	-moz-box-align: center;
	align-items: center;
	background-color: rgb(254, 181, 0);
}
.player {
	display: flex;
	-moz-box-align: stretch;
	align-items: stretch;
	color: rgb(255, 255, 255);
}
.root {
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 8px 10px -5px,
		rgba(0, 0, 0, 0.14) 0px 16px 24px 2px,
		rgba(0, 0, 0, 0.12) 0px 6px 30px 5px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	height: 100%;
	flex: 1 0 auto;
	z-index: 1200;
	position: fixed;
	top: 0px;
	outline: 0px;
	left: 0px;
	width: 310px;
	background-color: rgb(17, 19, 23);
	color: rgb(183, 185, 198);
	background-image: none;
}
.backDrop {
	position: fixed;
	display: flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	inset: 0px;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 5;
	opacity: 1;
}
.dinozList {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	.dinoz {
		cursor: pointer;
		display: grid;
		grid-template-columns: 50px 3fr repeat(3, 1fr) 30px;
		width: 100%;
		color: rgb(108, 113, 136);
		text-decoration: none;
		&:hover {
			background-color: rgb(254, 125, 0);
			box-shadow: rgb(189, 61, 0) 0px 0px 8px;
			color: rgb(255, 255, 255);
		}
		.display {
			//height: 40px;
		}
		.dinozName {
			place-self: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			.place {
				font-size: small;
				text-align: center;
			}
		}
		.dead {
			text-decoration: line-through;
		}

		.bars {
			place-self: center;
			.tinyBar {
				margin-top: 4px;
				display: block;
				height: 2px;
				width: 36px;
				border: 1px solid #bc683c;
				background-color: black;
				.life {
					display: block;
					height: 2px;
					background-color: yellow;
				}
				.xp {
					display: block;
					height: 2px;
					background-color: #ff54e4;
				}
			}
		}
		.icons {
			place-self: center;
			display: flex;
			gap: 2px;
			margin-top: 4px;
			flex-wrap: wrap-reverse;
			justify-content: flex-start;
			flex-direction: row;
			width: 100%;
			margin-left: 4px;
			img {
				object-fit: contain;
			}
		}
		.lead {
			place-self: center;
		}
		&.exhausted .tinyBar {
			opacity: 0.5;
		}
	}
	.group {
		background-color: rgb(150, 114, 10);
		color: rgb(255, 255, 255);
		box-shadow: rgb(150, 114, 10) 0px 0px 8px;
	}
	.selected {
		background-color: rgb(193, 146, 12);
		color: rgb(255, 255, 255);
		box-shadow: rgb(150, 114, 10) 0px 0px 8px;
	}
}
.slide-enter-active,
.slide-leave-active {
	transition: all 0.5s ease;
}
.slide-enter-from,
.slide-leave-to {
	transform: translateX(-100%);
}
.slide-enter-to,
.slide-leave-from {
	transform: translateX(0);
}
.opacity-enter-active {
	transition: all 0.3s ease-out;
}
.opacity-enter-from,
.opacity-leave-to {
	opacity: 0;
}
.opacity-enter-to,
.opacity-leave-from {
	opacity: 1;
}
</style>

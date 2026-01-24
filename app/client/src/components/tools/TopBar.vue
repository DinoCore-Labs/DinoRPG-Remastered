<template>
	<div id="topBar">
		<div class="boxRoot">
			<a v-if="uStore.isLogged" class="connectLink" @click="openLeftMenu()">
				<svg class="svgIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="AddIcon">
					<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"></path>
				</svg>
			</a>
		</div>
		<div class="boxRoot">
			<span class="time">{{ time }}</span>
		</div>
		<template v-if="!uStore.isLogged">
			<div class="boxRoot">
				<hr class="separator" />
				<a class="connectLink">
					<button class="connectBadge" @click="openRegisterMenu">{{ $t('topBar.createAccount') }}</button>
				</a>
				<hr class="separator" />
				<a class="connectLink">
					<button class="connectBadge" @click="openAuthMenu">{{ $t('topBar.login') }}</button>
				</a>
			</div>
		</template>
		<template v-else>
			<div class="boxRoot">
				<hr class="separator" />
				<button @click="openUserMenu" class="playerBadge">{{ $t('topBar.menu') }}</button>
				<!--
				span class="notifications" v-if="notification > 0">{{ notification }}</span>
    	-->
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventBus from '../../events';
import { userStore } from '../../store/userStore';
export default defineComponent({
	name: 'TopBar',
	components: {},
	setup() {
		const uStore = userStore();
		return { uStore };
	},
	data() {
		return {
			time: '' as string,
			timer: null as number | null
		};
	},
	methods: {
		openRegisterMenu() {
			eventBus.emit('authMenu', {
				show: true,
				mode: 'register'
			});
		},
		openAuthMenu() {
			eventBus.emit('authMenu', {
				show: true,
				mode: 'login'
			});
		},
		openUserMenu() {
			eventBus.emit('userMenu', true);
		},
		openLeftMenu() {
			eventBus.emit('leftUserMenu', true);
		},
		getTime(): void {
			const day = new Date();
			this.time = day.toLocaleTimeString('fr-FR', { timeZone: 'GMT' });
		}
	},
	mounted() {
		// Initial display
		this.getTime();
		// Update every second
		this.timer = window.setInterval(() => {
			this.getTime();
		}, 1000);
	},
	beforeUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}
});
</script>

<style scoped lang="scss">
.notifications {
	display: flex;
	flex-flow: wrap;
	-moz-box-pack: center;
	place-content: center;
	-moz-box-align: center;
	align-items: center;
	position: absolute;
	box-sizing: border-box;
	font-family: arial, sans-serif;
	font-weight: 500;
	font-size: 0.9rem;
	min-width: 20px;
	line-height: 1;
	padding: 0px 6px;
	height: 20px;
	border-radius: 10px;
	z-index: 1;
	transition: transform 225ms cubic-bezier(0.4, 0, 0.2, 1);
	background-color: rgb(46, 125, 50);
	color: rgb(255, 255, 255);
	top: 0px;
	right: 0px;
	transform: scale(1) translate(50%, -50%);
	transform-origin: 100% 0% 0px;
}
.connectBadge {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	outline: 0px;
	border: 0px;
	margin: 0px;
	cursor: pointer;
	user-select: none;
	vertical-align: middle;
	appearance: none;
	text-decoration: none;
	font-family: arial, sans-serif;
	font-weight: 500;
	font-size: 0.6rem;
	line-height: 1.75;
	text-transform: uppercase;
	border-radius: 4px;
	transition:
		background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
		border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		color 250ms cubic-bezier(0.4, 0, 0.2, 1);
	color: rgb(255, 255, 255);
	background-color: rgb(46, 125, 50);
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 3px 1px -2px,
		rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
	padding: 2px 8px;
	min-width: auto;
}
.separator {
	flex-shrink: 0;
	border-width: 0px thin 0px 0px;
	border-style: solid;
	height: auto;
	align-self: stretch;
	border-color: rgb(59, 65, 81);
	margin: 4px 8px 4px 0px;
}
.boxRoot {
	height: 32px;
	background-color: rgb(17, 19, 23);
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
		rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;
	color: rgb(183, 185, 198);
	display: flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: justify;
	justify-content: space-between;
	gap: 8px;
}
.connectLink {
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
	font-size: 1.2rem;
	padding: 8px;
	border-radius: 50%;
	overflow: visible;
	transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
	color: rgb(254, 125, 0);
}
.svgIcon {
	user-select: none;
	width: 0.8em;
	height: 0.8em;
	display: inline-block;
	fill: currentcolor;
	flex-shrink: 0;
	transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 2rem;
}
.playerLogged {
	position: relative;
	display: inline-flex;
	vertical-align: middle;
	flex-shrink: 0;
}
.playerBadge {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	background-color: transparent;
	outline: 0px;
	margin: 0px;
	cursor: pointer;
	user-select: none;
	vertical-align: middle;
	appearance: none;
	text-decoration: none;
	font-family: arial, sans-serif;
	font-weight: 500;
	font-size: 0.6rem;
	line-height: 1.75;
	text-transform: uppercase;
	min-width: 64px;
	padding: 3px 9px;
	border-radius: 4px;
	transition:
		background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
		border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		color 250ms cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid rgba(2, 136, 209, 0.5);
	color: rgb(2, 136, 209);
	&:hover {
		text-decoration: none;
		background-color: rgba(2, 136, 209, 0.04);
		border: 1px solid rgb(2, 136, 209);
	}
}
.time {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	font-size: 1rem;
	color: rgb(2, 136, 209);
	&:hover {
		text-decoration: none;
		background-color: rgba(2, 136, 209, 0.04);
		border: 1px solid rgb(2, 136, 209);
	}
}
#topBar {
	position: sticky;
	top: 0px;
	left: 0px;
	right: 0px;
	z-index: 100;
	height: 32px;
	background-color: rgb(17, 19, 23);
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
		rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;
	color: rgb(183, 185, 198);
	padding: 4px 8px;
	display: flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: justify;
	justify-content: space-between;
	gap: 8px;
	overflow: hidden;
}
</style>

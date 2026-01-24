<template>
	<Transition name="opacity">
		<div v-show="menuCalled" class="backDrop" @click="close()"></div>
	</Transition>
	<Transition name="slide">
		<div v-show="menuCalled" class="root">
			<div class="player">
				<div class="close">
					<button @click="close" class="burgerClose">
						<svg class="svgIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="MenuIcon">
							<path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"></path>
						</svg>
					</button>
				</div>
				<h2 class="name">{{ uStore.getUserName }}</h2>
			</div>
			<div class="shortCutMenu">
				<div class="shortCuts">
					<RouterLink class="link" :to="`/user`">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="PersonIcon">
							<path
								d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.account') }}</span>
					</RouterLink>
					<!--<div
						:class="{
							link: true
						}"
						@click="messagerie()"
					>
						<span v-if="playerStore.getNotifications.filter(n => n.severity === 'message').length > 0" class="badge">
							{{ playerStore.getNotifications.filter(n => n.severity === 'message').length }}
						</span>
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="PersonIcon">
							<path
								d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z"
							></path>
						</svg>
						<span>{{ $t('topBar.rightMenu.messagerie') }}</span>
					</div>
					<RouterLink v-if="playerStore.getClanId" class="link" :to="`/clan/${playerStore.getClanId}`">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path
								d="M21 9v2h-2V3h-2v2h-2V3h-2v2h-2V3H9v2H7V3H5v8H3V9H1v12h9v-3c0-1.1.9-2 2-2s2 .9 2 2v3h9V9zm-10 3H9V9h2zm4 0h-2V9h2z"
							></path>
						</svg>
						<span>{{ $t('topBar.rightMenu.clan') }}</span>
					</RouterLink>
					<RouterLink v-else class="link" to="/clans">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path
								d="M21 9v2h-2V3h-2v2h-2V3h-2v2h-2V3H9v2H7V3H5v8H3V9H1v12h9v-3c0-1.1.9-2 2-2s2 .9 2 2v3h9V9zm-10 3H9V9h2zm4 0h-2V9h2z"
							></path>
						</svg>
						<span>{{ $t('topBar.rightMenu.clans') }}</span>
					</RouterLink>-->
					<RouterLink class="link" to="/ingredients">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path
								d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2m-5 12H9v-2h6zm5-7H4V4l16-.02z"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.ingredients') }}</span>
					</RouterLink>
					<RouterLink class="link" to="/inventory">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path
								d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2m-5 12H9v-2h6zm5-7H4V4l16-.02z"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.items') }}</span>
					</RouterLink>
					<RouterLink
						class="link"
						:to="{
							name: 'RankingPlayers',
							params: { pageLoaded: 1 }
						}"
					>
						<svg
							class="svgLinkIcon"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="MilitaryTechIcon"
						>
							<path
								d="M17 10.43V2H7v8.43c0 .35.18.68.49.86l4.18 2.51-.99 2.34-3.41.29 2.59 2.24L9.07 22 12 20.23 14.93 22l-.78-3.33 2.59-2.24-3.41-.29-.99-2.34 4.18-2.51c.3-.18.48-.5.48-.86m-4 1.8-1 .6-1-.6V3h2z"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.ranking') }}</span>
					</RouterLink>
					<a class="link" href="https://gerardufoin.github.io/DinoRPG-Legacy-Paradino/">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="PersonIcon">
							<path
								d="m18 4 2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4z"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.cinema') }}</span>
					</a>
					<RouterLink class="link" to="/game">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path
								d="m23 12-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68zm-10 5h-2v-2h2zm0-4h-2V7h2z"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.news') }}</span>
					</RouterLink>
					<RouterLink class="link" to="/faq">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4z"></path>
							<path
								d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-5.99 13c-.59 0-1.05-.47-1.05-1.05 0-.59.47-1.04 1.05-1.04.59 0 1.04.45 1.04 1.04-.01.58-.45 1.05-1.04 1.05m2.5-6.17c-.63.93-1.23 1.21-1.56 1.81-.13.24-.18.4-.18 1.18h-1.52c0-.41-.06-1.08.26-1.65.41-.73 1.18-1.16 1.63-1.8.48-.68.21-1.94-1.14-1.94-.88 0-1.32.67-1.5 1.23l-1.37-.57C11.51 5.96 12.52 5 13.99 5c1.23 0 2.08.56 2.51 1.26.37.61.58 1.73.01 2.57"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.faq') }}</span>
					</RouterLink>
					<RouterLink class="link" to="/help">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 17h-2v-2h2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.guide') }}</span>
					</RouterLink>
					<!--
					<RouterLink class="link" to="/events">
						<svg class="svgLinkIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoIcon">
							<path d="M4 10v7h3v-7zm6 0v7h3v-7zM2 22h19v-3H2zm14-12v7h3v-7zm-4.5-9L2 6v2h19V6z"></path>
						</svg>
						<span>{{ $t('topBar.rightMenu.events') }}</span>
					</RouterLink>
					<RouterLink v-if="playerStore.isAdmin" class="link" to="/admin">
						<svg
							class="svgLinkIcon admin"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="InfoIcon"
						>
							<path
								d="m21 5-9-4-9 4v6c0 5.55 3.84 10.74 9 12 2.3-.56 4.33-1.9 5.88-3.71l-3.12-3.12c-1.94 1.29-4.58 1.07-6.29-.64-1.95-1.95-1.95-5.12 0-7.07 1.95-1.95 5.12-1.95 7.07 0 1.71 1.71 1.92 4.35.64 6.29l2.9 2.9C20.29 15.69 21 13.38 21 11z"
							></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
						<span>Admin</span>
					</RouterLink>
					<RouterLink v-if="playerStore.isAdmin" class="link" to="/forum">
						<svg
							class="svgLinkIcon admin"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="InfoIcon"
						>
							<path
								d="m21 5-9-4-9 4v6c0 5.55 3.84 10.74 9 12 2.3-.56 4.33-1.9 5.88-3.71l-3.12-3.12c-1.94 1.29-4.58 1.07-6.29-.64-1.95-1.95-1.95-5.12 0-7.07 1.95-1.95 5.12-1.95 7.07 0 1.71 1.71 1.92 4.35.64 6.29l2.9 2.9C20.29 15.69 21 13.38 21 11z"
							></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
						<span>Forum</span>
					</RouterLink>-->
					<RouterLink class="link" to="/" @click="logOff()">
						<svg
							class="svgLinkIcon logout"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="InfoIcon"
						>
							<path
								d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"
							></path>
						</svg>
						<span>{{ $t('topBar.userMenu.disconnect') }}</span>
					</RouterLink>
				</div>
			</div>
			<!--</div>
			<div class="notifications" v-if="notifications.length > 0">
				<div class="section">
					<span class="title">
						<span>{{ $t('topBar.rightMenu.notifications') }}</span>
					</span>
					<button @click="readAll()">{{ $t('topBar.rightMenu.readAll') }}</button>
				</div>

				<div
					:class="{
						notification: true,
						warning: notification.severity === 'warning',
						ban: notification.severity === 'ban'
					}"
					v-for="notification in notifications"
					:key="notification.id"
				>
					<div class="element">
						<span v-html="formatContent(notification.message)" />
					</div>
					<div class="element">
						<RouterLink v-if="notification.link" @click="cleanNotif(notification.id)" class="go" :to="notification.link"
							>Go</RouterLink
						>
						<a v-else @click="cleanNotif(notification.id)" class="go">OK</a>
					</div>
				</div>
			</div>
			<PlayerOptions v-if="playerStore.getPlayerId" />-->
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import { userStore } from '../../store/userStore.js';
import { UserService } from '../../services/user.service.js';

export default defineComponent({
	name: 'UserMenu',
	components: {},
	setup() {
		const uStore = userStore();
		return { uStore };
	},
	data() {
		return {
			menuCalled: false
		};
	},
	methods: {
		async logOff() {
			this.$toast.success(this.$t('topBar.userMenu.goodbye', { name: this.uStore.getUserName }));
			await UserService.logout();
			this.uStore.clearUser();
			this.menuCalled = false;
		},
		close() {
			this.menuCalled = false;
		}
		/*messagerie() {
			EventBus.emit('message', true);
		},
		async cleanNotif(id: string) {
			try {
				await NotificationService.readNotification(id);
				const notifications = this.playerStore.getNotifications.filter(n => n.id !== id);
				this.playerStore.setNotifications(notifications);
				this.playerStore.setNotificationsCounter(this.notifications.length - 1);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage ?? 'fr';

			// Formatter pour la date (jour, mois, année)
			const dateFormatter = new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short', year: 'numeric' });
			const formattedDate = dateFormatter.format(date);

			// Formatter pour l'heure (heure, minute, seconde)
			const timeFormatter = new Intl.DateTimeFormat(lang, {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
			const formattedTime = timeFormatter.format(date);

			// Combinaison date + heure
			return `${formattedDate}, ${formattedTime}`;
		},
		async readAll() {
			try {
				await NotificationService.readAllNotification();
				this.playerStore.setNotifications([]);
				this.playerStore.setNotificationsCounter(0);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		translateNotification(notification: Notification): translatedNotification | null {
			switch (notification.severity) {
				case 'message':
					return {
						id: notification.id,
						message: this.$t(`notification.message`),
						severity: notification.severity,
						link: notification.link,
						date: notification.date
					};
				case 'offerExpired':
					return {
						id: notification.id,
						message: this.$t(`notification.offerExpired`),
						severity: notification.severity,
						link: { name: 'MarketPage', params: { tab: 1 } },
						date: notification.date
					};
				case 'event':
					return {
						id: notification.id,
						message: this.$t(`notification.${notification.message}`),
						severity: notification.severity,
						link: notification.link,
						date: notification.date
					};
				case 'offerEnded':
					return {
						id: notification.id,
						message: this.$t(`notification.offerEnded`, JSON.parse(notification.message)),
						severity: notification.severity,
						link: { name: 'MarketPage', params: { tab: 1 } },
						date: notification.date
					};
				case 'offerWon':
					return {
						id: notification.id,
						message: this.$t(`notification.offerWon`, JSON.parse(notification.message)),
						severity: notification.severity,
						link: { name: 'MarketPage', params: { tab: 1 } },
						date: notification.date
					};
				case 'warning':
					const messageWarning = JSON.parse(notification.message);
					return {
						id: notification.id,
						message: this.$t(`notification.warning`, {
							reason: this.$t(`notification.reasons.${messageWarning.reason}`)
						}),
						severity: notification.severity,
						link: null,
						date: notification.date
					};
				case 'ban':
					const messageBan = JSON.parse(notification.message);
					return {
						id: notification.id,
						message: this.$t(`notification.ban`, {
							reason: this.$t(`notification.reasons.${messageBan.reason}`),
							date: this.formatDate(messageBan.banEndDate)
						}),
						severity: notification.severity,
						link: null,
						date: notification.date
					};
				case 'newClanApply':
					return {
						id: notification.id,
						message: this.$t(`notification.clanApply`, {
							name: notification.message
						}),
						severity: notification.severity,
						link: notification.link,
						date: notification.date
					};
				case 'scenario':
					const scenario_reward = JSON.parse(notification.message) as Rewarder[];

					const scenario_text = scenario_reward.map(r => {
						switch (r.rewardType) {
							default:
								return;
							case RewardEnum.SCENARIO:
								return (
									' ' +
									this.$t(`notification.rewardScenario`, {
										scenario: ' ' + this.$t(`scenario.${ScenarioDetails[r.value].name.toLocaleLowerCase()}`)
									})
								);
						}
					});

					return {
						id: notification.id,
						message: scenario_text.toString(),
						severity: notification.severity,
						link: null,
						date: notification.date
					};
				case 'reward':
					const reward = JSON.parse(notification.message) as Rewarder[];

					const text = reward.map(r => {
						switch (r.rewardType) {
							default:
								return;
							case RewardEnum.EPIC:
								return ' **' + this.$t(`rewards.name.${rewardList[r.value].name.toLocaleLowerCase()}`) + '**';
							case RewardEnum.ITEM:
								return (
									' ' + r.quantity + ' **' + this.$t(`item.name.${itemList[r.value].name.toLocaleLowerCase()}`) + '**'
								);
							case RewardEnum.GOLD:
								return ' **' + this.$t(`notification.rewardGold`, { quantity: r.value }) + '**';
						}
					});
					return {
						id: notification.id,
						message: this.$t(`notification.reward`, { rewards: text.toString() }),
						severity: notification.severity,
						link: null,
						date: notification.date
					};
				default:
					return null;
			}
		}*/
	},
	mounted() {
		EventBus.on('userMenu', async e => {
			this.menuCalled = e;
		});
	}
	/*,
	watch: {
		'playerStore.getNotifications': function (notifications: Notification[]) {
			this.notifications = notifications.map(notif => this.translateNotification(notif)).filter(n => n !== null);
		}
	}*/
});
</script>

<style scoped lang="scss">
.indice {
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
.badge {
	position: absolute;
	top: 5px;
	right: 13px;
	background: red;
	color: white;
	font-size: 10px;
	font-weight: bold;
	border-radius: 50%;
	padding: 1.5px 6px;
	text-align: center;
}
.notifications {
	display: flex;
	flex-direction: column;
	.section {
		background-color: rgb(15, 25, 36);
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
		.title {
			box-sizing: border-box;
			list-style: none;
			color: rgba(255, 255, 255, 0.7);
			font-family: arial, sans-serif;
			font-weight: 500;
			padding: 8px 16px;
			position: sticky;
			top: 0px;
			z-index: 1;
			line-height: inherit;
		}
		button {
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
			font-family: arial, sans-serif;
			font-weight: 500;
			font-size: 1.1rem;
			line-height: 1.75;
			text-transform: uppercase;
			min-width: 64px;
			padding: 4px 5px;
			border-radius: 4px;
			transition:
				background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
				box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
				border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
				color 250ms cubic-bezier(0.4, 0, 0.2, 1);
			color: rgb(254, 125, 0);
			&:hover {
				text-decoration: none;
				background-color: rgba(219, 191, 149, 0.04);
			}
		}
	}

	.notification {
		transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
		justify-content: space-between;
		gap: 5px;
		border-radius: 5px;
		margin: 0px 16px 8px;
		font-family: arial, sans-serif;
		font-weight: 400;
		line-height: 1.43;
		font-size: 1.2rem;
		background-color: transparent;
		display: flex;
		padding: 6px 12px;
		color: rgb(184, 231, 251);
		border: 1px solid rgb(79, 195, 247);
		box-shadow:
			rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
			rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
			rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;
		.element {
			display: flex;
			padding: 8px 0px;
			min-width: 0px;
			overflow: auto;
			max-width: 70%;
			align-items: center;
			.go {
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
				font-size: 1rem;
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
				max-height: 25px;
				&:hover {
					text-decoration: none;
					background-color: rgba(2, 136, 209, 0.04);
					border: 1px solid rgb(2, 136, 209);
				}
			}
		}
	}
	.warning {
		border: 1px solid rgb(255, 183, 77);
		color: rgb(255, 226, 183);
		.element {
			.go {
				border: 1px solid rgba(255, 167, 38, 0.5);
				color: rgb(255, 167, 38);

				&:hover {
					text-decoration: none;
					background-color: rgba(255, 167, 38, 0.08);
					border: 1px solid rgb(255, 167, 38);
				}
			}
		}
	}
	.ban {
		border: 1px solid rgb(255, 77, 77);
		color: rgb(255, 183, 183);
		.element {
			.go {
				border: 1px solid rgba(255, 38, 38, 0.5);
				color: rgb(255, 38, 38);

				&:hover {
					text-decoration: none;
					background-color: rgba(255, 38, 38, 0.08);
					border: 1px solid rgb(255, 38, 38);
				}
			}
		}
	}
}
.shortCutMenu {
	padding: 16px;
	background-color: rgb(29, 32, 40);
	.shortCuts {
		display: flex;
		-moz-box-pack: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 10px;
		.link {
			position: relative;
			display: flex;
			flex-direction: column;
			-moz-box-pack: center;
			justify-content: center;
			-moz-box-align: center;
			align-items: center;
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
				font-size: 2rem;
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
.name {
	margin: 0px;
	font-size: 29px;
	letter-spacing: -0.24px;
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
	right: 0px;
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
.slide-enter-active,
.slide-leave-active {
	transition: all 0.5s ease;
}
.slide-enter-from,
.slide-leave-to {
	transform: translateX(100%);
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

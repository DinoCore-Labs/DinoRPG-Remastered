<template>
	<Transition name="opacity">
		<div v-show="authMenuCalled" class="backDrop" @click="close"></div>
	</Transition>
	<Transition name="slide">
		<div v-show="authMenuCalled" class="root">
			<div class="menu">
				<div class="menu-close">
					<button @click="close" class="burgerClose">
						<svg class="svgIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="MenuIcon">
							<path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"></path>
						</svg>
					</button>
				</div>
				<h2 class="menu-name">
					{{ mode === 'register' ? $t('topBar.createAccount') : $t('topBar.login') }}
				</h2>
			</div>
			<div class="formWrapper">
				<form @submit.prevent="submitAccount">
					<label for="name">{{ $t('topBar.authMenu.name') }}</label>
					<input v-model="name" type="text" id="name" :placeholder="$t('topBar.authMenu.namePlaceholder')" />
					<div v-if="mode === 'register' && nameStatus" :class="nameStatus.available ? 'name-ok' : 'name-bad'">
						<template v-if="nameStatus.reason === 'ok'">{{ $t('topBar.authMenu.nameOk') }}</template>
						<template v-if="nameStatus.reason === 'taken'">{{ $t('topBar.authMenu.nameBad') }}</template>
					</div>
					<label for="password">{{ $t('topBar.authMenu.password') }}</label>
					<input
						v-model="password"
						type="password"
						id="password"
						:placeholder="$t('topBar.authMenu.passwordPlaceholder')"
					/>
					<div v-if="mode === 'register'" class="rulesAcceptance">
						<label class="rulesAcceptanceLabel">
							<input v-model="rulesAccepted" type="checkbox" />
							<i18n-t keypath="gameRules.registration.label" tag="span" scope="global">
								<template #rules>
									<RouterLink :to="{ name: 'RulesPage' }" target="_blank" @click.stop>
										{{ $t('gameRules.registration.link') }}
									</RouterLink>
								</template>
								<template #version>
									<strong>{{ gameRulesVersion }}</strong>
								</template>
							</i18n-t>
						</label>
					</div>
					<button type="submit" :disabled="!canSubmit">
						{{ mode === 'register' ? $t('topBar.createAccount') : $t('topBar.login') }}
					</button>
				</form>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventBus from '../../events';
import { UserService } from '../../services';
import { GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';

export default defineComponent({
	name: 'AuthMenu',
	data() {
		return {
			authMenuCalled: false,
			mode: 'register',
			name: '',
			password: '',
			nameStatus: null as null | { available: boolean; reason: string },
			debounceTimer: null as any,
			rulesAccepted: false,
			gameRulesVersion: GAME_RULES_VERSION
		};
	},
	computed: {
		canSubmit(): boolean {
			if (this.mode === 'login') return true;
			// mode register → pseudo dispo + password ok
			return (
				this.name.length >= 3 && this.password.length >= 6 && this.nameStatus?.available === true && this.rulesAccepted
			);
		}
	},
	methods: {
		close() {
			this.authMenuCalled = false;
		},
		async submitAccount() {
			try {
				if (this.mode === 'register') {
					await UserService.register(this.name, this.password, GAME_RULES_VERSION);
					this.$toast.success(this.$t('topBar.authMenu.accountCreatedWithSuccess'));
					this.close();
				} else {
					await UserService.login(this.name, this.password);
					this.$toast.success(this.$t('topBar.authMenu.welcomeBack', { name: this.name }));
					this.close();
					this.$router.push('/news');
				}
			} catch (e: any) {
				const msg = e.response?.data?.message ?? 'unknown';
				this.$toast.error(this.$t(`toast.${msg}`, { name: this.name }));
			}
		}
	},
	mounted() {
		eventBus.on('authMenu', e => {
			this.authMenuCalled = e.show;
			this.mode = e.mode; // "login" ou "register"
			if (e.show) {
				this.name = '';
				this.password = '';
				this.nameStatus = null;
				this.rulesAccepted = false;
				clearTimeout(this.debounceTimer);
			}
		});
	},
	watch: {
		name(newVal: string) {
			clearTimeout(this.debounceTimer);
			// ✅ pas de check en login (et si le menu n'est pas ouvert)
			if (!this.authMenuCalled || this.mode !== 'register') {
				this.nameStatus = null;
				return;
			}
			// ✅ évite de spammer l’API si trop court / vide
			const trimmed = newVal.trim();
			if (trimmed.length < 3) {
				this.nameStatus = null;
				return;
			}
			// Debounce 300ms pour éviter le spam
			this.debounceTimer = setTimeout(async () => {
				try {
					const result = await UserService.checkName(newVal);
					this.nameStatus = result; // { available, reason }
				} catch {
					this.nameStatus = null;
				}
			}, 300);
		},
		mode() {
			this.nameStatus = null;
			this.rulesAccepted = false;
			clearTimeout(this.debounceTimer);
		}
	}
});
</script>

<style scoped lang="scss">
.backDrop {
	position: fixed;
	display: flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	inset: 0px;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1;
	opacity: 1;
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
.menu {
	display: flex;
	-moz-box-align: stretch;
	align-items: stretch;
	color: rgb(255, 255, 255);
	&-close {
		display: flex;
		-moz-box-align: center;
		align-items: center;
		background-color: rgb(254, 181, 0);
	}
	&-name {
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
.svgIcon {
	user-select: none;
	width: 0.8em;
	display: inline-block;
	fill: currentcolor;
	flex-shrink: 0;
	transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 2rem;
}
.formWrapper {
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}
form {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
label {
	font-size: 14px;
	font-weight: 600;
	color: rgb(254, 181, 0);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}
input {
	width: 90%;
	padding: 10px 12px;
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	background-color: rgba(255, 255, 255, 0.05);
	color: rgb(230, 230, 230);
	font-size: 14px;
	transition:
		border-color 0.2s ease,
		background-color 0.2s ease;
	&::placeholder {
		color: rgba(255, 255, 255, 0.35);
	}
	&:focus {
		outline: none;
		border-color: rgb(254, 181, 0);
		background-color: rgba(255, 255, 255, 0.1);
	}
}
button[type='submit'] {
	margin-top: 10px;
	padding: 10px 12px;
	background-color: rgb(254, 125, 0);
	color: white;
	font-size: 15px;
	font-weight: 600;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: background-color 0.25s ease;
	&:hover {
		background-color: rgb(255, 150, 40);
	}
	&:active {
		background-color: rgb(230, 110, 0);
		transform: scale(0.98);
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}
.name-ok {
	color: #52ff70;
	font-size: 12px;
	margin-top: -10px;
}
.name-bad {
	color: #ff5252;
	font-size: 12px;
	margin-top: -10px;
}
.rulesAcceptance {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	margin-top: 4px;
}

.rulesAcceptanceLabel {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	color: rgb(183, 185, 198);
	font-size: 13px;
	font-weight: 400;
	line-height: 1.4;
	letter-spacing: normal;
	text-transform: none;
	cursor: pointer;

	input[type='checkbox'] {
		appearance: none;
		flex: 0 0 auto;
		display: grid;
		place-content: center;
		width: 20px;
		height: 20px;
		margin: 0;
		margin-top: 1px;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		background-color: rgba(255, 255, 255, 0.05);
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease,
			box-shadow 0.2s ease;

		&::before {
			width: 10px;
			height: 6px;
			border-bottom: 2px solid white;
			border-left: 2px solid white;
			content: '';
			transform: rotate(-45deg) scale(0);
			transition: transform 0.15s ease;
		}

		&:hover {
			border-color: rgba(254, 181, 0, 0.65);
			background-color: rgba(255, 255, 255, 0.1);
		}

		&:focus-visible {
			outline: none;
			border-color: rgb(254, 181, 0);
			box-shadow: 0 0 0 3px rgba(254, 181, 0, 0.15);
		}

		&:checked {
			border-color: rgb(254, 125, 0);
			background-color: rgb(254, 125, 0);

			&::before {
				transform: translateY(-1px) rotate(-45deg) scale(1);
			}
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	a {
		color: rgb(254, 181, 0);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;

		&:hover {
			color: rgb(255, 150, 40);
		}
	}
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

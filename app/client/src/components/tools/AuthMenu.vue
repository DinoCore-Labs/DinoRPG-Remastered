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
				<h2 class="menu-name">Créer un compte</h2>
			</div>
			<div class="formWrapper">
				<form @submit.prevent="submitAccount">
					<label for="name">Pseudo :</label>
					<input v-model="name" type="text" id="name" placeholder="votre pseudo" />

					<label for="password">Mot de passe :</label>
					<input v-model="password" type="password" id="password" placeholder="votre mot de passe" />

					<button type="submit">Créer le compte</button>
				</form>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventBus from '../../events';

export default defineComponent({
	name: 'AuthMenu',
	data() {
		return {
			authMenuCalled: false,
			name: '',
			password: ''
		};
	},
	methods: {
		close() {
			this.authMenuCalled = false;
		},
		submitAccount() {
			console.log('Pseudo', this.name);
			console.log('Mot de passe', this.password);
			// 🔥 API
		}
	},
	mounted() {
		eventBus.on('authMenu', async e => {
			this.authMenuCalled = e;
		});
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
	color: rgb(254, 181, 0); // ton jaune de header
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

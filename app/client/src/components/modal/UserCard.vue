<template>
	<div class="user-card" v-if="loadedUser">
		<RouterLink class="playerLink" :to="getProfileRoute(loadedUser.id)">
			{{ $t('userCard.title', { user: loadedUser.name }) }}
		</RouterLink>
		<span class="dashed"></span>
		<div class="grid-menu">
			<!--
			<a class="link-block" @click="sendMessage()">
				<img :src="getImgURL('icons', 'mail')" alt="sendMessage" /><br />
				{{ $t('playerMenu.gridMenu.sendMSG') }}
			</a>
			<a class="link-block">
				<img :src="getImgURL('icons', 'addContact')" alt="addContact" /><br />
				{{ $t('playerMenu.gridMenu.addContact') }}
			</a>
			-->
		</div>
		<!--
		<div class="report">
			<p @click="report()">{{ $t('playerMenu.report.signal') }}</p>
			<p>{{ $t('playerMenu.report.block') }}</p>
		</div>
		<span class="dashed"></span>
		<div class="profil">
			<div class="profil-info" v-if="loadedPlayer.customText">
				<div class="player-desc" v-html="loadedPlayer.customText"></div>
			</div>
			<p class="contact">{{ $t('playerMenu.contact') }}</p>
		</div>
		--></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { UserService } from '../../services';
import { errorHandler } from '../../utils/errorHandler.js';
import { userStore } from '../../store/userStore.js';
import type { UserData } from '@dinorpg/core/models/user/userData.js';
//import eventBus from '../../events/index.js';

export default defineComponent({
	name: 'UserCard',
	data() {
		return {
			loadedUser: undefined as undefined | Pick<UserData, 'id' | 'name'>
		};
	},
	props: {
		userId: {
			type: String,
			required: true
		}
	},
	methods: {
		leave() {
			this.$emit('leaveUserCard');
		},
		getProfileRoute(id: string) {
			const uStore = userStore();
			if (uStore.id === id) {
				return '/user';
			} else {
				return `/user/${id}`;
			}
		}
		/*sendMessage() {
			if (!this.loadedPlayer) return;
			EventBus.emit('message', true);
			EventBus.emit('messageToPlayer', { name: this.loadedPlayer.name, id: this.loadedPlayer.id });
		},
		report() {
			if (!this.loadedPlayer) return;
			EventBus.emit('report', this.loadedPlayer.id);
		}*/
	},
	async mounted() {
		try {
			this.loadedUser = await UserService.getToolTip(this.userId);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.user-card {
	background-color: #bc683c;
	font-size: 10px;
	font-weight: 700;
	border: 1px solid #845a45;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	border-radius: 4px;
	color: #f1e8e6;
	padding: 10px;
	position: absolute;
	top: 100%;
	left: 0;
	width: 245px;
	height: auto;
	z-index: 1000;
	.grid-menu {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 7px;
		justify-content: center;
	}
	.report {
		text-align: right;
		color: #f1e8e6;
		cursor: pointer;
		transition: background-color 0.3s;
		font-size: 9px;
		display: flex;
		flex-direction: column;
		& p {
			cursor: pointer;
			transition: color 0.3s;
		}
		& p:hover {
			color: #ff9200;
		}
	}
	.profil {
		display: flex;
		flex-direction: column;
		gap: 10px;
		.profil-info {
			display: flex;
			justify-content: space-between;
			& img {
				width: 50px;
				height: 50px;
				border-radius: 50%;
				position: relative;
				left: 10px;
			}
		}
		.contact {
			margin-top: 2px;
			background-color: #fff;
			color: #c2381a;
			padding: 4px;
			border: 1px solid #ccc;
			border-radius: 4px;
		}
	}
	.dashed {
		border-top: 1px dashed #ff9200;
		margin-top: 2px;
		display: block;
	}
}
.link-block {
	background-color: #79432b;
	font-size: 10px;
	cursor: pointer;
	border-radius: 4px;
	color: #f1e8e6;
	display: inline-block;
	height: 50px;
	margin: 0 1px 1px 0;
	overflow: hidden;
	padding: 5px 0;
	text-align: center;
	text-decoration: none;
	width: 72px;
	& img {
		vertical-align: center;
		width: 16px;
		height: 16px;
	}
	&:hover {
		background-color: #8c5a42;
		color: #f9e0c6;
	}
}
.playerLink {
	margin: 0 -10px;
	padding: 1px 10px;
	text-decoration: none;
	font-size: 10px;
	font-weight: 700;
	color: #f1e8e6;
	width: 100%;
	display: block;
	text-align: start;
	&:hover {
		background-color: #79432b;
	}
}
.player-desc {
	background-color: #79432b;
	border-radius: 4px;
	color: #fce3bb;
	font-weight: 400;
	font-size: 10px;
	margin-top: 10px;
	padding: 5px;
	word-break: break-word;
	&::before {
		border-bottom: 5px solid #79432b;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		content: ' ';
		display: inline-block;
		height: 0;
		left: 32px;
		margin-top: -9px;
		position: absolute;
		width: 0;
	}
}
</style>

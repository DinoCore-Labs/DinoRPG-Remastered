<template>
	<div class="user-container">
		<span
			:class="{
				'user-component': true,
				me: me,
				friend: friend
			}"
			@click="toggleMenu"
			v-click-outside="leave"
		>
			<img v-if="!leader" :src="getImgURL('icons', 'small_member')" :alt="user.name" />
			<img
				v-else
				:src="getImgURL('icons', 'crown')"
				alt="rank"
				v-tippy="{
					content: formatContent($t('clan.icons.crown')),
					theme: 'small'
				}"
			/>
			<span>{{ truncateUsername(user.name) }}</span>
		</span>
		<UserCard v-if="seeUser" :userId="user.id" />
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import UserCard from '../modal/UserCard.vue';
import type { UserData } from '@dinorpg/core/models/user/UserData';

export default defineComponent({
	name: 'DZUser',
	components: {
		UserCard
	},
	props: {
		user: {
			type: Object as PropType<Pick<UserData, 'id' | 'name'>>,
			required: true
		},
		me: {
			type: Boolean,
			default: false
		},
		friend: {
			type: Boolean,
			default: false
		},
		leader: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			seeUser: false
		};
	},
	methods: {
		toggleMenu() {
			this.seeUser = !this.seeUser;
		},
		leave() {
			this.seeUser = false;
		},
		truncateUsername(name: string) {
			if (name.length > 16) {
				return name.slice(0, 14) + '...';
			} else {
				return name;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.user-container {
	position: relative;
	display: inline-block;
}
.user-component {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 9pt;
	line-height: 7pt;
	background-color: #c2381a;
	border-top: 1px solid #ff9200;
	box-shadow: 0px 0px 2px #000000;
	color: white;
	border-radius: 4px;
	padding: 2px 4px;
	cursor: pointer;
	user-select: none;
	&:hover {
		background-color: #e04b2b;
	}
	img {
		margin-right: 4px;
	}
}
.me {
	background-color: #7a261b;
	&:hover {
		background-color: #7c3d34;
	}
	& > * {
		animation: brightness 3s infinite;
		-webkit-animation: brightness 3s infinite;
	}
}
@keyframes brightness {
	0%,
	100% {
		-webkit-filter: brightness(80%);
	}
	50% {
		-webkit-filter: brightness(120%);
	}
}
@-webkit-keyframes brightness {
	0%,
	100% {
		-webkit-filter: brightness(80%);
	}
	50% {
		-webkit-filter: brightness(120%);
	}
}
</style>

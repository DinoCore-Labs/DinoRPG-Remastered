<template>
	<div class="fighters-header" v-if="leftPlayer || rightPlayer">
		<div class="player">
			<span class="title">{{ $t(`fight.player`) }}</span>

			<div v-if="leftPlayer">
				<DZUser :user="leftPlayer" />
			</div>
			<span class="null-name" v-else> ??? </span>
		</div>

		<span class="vs">{{ $t(`fight.vs`) }}</span>

		<div class="player">
			<span class="title">{{ $t(`fight.player`) }}</span>
			<div v-if="rightPlayer">
				<DZUser :user="rightPlayer" />
			</div>
			<span class="null-name" v-else> ??? </span>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import DZUser from '../utils/DZUser.vue';

export default defineComponent({
	name: 'FightersHeader',
	components: {
		DZUser
	},
	props: {
		leftPlayer: {
			type: Object as PropType<Pick<UserProfile, 'id' | 'name'> | null>
		},
		rightPlayer: {
			type: Object as PropType<Pick<UserProfile, 'id' | 'name'> | null>
		}
	},
	methods: {}
});
</script>

<style scoped lang="scss">
.fighters-header {
	padding: 10px 20px;
	box-sizing: border-box;
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	justify-content: space-between;
	align-items: center;
	background: linear-gradient(#f3d39b, #e9c07c);
	font-size: 15px;
}
.player {
	display: flex;
	align-items: center;
	flex: 1;
	width: 0;
	justify-content: center;
	text-align: center;
}
.null-name {
	color: #8b2f1c;
	font-weight: bold;
}
.title {
	color: #6b3e1d;
	font-weight: bold;
	margin-right: 5px;
	flex-shrink: 0;
}
.vs {
	color: #6b3e1d;
	font-weight: bold;
	margin: 0 20px;
	flex-shrink: 0;
}
</style>

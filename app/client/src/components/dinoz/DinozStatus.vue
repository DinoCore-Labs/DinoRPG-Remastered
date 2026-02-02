<template>
	<div class="fx" @click="displayStatus = !displayStatus">
		<p>{{ $t('dinozPage.fx') }}</p>
		<div class="status" :class="displayStatus ? 'displayMe' : ''">
			<template v-for="(status, index) in dinozStatus" :key="index">
				<Tippy theme="normal" v-if="statusList.displayed[status.statusId]">
					<img
						:src="getImgURL('status', `fx_${statusList.imgName[status.statusId]}`)"
						:alt="statusList.imgName[status.statusId]"
					/>
					<template #content>
						<h1 v-html="formatContent($t(`status.name.${status.statusId}`))"></h1>
						<p v-html="formatContent($t(`status.description.${status.statusId}`))"></p>
					</template>
				</Tippy>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { statusList } from '../../constants/status';
import type { DinozStatusLite } from '@dinorpg/core/models/dinoz/dinozStatus.js';

export default defineComponent({
	name: 'DinozStatus',
	data() {
		return {
			statusList: statusList,
			displayStatus: false as boolean
		};
	},
	props: {
		dinozStatus: Array as PropType<DinozStatusLite[]>
	}
});
</script>

<style lang="scss" scoped>
.fx {
	grid-area: status;
	justify-self: stretch;
	display: flex;
	flex-direction: column;
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x,
		url('../../assets/background/banniere_right.webp') no-repeat;
	background-position-x: left, center, right;
	background-size: auto;
	box-shadow: inset 0 0 1px 2px #d3a76a;
	border-style: hidden solid solid solid;
	border-width: 0 1px 1px 1px;
	border-color: #9f5841;
	p {
		color: white;
		padding-left: 2px;
		font-size: 7.5pt;
		text-shadow: 0.5px 0 1px grey;
		text-transform: uppercase;
		font-family: 'Trebuchet MS', Arial, sans-serif;
		font-weight: bold;
		margin-top: 1.2px;
	}
	img {
		border: 1px solid transparent;
		border-radius: 5px;
		&:hover {
			border-color: white;
		}
	}
	.status {
		background: linear-gradient(180deg, rgba(186, 107, 66, 1) 0%, rgba(211, 152, 96, 1) 100%);
		display: flex;
		flex-wrap: wrap;
		height: 100%;
		align-content: baseline;
	}
}
@media (max-width: 539px) {
	.fx {
		width: calc(100% - 2px);
		cursor: pointer;
		.status {
			display: none;
			width: 100%;
		}
		.displayMe {
			display: flex;
		}
	}
}
</style>

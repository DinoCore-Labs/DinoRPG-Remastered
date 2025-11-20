<template>
	<div id="accountList">
		<div class="money">
			{{ beautifulNumber(15845454500) }}
			<img :src="getImgURL('icons', 'gold')" alt="or" />
		</div>
		<div class="iconMenu">
			<RouterLink to="/shop/flying" class="link">
				<img :src="getImgURL('icons', 'act_boutique')" alt="shop" />
			</RouterLink>
			<RouterLink :to="`/clan/`" class="link">
				<img :src="getImgURL('icons', 'act_castle')" alt="dojo" />
			</RouterLink>
			<RouterLink class="link" :to="`/dojo`">
				<img :src="getImgURL('icons', 'act_dojo')" alt="dojo" />
			</RouterLink>
		</div>
		<div class="place">
			<div class="img-wrapper">
				<!--<img :src="getPlaceImage(place)" :alt="$t(`place.name.${place}`)" />-->
			</div>
			<p class="place-name">Dinoville</p>
		</div>
		<!--
    <DinozList :currentDinozId="currentDinozId()"></DinozList>
		<a v-if="hasPDA" class="overviewButton" @click="goToPage('ManageDinoz')">
			<img :src="getImgURL('icons', `small_edit`)" alt="edit" />
			<span>{{ $t('button.sortDinoz') }}</span>
		</a>
		<a v-if="hasPMI" class="overviewButton" @click="goToPage('DinozMissions')">
			<img :src="getImgURL('icons', `small_right`)" alt="missions" />
			<span>{{ $t('button.dinozMissions') }}</span>
		</a>
		<a v-if="hasPAC" class="overviewButton" @click="goToPage('SkillTrees')">
			<img :src="getImgURL('icons', `clipboard`)" alt="skills" />
			<span>{{ $t('button.skills') }}</span>
		</a>
		<a class="button" @click="goToPage('DinozShopPage')">
			{{ $t('button.buyDinoz') }}
		</a>
    -->
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getImgURL } from '../../utils/getImgURL';
import { beautifulNumber } from '../../utils/beautifulNumber';

export default defineComponent({
	name: 'LeftPanel',
	data() {},
	components: {},
	methods: {
		beautifulNumber,
		getImgURL
	}
});
</script>

<style lang="scss" scoped>
.link {
	display: flex;
	flex-direction: column;
	-moz-box-pack: center;
	justify-content: center;
	-moz-box-align: center;
	align-items: center;
	cursor: pointer;
	&:hover {
		filter: brightness(130%);
	}
}
.overviewButton {
	color: #8e3e26;
	font-variant: small-caps;
	font-weight: bold;
	display: flex;
	align-items: center;
	margin-bottom: 1px;
	padding-top: 1px;
	padding-bottom: 1px;
	padding-left: 5px;
	font-size: 8pt;
	line-height: 10pt;
	text-decoration: none;
	border: 1px solid #d69e68;
	border-radius: 0px;
	-webkit-border-radius: 0px;
	cursor: pointer;
	img {
		width: 8px;
		padding-right: 3px;
	}
	&:hover {
		color: #d69e68;
	}
}
#accountList {
	grid-area: left;
	justify-self: end;
	margin-top: 20px;
	margin-right: 20px;
	max-width: min-content;
	display: flex;
	flex-direction: column;
	.namePlace {
		text-align: center;
		font-size: 9pt;
		text-transform: none;
		letter-spacing: 0pt;
		color: #8e3a20;
	}
	.money {
		margin: 10px;
		width: 137px;
		height: 25px;
		margin-bottom: 34px;
		padding: 0px;
		padding-top: 6px;
		margin-left: -5px;
		text-align: center;
		font-size: 10pt !important;
		color: #ffee92;
		border: 0px;
		background-color: transparent;
		background-image: url('../../assets/background/goldbox.webp');
		background-repeat: no-repeat;
		cursor: help;
		font-weight: bold;

		img {
			vertical-align: -5%;
		}
	}
	.iconMenu {
		width: 143px;
		height: 32px;
		margin-bottom: 10px;
		display: flex;
		justify-content: space-evenly;
		&:hover {
			cursor: pointer;
		}
	}
}
@media (max-width: 875px) {
	#accountList {
		display: none;
	}
}
.place {
	padding: 2px;
	background-color: #fbdca5;
	margin-bottom: 8px;
	cursor: pointer;

	.img-wrapper {
		height: 109px;
		overflow: hidden;
		width: 140px;

		img {
			width: 100%;
			border: 1px solid #9a4029;
			box-sizing: border-box;
		}
	}

	.place-name {
		color: #bc683c;
		text-align: center;
		font-size: 9pt;
		font-style: italic;

		&:first-letter {
			font-weight: normal;
			font-size: 9pt;
		}
	}
}
</style>

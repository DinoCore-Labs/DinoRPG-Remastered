<template>
	<TitleHeader :title="$t('pageTitle.admin')"></TitleHeader>
	<ul class="tabs" style="margin-top: 10px">
		<li :class="{ active: $route.path.startsWith('/admin/jobs') }">
			<RouterLink to="/admin/jobs">Jobs</RouterLink>
		</li>
	</ul>
	<RouterView />
</template>

<script lang="ts">
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Admin',
	components: {
		TitleHeader
	},
	data() {},
	methods: {}
});
</script>

<style lang="scss" scoped>
.red {
	color: red;
}
.tabs {
	list-style: none;
	height: 20px;
	align-self: center;
	background-color: transparent;
	background-image: url('../assets/design/tabs/tabsBg.webp');
	background-repeat: no-repeat;
	border-bottom: 1.2px solid #ffe7aa;
	li {
		float: left;
		position: relative;
		margin-right: 5px;
		&.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
		a {
			color: #fce3bc;
			text-decoration: none;
			padding-left: 5px;
			padding-right: 5px;
			background-color: #bc683c;
			border-right: 1px solid black;
			border-left: 1px solid #d39a65;
			border-top: 1px solid #d39a65;
			font-size: 10pt;
			border-radius: 0px;
		}
	}
}
</style>

<template>
	<TitleHeader :title="$t('pageTitle.admin')"></TitleHeader>

	<ul class="tabs" style="margin-top: 10px">
		<li>
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
	data() {
		return {
			tabSelected: 1 as number
			//AdminRole: AdminRole
		};
	},
	methods: {
		//playerStore,
		async setTab(value: number): Promise<void> {
			this.tabSelected = value;
		}
	}
	/*async mounted(): Promise<void> {
		if (!(playerStore().getRole === AdminRole.ADMIN || playerStore().getRole === AdminRole.AMPHI)) {
			this.$router.push({
				name: 'News'
			});
		}
		try {
			await AdminService.getDashBoard();
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}*/
});
</script>

<style lang="scss" scoped>
.active {
	background-color: #f3ca92;
	color: #710;
	padding: 4px;
}
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
input[type='text'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
input[type='submit'] {
	margin-top: 20px;
	background-color: #c64e36;
	color: #fffdba;
	border: 1px solid #c64e36;
	padding: 5px 20px;
	cursor: pointer;
}
</style>

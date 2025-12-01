<template>
	<div
		:class="{
			search: true,
			background: background
		}"
	>
		<input :id="entityType" type="text" :placeholder="$t(placeHolder)" v-model="searchValue" list="entities" />
		<div>
			<div
				class="entitySearchResultsContainer"
				:class="{ show: entityList.length > 0, hide: entityList.length <= 0 }"
				:key="entityList.length"
			>
				<div
					class="entities"
					v-for="(entity, index) in entityList"
					:key="index"
					@click="
						$emit('entity', entity);
						entityList = [];
						searchValue = undefined;
					"
				>
					<span>{{ entity.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import type { EntitySearch } from '@dinorpg/core/models/utils/EntitySearch';
import { defineComponent } from 'vue';
import { UserService } from '../../services/index.js';

export default defineComponent({
	name: 'DZSearch',
	props: {
		entityType: { type: String, required: true }, // 'user' or 'clan'
		placeHolder: { type: String, required: true },
		background: { type: Boolean, default: false }
	},
	data() {
		return {
			searchValue: undefined as string | undefined,
			entityList: [] as Array<EntitySearch>,
			awaitingSearch: false as boolean
		};
	},
	emits: ['entity'],
	methods: {
		async getResults(): Promise<void> {
			if (this.searchValue && this.searchValue.length >= 3) {
				if (this.entityType === 'user') {
					this.entityList = await UserService.search(this.searchValue);
				} /*else if (this.entityType === 'clan') {
					this.entityList = await ClanService.searchClans(this.searchValue);
				} */
			} else {
				this.entityList = [];
			}
		}
	},
	watch: {
		searchValue(): void {
			if (!this.awaitingSearch) {
				setTimeout(() => {
					this.getResults();
					this.awaitingSearch = false;
				}, 700); // 0.7 sec delay
			}
			this.awaitingSearch = true;
		}
	}
});
</script>

<style scoped lang="scss">
input {
	background-color: #b05733;
	outline: 1px solid transparent;
	outline-offset: 2px;
	border: none;
	padding-left: 4px;
	font-weight: 400;
	font-size: 16px;
	color: #ffee92;
	height: 100%;
	&:focus {
		transition: outline-color 0.5s;
		outline-color: #efdba8;
	}
}
.search {
	display: flex;
	flex-direction: column;
	width: max-content;
	height: auto;
	position: relative;
	.entitySearchResultsContainer {
		flex-direction: column;
		max-height: calc(32px * 5);
		position: absolute;
		background: #5c2b20;
		border: 1px solid #ddab76;
		box-shadow: 0 0 3px #000;
		display: block;
		margin: 2px 0 0;
		outline: 1px solid #000;
		overflow: auto;
		width: calc(100% - 2px);
		z-index: 1;
	}
	.entities {
		height: 32px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 3px;
		background-color: rgb(174 97 57);
		&::after {
			content: ' ';
			border: 1px #ddab76;
			border-top-style: dotted;
			width: calc(100% - 2px);
		}
		&:hover {
			transition: outline-color 0.5s;
			outline-color: #efdba8;
			cursor: pointer;
			background-color: rgb(203 124 73);
		}
	}
	.hide {
		opacity: 0;
		height: 0;
		transition: all 0.5s ease;
	}
	.show {
		opacity: 1;
		height: auto;
		transition: height 2s ease;
	}
}
.background {
	background-image: url('../../assets/background/form_field.webp');
	align-self: center;
	background-repeat: no-repeat;
	border: none;
	color: #fce3bc;
	width: 200px;
	height: 22px;
	&:focus {
		transition: outline-color 0.5s;
		outline-color: #efdba8;
	}
	input {
		background: none;
		margin-left: 5px;
		outline: 1px solid transparent;
		outline-offset: 0;
		border: none;
		padding-left: 0;
		font-weight: 400;
		font-size: 16px;
		color: #ffee92;
		height: 100%;
	}
	.entitySearchResultsContainer {
		flex-direction: column;
		max-height: calc(32px * 5);
		position: absolute;
		background: #5c2b20;
		border: 1px solid #ddab76;
		box-shadow: 0 0 3px #000;
		display: block;
		margin: 2px 0 0;
		outline: 1px solid #000;
		overflow: auto;
		width: calc(100% - 2px);
		z-index: 1;
	}
}
</style>

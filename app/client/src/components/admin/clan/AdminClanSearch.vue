<template>
	<div class="search">
		<DZSelect
			id="admin-clan-search"
			v-model="selectedClanId"
			:search="searchClans"
			:placeholder="$t('button.search')"
			@change="handleChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';
import { AdminClanService } from '../../../services/adminClan.service';

const emit = defineEmits<{
	(e: 'select', value: string): void;
}>();

const selectedClanId = ref<string | undefined>(undefined);

async function searchClans(query: string): Promise<SelectOption<string>[]> {
	if (query.length < 2) {
		return [];
	}

	const results = await AdminClanService.search(query);

	return results.map(clan => ({
		value: String(clan.id),
		label: `${clan.name} (ID: ${clan.id})`
	}));
}

function handleChange(option: SelectOption<string> | undefined) {
	if (!option) return;
	emit('select', option.value);
}
</script>

<style scoped lang="scss">
.search {
	display: flex;
	align-items: center;
	gap: 10px;
}
</style>

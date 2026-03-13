<template>
	<div class="search">
		<DZSelect
			id="admin-user-search"
			v-model="selectedUserId"
			:search="searchUsers"
			:placeholder="$t('button.search')"
			@change="handleChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';
import { UserService } from '../../../services';

const emit = defineEmits<{
	(e: 'select', value: string): void;
}>();

const selectedUserId = ref<string | undefined>(undefined);

async function searchUsers(query: string): Promise<SelectOption<string>[]> {
	if (query.length < 3) {
		return [];
	}

	const results = await UserService.search(query);

	return results.map(user => ({
		value: String(user.id),
		label: `${user.name} (${String(user.id).slice(0, 6)})`
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

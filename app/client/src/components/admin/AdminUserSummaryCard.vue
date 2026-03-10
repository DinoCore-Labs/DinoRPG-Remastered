<template>
	<div class="card">
		<div class="card-container">
			<h2>{{ user.name }}</h2>
			<p><strong>ID :</strong> {{ user.id }}</p>
			<p><strong>Rôle :</strong> {{ user.role }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';

defineProps<{
	user: AdminUserDetails;
}>();
</script>

<style scoped lang="scss">
.card {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	border-spacing: 2px;
	padding: 5px;
	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
	}
}
</style>

<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<div class="user">
					<img v-if="user.profile?.avatar" class="avatar" :src="`data:image/png;base64,${user.profile.avatar}`" />
					<h2>{{ user.name }}</h2>
				</div>
				<p><strong>ID :</strong> {{ user.id }}</p>
				<p><strong>Rôle :</strong> {{ user.role }}</p>
				<p><strong>Dernière connexion :</strong> {{ formatDate(user.lastLogin) }}</p>
				<p><strong>Langue :</strong> {{ user.profile?.language ?? '—' }}</p>
				<p><strong>Age :</strong> {{ user.profile?.age ?? '—' }}</p>
				<p v-if="user.profile?.description"><strong>Description :</strong> {{ user.profile.description }}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';

defineProps<{
	user: AdminUserDetails;
}>();
function formatDate(date: Date) {
	return new Date(date).toLocaleString();
}
</script>

<style scoped lang="scss">
.card {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	padding: 5px;
	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
	}
	.user {
		display: flex;
		gap: 10px;
	}
	.avatar {
		border-radius: 50%;
		width: 70px;
		height: auto;
	}
}
</style>

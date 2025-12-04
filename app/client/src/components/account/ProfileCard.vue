<template>
	<div class="profile-card">
		<!-- ===================== -->
		<!--        MODE EDIT      -->
		<!-- ===================== -->
		<div v-if="editing" class="edit-mode">
			<!-- Avatar -->
			<div class="avatar-section">
				<img v-if="previewAvatar" :src="previewAvatar" class="avatar" alt="avatar" />
				<img v-else-if="profile.avatar" :src="profile.avatar" class="avatar" alt="avatar" />
				<div v-else class="avatar placeholder"></div>

				<label class="avatar-upload">
					<input type="file" accept="image/*" @change="onAvatarSelect" />
					{{ $t('accountPage.changeAvatar') }}
				</label>
			</div>

			<!-- Form -->
			<div class="form-section">
				<select v-model="form.language">
					<option value="FR">🇫🇷 Français</option>
					<option value="EN">🇬🇧 English</option>
					<option value="ES">🇪🇸 Español</option>
					<option value="DE">🇩🇪 Deutsch</option>
				</select>

				<select v-model="form.gender">
					<option value="MALE">{{ $t('accountPage.gender_male') }}</option>
					<option value="FEMALE"></option>
					<option value="OTHER"></option>
				</select>

				<input type="number" v-model="form.age" min="1" max="120" placeholder="Age" />

				<textarea v-model="form.description" maxlength="500" placeholder="Description..."></textarea>
			</div>

			<!-- Buttons -->
			<div class="buttons">
				<button class="btn save" @click="saveProfile">
					{{ $t('accountPage.save') }}
				</button>
				<button class="btn cancel" @click="cancelEdit">
					{{ $t('accountPage.cancel') }}
				</button>
			</div>
		</div>

		<!-- ===================== -->
		<!--     MODE LECTURE     -->
		<!-- ===================== -->
		<div v-else class="view-mode">
			<div class="view-mode-profile">
				<!-- Avatar -->
				<div class="avatar-section">
					<img v-if="profile.avatar" :src="profile.avatar" class="avatar" alt="avatar" />
					<div v-else class="avatar placeholder"></div>
				</div>
				<!-- Info -->
				<div class="info">
					<h2>{{ profile.name }}</h2>

					<div class="tags">
						<span v-if="profile.language">🌍 {{ profile.language }}</span>
						<span v-if="profile.gender === 'MALE'">{{ $t('accountPage.gender_male') }}</span>
						<span v-if="profile.gender === 'FEMALE'">♀ Femme</span>
						<span v-if="profile.gender === 'OTHER'">⚪ Autre</span>
						<span v-if="profile.age">🎂 {{ profile.age }} ans</span>
					</div>
				</div>
			</div>
			<div class="view-mode-description">
				<p v-if="profile.description" class="description-text">
					{{ profile.description }}
				</p>
				<p v-else class="description-text empty">
					{{ $t('accountPage.noDescription') }}
				</p>
			</div>
			<!-- Button Modifier -->
			<button v-if="isOwner" class="btn edit" @click="editing = true">✏️ {{ $t('accountPage.editProfile') }}</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue';
import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import { UserService } from '../../services';

export default defineComponent({
	name: 'ProfileCard',

	props: {
		profile: { type: Object as PropType<UserProfile>, required: true },
		isOwner: { type: Boolean, required: true }
	},

	emits: ['updated'],

	setup(props, { emit }) {
		const editing = ref(false);

		const form = ref({
			description: props.profile.description ?? '',
			language: props.profile.language ?? '',
			gender: props.profile.gender ?? '',
			age: props.profile.age ?? null
		});

		const previewAvatar = ref<string | null>(null);

		// Sync when profile changes
		watch(
			() => props.profile,
			p => {
				form.value = {
					description: p.description ?? '',
					language: p.language ?? '',
					gender: p.gender ?? '',
					age: p.age ?? null
				};
				previewAvatar.value = null;
				editing.value = false;
			}
		);

		async function onAvatarSelect(event: Event) {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) return;

			previewAvatar.value = URL.createObjectURL(file);

			const updated = await UserService.uploadAvatar(file);
			emit('updated', updated);
		}

		async function saveProfile() {
			const updated = await UserService.updateProfile({
				description: form.value.description,
				language: form.value.language as any,
				gender: form.value.gender as any,
				age: form.value.age ? Number(form.value.age) : null
			});

			editing.value = false;
			emit('updated', updated);
		}

		function cancelEdit() {
			editing.value = false;
			previewAvatar.value = null;
			form.value = {
				description: props.profile.description ?? '',
				language: props.profile.language ?? '',
				gender: props.profile.gender ?? '',
				age: props.profile.age ?? null
			};
		}

		return {
			form,
			editing,
			previewAvatar,
			onAvatarSelect,
			saveProfile,
			cancelEdit
		};
	}
});
</script>

<style lang="scss" scoped>
.profile-card {
	padding: 4 8px;
	width: 100%;
	margin: auto;
	display: flex;
	flex-direction: column;
	gap: 20px;
	background-color: rgb(17, 19, 23);
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
		rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;
	color: rgb(183, 185, 198);
}

/* AVATAR */
.avatar-section {
	display: flex;
	justify-content: center;
}

.avatar {
	width: 110px;
	height: 110px;
	object-fit: cover;
	border: 3px solid #fff3;
}

.avatar.placeholder {
	width: 110px;
	height: 110px;
	background: #333;
	border: 3px solid #444;
}

/* VIEW MODE */
.view-mode .info {
	text-align: center;
}

.tags {
	margin-top: 8px;
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
	opacity: 0.9;
}

.description-text {
	margin-top: 10px;
	padding: 10px;
	background: #1c1c1c;
	border-radius: 6px;
	font-size: 14px;
	font-style: italic;
}

.description-text.empty {
	opacity: 0.5;
	font-style: italic;
}

/* EDIT MODE */
.form-section {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

textarea,
select,
input {
	background: #1c1c1c;
	border: none;
	color: white;
	padding: 8px;
	border-radius: 6px;
}

/* BUTTONS */
.btn {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	background-color: transparent;
	outline: 0px;
	margin: 0px;
	cursor: pointer;
	user-select: none;
	vertical-align: middle;
	appearance: none;
	text-decoration: none;
	font-family: arial, sans-serif;
	font-weight: 500;
	font-size: 0.6rem;
	line-height: 1.75;
	text-transform: uppercase;
	min-width: 64px;
	padding: 3px 9px;
	border-radius: 4px;
	transition:
		background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
		border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		color 250ms cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid rgba(2, 136, 209, 0.5);
	color: rgb(2, 136, 209);
}

.btn.save {
	background: #0072ff;
}

.btn.cancel {
	background: #555;
}

.view-mode {
	display: flex;
	flex-direction: column;
	gap: 20px;
	justify-content: space-between;
	padding: 20px;
	&-profile {
		display: flex;
		justify-content: space-between;
	}
}
</style>

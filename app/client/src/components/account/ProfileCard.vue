<template>
	<div class="profile-card">
		<!-- ===================== -->
		<!--        MODE EDIT      -->
		<!-- ===================== -->
		<div v-if="editing" class="edit-mode">
			<!-- Avatar -->
			<div class="avatar-edit">
				<div class="avatar-wrapper">
					<img v-if="previewAvatar" :src="previewAvatar" class="avatar-image" />
					<img v-else-if="profile.avatar" :src="profile.avatar" class="avatar-image" />
					<div v-else class="avatar-placeholder">?</div>
				</div>
				<label class="avatar-button">
					{{ $t('accountPage.changeAvatar') }}
					<input type="file" accept="image/*" @change="onAvatarSelect" />
				</label>
			</div>
			<!-- Form -->
			<div class="edit-form">
				<select v-model="form.language">
					<option value="FR">🇫🇷 Français</option>
					<option value="EN">🇬🇧 English</option>
					<option value="ES">🇪🇸 Español</option>
					<option value="DE">🇩🇪 Deutsch</option>
				</select>
				<select v-model="form.gender">
					<option value="MALE">{{ $t('accountPage.gender_male') }}</option>
					<option value="FEMALE">{{ $t('accountPage.gender_female') }}</option>
					<option value="OTHER">{{ $t('accountPage.gender_other') }}</option>
				</select>
				<input type="number" v-model="form.age" min="1" max="120" placeholder="Age" />
				<textarea v-model="form.description" maxlength="500" placeholder="Description..."></textarea>
			</div>

			<!-- Buttons -->
			<div class="buttons-edit">
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
						<span v-if="profile.gender === 'MALE'"><img :src="getImgURL('icons', 'male')" alt="Male" /></span>
						<span v-if="profile.gender === 'FEMALE'"><img :src="getImgURL('icons', 'female')" alt="Female" /></span>
						<span v-if="profile.gender === 'OTHER'"></span>
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
/* EDIT MODE */
.edit-mode {
	padding: 20px;
}
// Avatar => Edit-mode
.avatar-edit {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}
.avatar-wrapper {
	width: 110px;
	height: 110px;
	border-radius: 50%;
	overflow: hidden;
	border: 3px solid #444;
	display: flex;
	align-items: center;
	justify-content: center;
}
.avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.avatar-placeholder {
	width: 100%;
	height: 100%;
	background: #222;
	color: #999;
	font-size: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-weight: bold;
}
.avatar-button {
	background: #2c2c2c;
	color: #eee;
	padding: 6px 12px;
	border-radius: 4px;
	cursor: pointer;
	font-size: 12px;
	border: 1px solid rgba(2, 136, 209, 0.5);
	color: rgb(2, 136, 209);
	position: relative;
	&:hover {
		background: #3a3a3a;
	}
	input {
		opacity: 0;
		width: 0;
		height: 0;
		position: absolute;
	}
}
// Form => Edit-mode
.edit-form {
	display: flex;
	flex-direction: column;
	gap: 10px;
	select,
	input,
	textarea {
		background: #1d1d1f;
		border: 1px solid #444;
		padding: 10px;
		color: white;
		border-radius: 6px;
		font-size: 14px;
		&:focus {
			border-color: #0084ff;
			outline: none;
		}
	}
	textarea {
		resize: none;
		min-height: 80px;
	}
}
// Buttons => Edit-mode
.buttons-edit {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 12px;
}
/* View Mode */
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
// AVATAR => View-mode
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
	color: rgb(255, 255, 255);
	background-color: rgb(46, 125, 50);
}
.btn.cancel {
	color: rgb(255, 255, 255);
	background-color: rgb(112, 22, 22);
}
</style>

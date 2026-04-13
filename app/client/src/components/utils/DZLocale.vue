<template>
	<div class="locale-wrapper">
		<template>
			<button class="locale-btn" @click="isOpen = !isOpen">
				<img :src="getImgURL('design', 'translate')" alt="" />
			</button>
			<div v-if="isOpen" class="locale-dropdown">
				<div
					v-for="(lang, i) in langs"
					:key="`Lang${i}`"
					class="flag-list"
					:class="[$i18n.locale === lang.short ? 'selected' : '']"
					@click="switchLocale(lang.short)"
				>
					<Flag :lang="lang.short" :class="[$i18n.locale === lang.short ? 'selected' : '']" class="flag" />
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { loadLanguage, Locales } from '../../i18n';
import { localStore } from '../../store/localStore';
import { userStore } from '../../store/userStore';
import { UserService } from '../../services';
import Flag from './Flag.vue';
import type { Language } from '@dinorpg/core/models/config/language.js';

export default defineComponent({
	name: 'DZLocale',
	components: { Flag },
	data() {
		return {
			localStore: localStore(),
			userStore: userStore(),
			langs: Locales,
			isOpen: false
		};
	},
	methods: {
		handleClickOutside(event: MouseEvent) {
			const target = event.target as HTMLElement;
			if (!target.closest('.locale-wrapper')) {
				this.isOpen = false;
			}
		},
		async switchLocale(locale: Language): Promise<void> {
			if (this.$i18n.locale !== locale) {
				try {
					// Mettre à jour la langue du joueur sur le backend
					if (this.userStore.id) {
						await UserService.updateProfile({ language: locale });
					}
					// Changer la langue localement
					loadLanguage(locale);
					this.localStore.setLanguage(locale);
				} catch (err) {
					console.error('Erreur lors de la mise à jour de la langue du joueur :', err);
				}
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.flag {
	cursor: pointer;
	width: 15px;
	box-shadow: none;
	border: 1px solid rgb(108, 113, 136);
	&:not(.selected):hover {
		box-shadow: rgb(189, 61, 0) 0px 0px 8px;
	}
	&.selected {
		box-shadow: rgb(189, 61, 0) 0px 0px 8px;
	}
}
.flag-list {
	padding: 4px 12px;
	&.selected {
		background-color: rgb(193, 146, 12);
	}
}
.locale-wrapper {
	position: relative;
	display: flex;
	gap: 6px;
}
.locale-btn {
	display: inline-flex;
	-moz-box-align: center;
	align-items: center;
	-moz-box-pack: center;
	justify-content: center;
	box-sizing: border-box;
	background-color: transparent;
	cursor: pointer;
	vertical-align: middle;
	padding: 4px 10px;
	border-radius: 4px;
	transition:
		background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
		border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
		color 250ms cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid rgba(2, 136, 209, 0.5);
	color: rgb(2, 136, 209);
	&:hover {
		text-decoration: none;
		background-color: rgba(2, 136, 209, 0.04);
		border: 1px solid rgb(2, 136, 209);
	}
	& img {
		width: 16px;
		height: 16px;
	}
}
.locale-dropdown {
	position: fixed;
	top: 40px;
	background-color: rgb(17, 19, 23);
	display: flex;
	align-items: center;
	gap: 8px;
	box-shadow:
		rgba(0, 0, 0, 0.2) 0px 8px 10px -5px,
		rgba(0, 0, 0, 0.14) 0px 16px 24px 2px,
		rgba(0, 0, 0, 0.12) 0px 6px 30px 5px;
	z-index: 100;
	flex-direction: column;
}
</style>

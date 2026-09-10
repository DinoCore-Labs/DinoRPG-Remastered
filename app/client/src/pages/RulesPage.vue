<template>
	<TitleHeader :title="$t('common.gameRules')" :header="$t('gameRules.title')" />
	<div class="showContent">
		<div class="content">
			<div class="rulesMetadata">
				<strong>
					{{ $t('gameRules.version', { version: gameRulesVersion }) }}
				</strong>
				<span>
					{{ $t('common.lastUpdated', { date: formattedUpdatedAt }) }}
				</span>
			</div>
			<MarkdownRenderer class="rulesMarkdown" :source="markdownSource" />
			<section v-if="mustAcceptRules" class="acceptanceBox">
				<h3 class="titleSection">
					{{ $t('gameRules.acceptance.title') }}
				</h3>
				<p>
					{{ $t('gameRules.acceptance.description') }}
				</p>
				<div class="acceptanceActions">
					<DZCheckbox id="game-rules-acceptance" v-model="rulesAccepted" :disabled="isSubmitting">
						{{ $t('gameRules.acceptance.checkbox', { version: gameRulesVersion }) }}
					</DZCheckbox>
					<DZButton :disabled="!rulesAccepted || isSubmitting" @click="acceptRules">
						{{ isSubmitting ? $t('gameRules.acceptance.submitting') : $t('gameRules.acceptance.button') }}
					</DZButton>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { GAME_RULES_UPDATED_AT, GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';

import MarkdownRenderer from '../components/common/MarkdownRenderer.vue';
import DZButton from '../components/utils/DZButton.vue';
import DZCheckbox from '../components/utils/DZCheckbox.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { UserService } from '../services/user.service';
import { userStore } from '../store/userStore';

const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const user = userStore();

const rulesSources = import.meta.glob<string>('../content/rules/*.md', {
	query: '?raw',
	import: 'default'
});

const markdownSource = ref('');
const rulesAccepted = ref(false);
const isSubmitting = ref(false);

const gameRulesVersion = GAME_RULES_VERSION;

const formattedUpdatedAt = computed(() => {
	return new Intl.DateTimeFormat(String(locale.value), {
		dateStyle: 'long',
		timeZone: 'UTC'
	}).format(new Date(`${GAME_RULES_UPDATED_AT}T12:00:00.000Z`));
});

const mustAcceptRules = computed(() => user.mustAcceptGameRules);

const loadRules = async (language: string): Promise<void> => {
	const languagePath = `../content/rules/${language.toUpperCase()}.md`;
	const fallbackPath = '../content/rules/FR.md';
	const loader = rulesSources[languagePath] ?? rulesSources[fallbackPath];
	if (!loader) {
		console.error(`[Rules] Markdown file not found for language "${language}"`);
		markdownSource.value = '';
		return;
	}
	markdownSource.value = await loader();
};

const acceptRules = async (): Promise<void> => {
	if (!rulesAccepted.value || isSubmitting.value) {
		return;
	}
	isSubmitting.value = true;
	try {
		const gameRules = await UserService.acceptGameRules(GAME_RULES_VERSION);
		user.setGameRules(gameRules);
		toast.success(t('gameRules.acceptance.success'));
		const redirectQuery = route.query.redirect;
		const redirectValue = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery;
		const redirect =
			typeof redirectValue === 'string' &&
			redirectValue.startsWith('/') &&
			!redirectValue.startsWith('//') &&
			redirectValue !== '/rules'
				? redirectValue
				: '/news';
		await router.replace(redirect);
	} catch {
		toast.error(t('gameRules.acceptance.error'));
	} finally {
		isSubmitting.value = false;
	}
};

watch(
	locale,
	language => {
		void loadRules(String(language));
	},
	{
		immediate: true
	}
);
</script>

<style lang="scss" scoped>
.showContent {
	width: 95%;
	max-width: 95%;
	align-self: center;
	.content {
		margin-top: 10px;
	}
	.rulesMetadata {
		display: flex;
		flex-direction: column;
		gap: 3px;
		margin: 10px 5px 20px;
		strong {
			color: rgb(142, 62, 38);
		}
	}
	.rulesMarkdown {
		:deep(h2) {
			background-image: url('../assets/design/title/title_h2.webp');
			background-position: left bottom;
			background-repeat: no-repeat;
			color: #fff1ad;
			font-size: 1.17em;
			margin-top: 20px;
			padding-left: 5px;
		}
		:deep(p) {
			line-height: 1.45;
		}
		:deep(ul) {
			padding-left: 30px;
		}
		:deep(li) {
			margin: 8px 0;
			line-height: 1.4;
		}
		:deep(strong) {
			color: rgb(142, 62, 38);
		}
		:deep(a) {
			color: rgb(142, 62, 38);
			font-weight: bold;
			text-decoration: underline;
			text-underline-offset: 2px;

			&:hover {
				color: #71b703;
			}
		}
	}
}
.titleSection {
	background-image: url('../assets/design/title/title_h2.webp');
	background-position: left bottom;
	background-repeat: no-repeat;
	color: #fff1ad;
	padding-left: 5px;
}
.acceptanceBox {
	margin-top: 30px;
	padding: 10px;
	background-color: rgba(224, 155, 98, 0.15);
	border: 1px solid rgba(142, 62, 38, 0.25);
	border-radius: 4px;
}
.acceptanceActions {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 15px;
	margin-top: 15px;
	:deep(.dz-checkbox .text) {
		color: rgb(142, 62, 38);
		line-height: 1.4;
	}
}
@media only screen and (max-width: 600px) {
	.showContent {
		width: 95%;
	}
}
</style>

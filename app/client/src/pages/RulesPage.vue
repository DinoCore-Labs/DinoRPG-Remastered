<template>
	<div class="rulesPage">
		<TitleHeader :title="$t('gameRules.pageTitle')" :header="$t('gameRules.title')" />

		<div class="showContent">
			<article class="content">
				<header class="rulesMetadata">
					<strong>
						{{
							$t('gameRules.version', {
								version: gameRulesVersion
							})
						}}
					</strong>

					<span>
						{{
							$t('gameRules.updatedAt', {
								date: formattedUpdatedAt
							})
						}}
					</span>
				</header>

				<section v-for="section in sections" :id="section.id" :key="section.id" class="sectionContent">
					<h2 class="titleSection">
						{{ $t(section.titleKey) }}
					</h2>

					<template v-for="(block, blockIndex) in section.blocks" :key="blockIndex">
						<p v-if="block.type === 'paragraph'" class="textContent">
							{{ $t(block.key) }}
						</p>

						<ul v-else-if="block.type === 'list'" class="rulesList">
							<li v-for="key in block.keys" :key="key">
								{{ $t(key) }}
							</li>
						</ul>

						<p v-else-if="block.type === 'email'" class="textContent">
							{{ $t(block.labelKey) }}

							<a :href="`mailto:${$t(block.emailKey)}`">
								{{ $t(block.emailKey) }}
							</a>
						</p>
					</template>
				</section>

				<section v-if="mustAcceptRules" class="sectionContent acceptanceBox">
					<h2 class="titleSection">
						{{ $t('gameRules.acceptance.title') }}
					</h2>

					<p class="textContent">
						{{ $t('gameRules.acceptance.description') }}
					</p>

					<label class="acceptanceCheckbox">
						<input v-model="rulesAccepted" type="checkbox" />

						<span>
							{{
								$t('gameRules.acceptance.checkbox', {
									version: gameRulesVersion
								})
							}}
						</span>
					</label>

					<button type="button" :disabled="!rulesAccepted || isSubmitting" @click="acceptRules">
						{{ isSubmitting ? $t('gameRules.acceptance.submitting') : $t('gameRules.acceptance.button') }}
					</button>
				</section>
			</article>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TitleHeader from '../components/utils/TitleHeader.vue';
import { UserService } from '../services/user.service';
import { userStore } from '../store/userStore';
import { GAME_RULES_UPDATED_AT, GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';

type RuleBlock =
	| {
			type: 'paragraph';
			key: string;
	  }
	| {
			type: 'list';
			keys: string[];
	  }
	| {
			type: 'email';
			labelKey: string;
			emailKey: string;
	  };

interface RuleSection {
	id: string;
	titleKey: string;
	blocks: RuleBlock[];
}

const RULE_SECTIONS: RuleSection[] = [
	{
		id: 'general',
		titleKey: 'gameRules.sections.general.title',
		blocks: [
			{
				type: 'paragraph',
				key: 'gameRules.sections.general.intro'
			},
			{
				type: 'paragraph',
				key: 'gameRules.sections.general.commitmentIntro'
			},
			{
				type: 'list',
				keys: [
					'gameRules.sections.general.commitments.respect',
					'gameRules.sections.general.commitments.features',
					'gameRules.sections.general.commitments.advantage',
					'gameRules.sections.general.commitments.security'
				]
			},
			{
				type: 'paragraph',
				key: 'gameRules.sections.general.outro'
			}
		]
	}

	/*
	 * Reprendre la même structure pour :
	 *
	 * communication
	 * accounts
	 * automation
	 * bugs
	 * security
	 * market
	 * reporting
	 * sanctions
	 * circumvention
	 * appeal
	 * changes
	 *
	 * Chaque bloc ne contient que des clés gameRules.sections...
	 */
];

export default defineComponent({
	name: 'RulesPage',

	components: {
		TitleHeader
	},

	data() {
		return {
			user: userStore(),
			rulesAccepted: false,
			isSubmitting: false,
			gameRulesVersion: GAME_RULES_VERSION,
			sections: RULE_SECTIONS
		};
	},

	computed: {
		formattedUpdatedAt(): string {
			return new Intl.DateTimeFormat(this.$i18n.locale, {
				dateStyle: 'long',
				timeZone: 'UTC'
			}).format(new Date(`${GAME_RULES_UPDATED_AT}T12:00:00.000Z`));
		},

		mustAcceptRules(): boolean {
			return this.user.mustAcceptGameRules;
		}
	},

	methods: {
		async acceptRules() {
			if (!this.rulesAccepted || this.isSubmitting) {
				return;
			}

			this.isSubmitting = true;

			try {
				const gameRules = await UserService.acceptGameRules(GAME_RULES_VERSION);

				this.user.setGameRules(gameRules);

				this.$toast.success(this.$t('gameRules.acceptance.success'));

				const redirectQuery = this.$route.query.redirect;
				const redirectValue = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery;

				const redirect =
					typeof redirectValue === 'string' &&
					redirectValue.startsWith('/') &&
					!redirectValue.startsWith('//') &&
					redirectValue !== '/rules'
						? redirectValue
						: '/news';

				await this.$router.replace(redirect);
			} catch {
				this.$toast.error(this.$t('gameRules.acceptance.error'));
			} finally {
				this.isSubmitting = false;
			}
		}
	}
});
</script>

<style scoped lang="scss">
.rulesMetadata {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	margin-bottom: 1rem;
}

.rulesList {
	margin: 0.5rem 0 1rem;
	padding-left: 2rem;
}

.rulesList li {
	margin-bottom: 0.35rem;
}

.acceptanceBox {
	margin-top: 2rem;
}

.acceptanceCheckbox {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	margin: 1rem 0;
}

.acceptanceCheckbox input {
	margin-top: 0.2rem;
}
</style>

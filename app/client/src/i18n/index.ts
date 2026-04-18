import { Language } from '@dinorpg/core/models/config/language.js';
import { createI18n, type I18n } from 'vue-i18n';

import { localStore } from '../store/localStore';

let i18n: I18n;
const loadedLanguages: Array<string> = [];

export async function applyLanguage(language: Language) {
	await loadLanguage(language);
	localStore().setLanguage(language);
}

export interface LangInfos {
	caption: string;
	icon: string;
	short: Language;
}

export const Locales: Record<string, LangInfos> = {
	[Language.FR]: {
		caption: 'Français',
		icon: '/src/assets/lang/lang_fr.webp',
		short: Language.FR
	},
	[Language.EN]: {
		caption: 'English',
		icon: '/src/assets/lang/lang_en.webp',
		short: Language.EN
	},
	[Language.ES]: {
		caption: 'Spanish',
		icon: '/src/assets/lang/lang_es.webp',
		short: Language.ES
	},
	[Language.DE]: {
		caption: 'German',
		icon: '/src/assets/lang/lang_de.webp',
		short: Language.DE
	}
};

export const defaultLocale = Language.FR;

export const initI18n = async () => {
	i18n = createI18n({
		locale: localStore().getLanguage || Language.FR,
		fallbackLocale: defaultLocale,
		silentFallbackWarn: true,
		silentTranslationWarn: true,
		messages: { fr: {}, en: {}, es: {}, de: {} },
		datetimeFormats: {
			fr: {
				long: {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}
			}
		}
	});

	// load default language
	const messages = await import(`./locales/${defaultLocale}.json`);
	i18n.global.setLocaleMessage(defaultLocale, messages.default);
	loadedLanguages.push(defaultLocale);

	await loadLanguage(i18n.global.locale as string);

	return i18n;
};

export const loadLanguage = async (locale: string): Promise<string> => {
	if (loadedLanguages.includes(locale)) {
		return setI18nLanguage(locale);
	}

	// load locale messages with dynamic import
	const messages = await import(`./locales/${locale}.json`);

	i18n.global.setLocaleMessage(locale, messages.default);
	loadedLanguages.push(locale);

	return setI18nLanguage(locale);
};

function setI18nLanguage(locale: string): string {
	i18n.global.locale = locale;
	return locale;
}

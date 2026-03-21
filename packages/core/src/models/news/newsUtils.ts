import { Language } from '../config/language.js';
import { NewsTranslation } from './news.js';
import { PollOptionTranslation } from './poll.js';

export const NEWS_LANGUAGE_FALLBACK_ORDER: Language[] = [Language.FR, Language.EN, Language.ES, Language.DE];

export function resolveNewsTranslation(translations: NewsTranslation[], lang: Language): NewsTranslation | undefined {
	const exact = translations.find(translation => translation.lang === lang);
	if (exact) return exact;

	for (const fallbackLang of NEWS_LANGUAGE_FALLBACK_ORDER) {
		const fallback = translations.find(translation => translation.lang === fallbackLang);
		if (fallback) return fallback;
	}

	return translations[0];
}

export function resolvePollOptionTranslation(
	translations: PollOptionTranslation[],
	lang: Language
): PollOptionTranslation | undefined {
	const exact = translations.find(translation => translation.lang === lang);
	if (exact) return exact;

	for (const fallbackLang of NEWS_LANGUAGE_FALLBACK_ORDER) {
		const fallback = translations.find(translation => translation.lang === fallbackLang);
		if (fallback) return fallback;
	}

	return translations[0];
}

export function isPollEnded(endAt: Date, now = new Date()): boolean {
	return endAt.getTime() <= now.getTime();
}

export function canVoteToPoll(isActive: boolean, endAt: Date, now = new Date()): boolean {
	return isActive && !isPollEnded(endAt, now);
}

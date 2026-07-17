import sanitizeHtml from 'sanitize-html';

import { EmotesAchievementsIcons } from '../components/richTextEditor/emotes/EmotesAchievementsIcons';
import { EmotesElementsIcons } from '../components/richTextEditor/emotes/EmotesElementsIcons';
import { EmotesResourcesIcons } from '../components/richTextEditor/emotes/EmotesResourcesIcons';
import { EmotesStatusIcons } from '../components/richTextEditor/emotes/EmotesStatusIcons';
import { EmotesTwinoidV1Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV1Icons';
import { EmotesTwinoidV2Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV2Icons';
import { EmotesTwinoidV3Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV3Icons';

const emoteIconEnums: Record<string, string> = {
	...EmotesTwinoidV1Icons,
	...EmotesTwinoidV2Icons,
	...EmotesTwinoidV3Icons,
	...EmotesElementsIcons,
	...EmotesStatusIcons,
	...EmotesResourcesIcons,
	...EmotesAchievementsIcons
};

function markdownSubstitution(
	fullMatch: string,
	markdownLabel?: string,
	markdownUrl?: string,
	directUrl?: string
): string {
	/*
	 * Lien Markdown :
	 *
	 * [DinoRPG](https://dinorpg.fr)
	 */
	if (markdownLabel !== undefined && markdownUrl !== undefined) {
		const normalizedUrl = normalizeLink(markdownUrl);
		if (normalizedUrl === null) {
			/*
			 * L'URL est refusée, mais le libellé reste visible
			 * comme du texte normal.
			 */
			return escapeRichTextHtml(markdownLabel);
		}
		return [
			`<a`,
			` href="${escapeRichTextHtml(normalizedUrl)}"`,
			` title="${escapeRichTextHtml(normalizedUrl)}"`,
			`>`,
			escapeRichTextHtml(markdownLabel),
			`</a>`
		].join('');
	}
	/*
	 * Lien DinoRPG directement écrit dans le message :
	 *
	 * https://dinorpg.fr/...
	 * dinorpg.fr/...
	 */
	if (directUrl !== undefined) {
		const normalizedUrl = normalizeLink(directUrl);

		if (normalizedUrl === null) {
			return escapeRichTextHtml(fullMatch);
		}
		return [
			`<a`,
			` href="${escapeRichTextHtml(normalizedUrl)}"`,
			` title="${escapeRichTextHtml(normalizedUrl)}"`,
			`>`,
			escapeRichTextHtml(directUrl),
			`</a>`
		].join('');
	}

	return escapeRichTextHtml(fullMatch);
}

function emoteSubstitution(substring: string, p1: string): string {
	if (p1 in emoteIconEnums) {
		return `<img src='${emoteIconEnums[p1]}' alt='${substring}' height="20">`;
	}
	return substring;
}

/**
 * Échappe une valeur qui sera injectée dans du HTML généré.
 */
function escapeRichTextHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

/**
 * Accepte uniquement :
 * - les URLs HTTP ;
 * - les URLs HTTPS ;
 * - les URLs DinoRPG sans protocole.
 *
 * Les protocoles dangereux tels que javascript:, data: et vbscript:
 * sont donc refusés avant même le passage dans sanitize-html.
 */
function normalizeLink(rawUrl: string): string | null {
	const url = rawUrl.trim();
	if (/^https?:\/\/[^\s]+$/i.test(url)) {
		return url;
	}
	if (/^(?:staging\.)?dinorpg\.eternaltwin\.org\/[^\s]+$/i.test(url)) {
		return `https://${url}`;
	}
	return null;
}

export function richFormatText(text: string | null): string {
	if (text === null) {
		return '';
	}
	let formattedText = text;
	/*
	 * On protège temporairement les blocs de code.
	 *
	 * Cela évite que les syntaxes Markdown présentes dans le code
	 * soient transformées en gras, italique, spoiler, émote, etc.
	 */
	const codeBlocks: string[] = [];
	const inlineCodeBlocks: string[] = [];
	formattedText = formattedText.replace(/```([\s\S]*?)```/g, (_match: string, code: string) => {
		const index = codeBlocks.push(code.trim()) - 1;
		return `§§CODE_BLOCK_${index}§§`;
	});
	formattedText = formattedText.replace(/`([^`\n]+)`/g, (_match: string, code: string) => {
		const index = inlineCodeBlocks.push(code) - 1;
		return `§§INLINE_CODE_${index}§§`;
	});
	/*
	 * Citations.
	 *
	 * Exemple :
	 * > Première ligne
	 * > Deuxième ligne
	 */
	formattedText = formattedText.replace(/(?:^> .*(?:\n|$))+/gm, block => {
		const content = block.replace(/^> ?/gm, '');
		return `<blockquote>${content}</blockquote>`;
	});
	/*
	 * Liens Markdown :
	 *
	 * [DinoRPG](https://dinorpg.fr)
	 * Et liens directs :
	 * https://dinorpg.fr/...
	 * staging.dinorpg.fr/...
	 */
	const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)|((https:\/\/)?(staging\.)?dinorpg\.fr\/[^\s)"'< ]*)/g;
	formattedText = formattedText.replace(markdownLinkRegex, markdownSubstitution);
	/*
	 * Émotes.
	 *
	 * Cette transformation peut générer une balise <img>.
	 * La balise et ses attributs sont autorisés dans sanitizeHtml plus bas.
	 */
	formattedText = formattedText.replace(/:([a-zA-Z0-9_]+):/g, emoteSubstitution);
	/*
	 * Mise en forme Markdown.
	 */
	formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
	formattedText = formattedText.replace(/~~(.*?)~~/g, '<s>$1</s>');
	formattedText = formattedText.replace(/==(.+?)==/g, '<mark>$1</mark>');
	/*
	 * Spoilers.
	 * Exemple :
	 * ||contenu caché||
	 */
	formattedText = formattedText.replace(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');
	/*
	 * Les doubles slashs deviennent des retours à la ligne,
	 * sauf lorsqu'ils appartiennent à http:// ou https://.
	 */
	formattedText = formattedText.replace(/(?<!http:|https:)\/\//g, '<br>');
	formattedText = formattedText.replace(/\n/g, '<br>');
	/*
	 * On restaure le code inline.
	 *
	 * Le contenu est échappé pour que les balises contenues dans le code
	 * soient affichées et non exécutées.
	 */
	formattedText = formattedText.replace(/§§INLINE_CODE_(\d+)§§/g, (_match: string, rawIndex: string) => {
		const index = Number(rawIndex);
		const code = inlineCodeBlocks[index] ?? '';
		return `<code>${escapeRichTextHtml(code)}</code>`;
	});
	/*
	 * On restaure les blocs de code.
	 */
	formattedText = formattedText.replace(/§§CODE_BLOCK_(\d+)§§/g, (_match: string, rawIndex: string) => {
		const index = Number(rawIndex);
		const code = codeBlocks[index] ?? '';
		return `<pre><code>${escapeRichTextHtml(code)}</code></pre>`;
	});
	/*
	 * IMPORTANT :
	 *
	 * sanitizeHtml doit être la dernière transformation.
	 *
	 * Les balises <img> sont autorisées pour conserver les émotes.
	 * La classe des <span> est autorisée pour conserver les spoilers.
	 */
	return sanitizeHtml(formattedText, {
		allowedTags: ['strong', 'em', 'a', 'br', 'mark', 'blockquote', 'code', 'pre', 's', 'span', 'img'],
		allowedAttributes: {
			a: ['href', 'title'],
			span: ['class'],
			/*
			 * Adapte éventuellement cette liste aux attributs réellement
			 * retournés par emoteSubstitution().
			 */
			img: ['src', 'alt', 'title', 'class', 'width', 'height']
		},
		/*
		 * Autorise uniquement les liens HTTP et HTTPS.
		 *
		 * Les chemins relatifs d'émotes comme /img/emotes/... restent
		 * également autorisés par sanitize-html.
		 */
		allowedSchemes: ['http', 'https'],
		allowedSchemesAppliedToAttributes: ['href', 'src'],
		/*
		 * Refuse les URLs commençant simplement par //.
		 */
		allowProtocolRelative: false
	});
}

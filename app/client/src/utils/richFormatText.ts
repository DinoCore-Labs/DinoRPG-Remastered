import sanitizeHtml from 'sanitize-html';

import { EmotesAchievementsIcons } from '../components/richTextEditor/emotes/EmotesAchievementsIcons';
import { EmotesElementsIcons } from '../components/richTextEditor/emotes/EmotesElementsIcons';
import { EmotesResourcesIcons } from '../components/richTextEditor/emotes/EmotesResourcesIcons';
import { EmotesStatusIcons } from '../components/richTextEditor/emotes/EmotesStatusIcons';
import { EmotesTwinoidV1Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV1Icons';
import { EmotesTwinoidV2Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV2Icons';
import { EmotesTwinoidV3Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV3Icons';

const emoteIconEnums = {
	...EmotesTwinoidV1Icons,
	...EmotesTwinoidV2Icons,
	...EmotesTwinoidV3Icons,
	...EmotesElementsIcons,
	...EmotesStatusIcons,
	...EmotesResourcesIcons,
	...EmotesAchievementsIcons
};

function markdownSubstitution(_substring: string, p1: string, p2: string, p3: string): string {
	return !p1 ? `<a href=\'${p3}\' title=\'${p3}\'>${p3}</a>` : `<a href=\'${p2}\' title=\'${p2}\'>${p1}</a>`;
}

function emoteSubstitution(substring: string, p1: string): string {
	if (p1 in emoteIconEnums) {
		return `<img src='${emoteIconEnums[p1]}' alt='${substring}' height="20">`;
	}
	return substring;
}

export function richFormatText(text: string | null): string {
	if (text === null) {
		return '';
	}

	text = text.replace(/(?:^> .*(?:\n|$))+/gm, block => {
		// Retirer le "> " au début de chaque ligne
		const content = block.replace(/^> ?/gm, '');
		return `<blockquote>${content}</blockquote>`;
	});

	// Blocs de code (``` ... ```)
	text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
		return `<pre><code>${code.trim()}</code></pre>`;
	});

	// Inline code (`...`)
	text = text.replace(/`([^`]+)`/g, (_, code) => {
		return `<code>${code}</code>`;
	});

	let formattedText = sanitizeHtml(text, {
		allowedTags: ['strong', 'em', 'a', 'br', 'mark', 'blockquote', 'code', 'pre', 's', 'span'],
		allowedAttributes: {
			a: ['href'],
			span: ['class']
		}
	});

	// Handle both markdown-style links (e.g. [DinoRPG](https://dinorpg.eternaltwin.org))
	// and direct links from the game (e.g. https://dinorpg.eternaltwin.org)
	const markdownLinkRegex =
		/\[([^\]]+)\]\(([^\)]+)\)|((https:\/\/)?(staging\.)?dinorpg\.eternaltwin\.org\/[^\s\)\"\'\< ]*)/g;

	formattedText = formattedText.replaceAll(markdownLinkRegex, markdownSubstitution);
	formattedText = formattedText.replace(/:([a-zA-Z0-9_]+):/g, emoteSubstitution);
	formattedText = formattedText.replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	formattedText = formattedText.replaceAll(/\*(.*?)\*/g, '<em>$1</em>');
	formattedText = formattedText.replaceAll(/~~(.*?)~~/g, '<s>$1</s>');
	formattedText = formattedText.replaceAll(/==(.+?)==/g, '<mark>$1</mark>');
	formattedText = formattedText.replaceAll(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');
	formattedText = formattedText.replace(/(?<!http:|https:)\/\//g, '<br>');

	return formattedText;
}

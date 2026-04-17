import type { FormattingType } from './RichTextEditorConfig';

export interface TextSelection {
	start: number;
	end: number;
}

export interface FormatOperationResult {
	newFullText: string;
	modifiedPart: string;
	caretPosition: number;
}

type InlineWrapper = {
	open: string;
	close: string;
};

const INLINE_WRAPPERS: Partial<Record<FormattingType, InlineWrapper>> = {
	italic: { open: '*', close: '*' },
	bold: { open: '**', close: '**' },
	bolditalic: { open: '***', close: '***' },
	strike: { open: '~~', close: '~~' },
	highlight: { open: '==', close: '==' },
	spoiler: { open: '||', close: '||' }
};

function stripInlineWrapper(text: string, wrapper: InlineWrapper): string {
	if (text.startsWith(wrapper.open) && text.endsWith(wrapper.close)) {
		return text.slice(wrapper.open.length, text.length - wrapper.close.length);
	}
	return text;
}

function stripAllInlineWrappers(text: string): string {
	let result = text;
	let changed = true;

	while (changed) {
		changed = false;

		for (const wrapper of Object.values(INLINE_WRAPPERS)) {
			if (!wrapper) continue;

			const stripped = stripInlineWrapper(result, wrapper);
			if (stripped !== result) {
				result = stripped;
				changed = true;
			}
		}
	}

	return result;
}

function stripBlockquote(text: string): string {
	return text
		.split('\n')
		.map(line => line.replace(/^>\s?/, ''))
		.join('\n');
}

function stripCode(text: string): string {
	if (text.startsWith('```') && text.endsWith('```')) {
		return text.replace(/^```\n?/, '').replace(/\n?```$/, '');
	}

	if (text.startsWith('`') && text.endsWith('`')) {
		return text.slice(1, -1);
	}

	return text;
}

export function cleanExistingFormatting(text: string): string {
	return stripCode(stripBlockquote(stripAllInlineWrappers(text))).trim();
}

export function applyFormattingForType(text: string, type: FormattingType): string {
	switch (type) {
		case 'blockquote':
			return text
				.split('\n')
				.map(line => (line.startsWith('> ') ? line : `> ${line}`))
				.join('\n');

		case 'code':
			return text.includes('\n') ? `\`\`\`\n${text}\n\`\`\`` : `\`${text}\``;

		default: {
			const wrapper = INLINE_WRAPPERS[type];
			return wrapper ? `${wrapper.open}${text}${wrapper.close}` : text;
		}
	}
}

function getCaretPositionAfterFormatting(formattedText: string, type: FormattingType): number {
	switch (type) {
		case 'italic':
			return formattedText.length - 1;
		case 'bold':
		case 'strike':
		case 'highlight':
		case 'spoiler':
			return formattedText.length - 2;
		case 'bolditalic':
			return formattedText.length - 3;
		case 'blockquote':
			return formattedText.length;
		case 'code':
			return formattedText.includes('\n```') ? formattedText.length - 4 : formattedText.length - 1;
		default:
			return formattedText.length;
	}
}

export function applySelectedTextFormatting(
	currentFullText: string,
	selection: TextSelection,
	type: FormattingType
): FormatOperationResult {
	const selectedText = currentFullText.substring(selection.start, selection.end);
	const cleanText = cleanExistingFormatting(selectedText);
	const formattedText = applyFormattingForType(cleanText, type);

	const newFullText =
		currentFullText.substring(0, selection.start) + formattedText + currentFullText.substring(selection.end);

	return {
		newFullText,
		modifiedPart: formattedText,
		caretPosition: selection.start + getCaretPositionAfterFormatting(formattedText, type)
	};
}

export function clearSelectedTextFormattingLogic(
	currentFullText: string,
	selection: TextSelection
): FormatOperationResult {
	const selectedText = currentFullText.substring(selection.start, selection.end);
	const cleanText = cleanExistingFormatting(selectedText);

	const newFullText =
		currentFullText.substring(0, selection.start) + cleanText + currentFullText.substring(selection.end);

	return {
		newFullText,
		modifiedPart: cleanText,
		caretPosition: selection.start + cleanText.length
	};
}

export function insertTextAtPositionLogic(currentFullText: string, position: number, textToInsert: string): string {
	return currentFullText.substring(0, position) + textToInsert + currentFullText.substring(position);
}

export function formatEmote(emote: string): string {
	return `:${emote}:`;
}

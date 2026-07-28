import { EmotesAchievementsEnum, EmotesAchievementsIcons } from './emotes/EmotesAchievementsIcons';
import { EmotesElementsEnum, EmotesElementsIcons } from './emotes/EmotesElementsIcons';
import { EmotesResourcesEnum, EmotesResourcesIcons } from './emotes/EmotesResourcesIcons';
import { EmotesStatusEnum, EmotesStatusIcons } from './emotes/EmotesStatusIcons';
import { EmotesTwinoidV1Enum, EmotesTwinoidV1Icons } from './emotes/EmotesTwinoidV1Icons';
import { EmotesTwinoidV2Enum, EmotesTwinoidV2Icons } from './emotes/EmotesTwinoidV2Icons';
import { EmotesTwinoidV3Enum, EmotesTwinoidV3Icons } from './emotes/EmotesTwinoidV3Icons';

export type FormattingType =
	| 'bold'
	| 'italic'
	| 'bolditalic'
	| 'strike'
	| 'highlight'
	| 'blockquote'
	| 'spoiler'
	| 'code';
export type RichTextEditorButtonType = FormattingType;

export interface RichTextEditorFormattingButtonConfig {
	type: RichTextEditorButtonType;
	label: string;
	title: string;
	action: 'clearFormatting' | 'applyFormatting';
	actionParam?: string;
}

export const richTextEditorFormattingButtons: RichTextEditorFormattingButtonConfig[] = [
	{
		type: 'bold',
		label: 'richTextEditor.boldButtonTitle',
		title: 'richTextEditor.boldButtonDescription',
		action: 'applyFormatting',
		actionParam: 'bold'
	},
	{
		type: 'italic',
		label: 'richTextEditor.italicButtonTitle',
		title: 'richTextEditor.italicButtonDescription',
		action: 'applyFormatting',
		actionParam: 'italic'
	},
	{
		type: 'bolditalic',
		label: 'richTextEditor.boldItalicButtonTitle',
		title: 'richTextEditor.boldItalicButtonDescription',
		action: 'applyFormatting',
		actionParam: 'bolditalic'
	},
	{
		type: 'strike',
		label: 'richTextEditor.strikeButtonTitle',
		title: 'richTextEditor.strikeButtonDescription',
		action: 'applyFormatting',
		actionParam: 'strike'
	},
	{
		type: 'highlight',
		label: 'richTextEditor.highlightButtonTitle',
		title: 'richTextEditor.highlightButtonDescription',
		action: 'applyFormatting',
		actionParam: 'highlight'
	},
	{
		type: 'blockquote',
		label: 'richTextEditor.blockquoteButtonTitle',
		title: 'richTextEditor.blockquoteButtonDescription',
		action: 'applyFormatting',
		actionParam: 'blockquote'
	},
	{
		type: 'spoiler',
		label: 'richTextEditor.spoilerButtonTitle',
		title: 'richTextEditor.spoilerButtonDescription',
		action: 'applyFormatting',
		actionParam: 'spoiler'
	},
	{
		type: 'code',
		label: 'richTextEditor.codeButtonTitle',
		title: 'richTextEditor.codeButtonDescription',
		action: 'applyFormatting',
		actionParam: 'code'
	}
];

export interface RichTextEditorEmoteButtonConfig {
	icon: string;
	emoteEnum: Record<string, string>;
	iconEnum: { [index: string]: string };
}

export const richTextEditorEmoteButtons: RichTextEditorEmoteButtonConfig[] = [
	{
		icon: EmotesTwinoidV1Icons[EmotesTwinoidV1Enum.TWINOIDV1_SMILE],
		emoteEnum: EmotesTwinoidV1Enum,
		iconEnum: EmotesTwinoidV1Icons
	},
	{
		icon: EmotesTwinoidV2Icons[EmotesTwinoidV2Enum.TWINOIDV2_SMILE],
		emoteEnum: EmotesTwinoidV2Enum,
		iconEnum: EmotesTwinoidV2Icons
	},
	{
		icon: EmotesTwinoidV3Icons[EmotesTwinoidV3Enum.TWINOIDV3_COOL],
		emoteEnum: EmotesTwinoidV3Enum,
		iconEnum: EmotesTwinoidV3Icons
	},
	{
		icon: EmotesElementsIcons[EmotesElementsEnum.ELEMENT_VOID],
		emoteEnum: EmotesElementsEnum,
		iconEnum: EmotesElementsIcons
	},
	{
		icon: EmotesStatusIcons[EmotesStatusEnum.STATUS_CCARD],
		emoteEnum: EmotesStatusEnum,
		iconEnum: EmotesStatusIcons
	},
	{
		icon: EmotesResourcesIcons[EmotesResourcesEnum.RESOURCES_POTION_IRMA],
		emoteEnum: EmotesResourcesEnum,
		iconEnum: EmotesResourcesIcons
	},
	{
		icon: EmotesAchievementsIcons[EmotesAchievementsEnum.ACHIEVEMENT_TOUR],
		emoteEnum: EmotesAchievementsEnum,
		iconEnum: EmotesAchievementsIcons
	}
];

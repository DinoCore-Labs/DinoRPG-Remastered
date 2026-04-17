import { getImgURL } from '../../../utils/getImgURL';

export enum EmotesTwinoidV3Enum {
	TWINOIDV3_ANGRY = 'angry',
	TWINOIDV3_BG = 'bg',
	TWINOIDV3_CALMOS = 'calmos',
	TWINOIDV3_CGU = 'cgu',
	TWINOIDV3_COOL = 'cool_v3',
	TWINOIDV3_DROWL = 'drowl_v3',
	TWINOIDV3_LOL = 'lol_v3',
	TWINOIDV3_OUPS = 'oups',
	TWINDOIDV3_SIFFLOTE = 'sifflote',
	TWINDOIDV3_SURPISE = 'surprise',
	TWINDOIDV3_TUSORS = 'tusors'
}

export const EmotesTwinoidV3Aliases: { [index: string]: string } = {
	['angry']: EmotesTwinoidV3Enum.TWINOIDV3_ANGRY,
	['bg']: EmotesTwinoidV3Enum.TWINOIDV3_BG,
	['calmos']: EmotesTwinoidV3Enum.TWINOIDV3_CALMOS,
	['cgu']: EmotesTwinoidV3Enum.TWINOIDV3_CGU,
	['cool_v3']: EmotesTwinoidV3Enum.TWINOIDV3_COOL,
	['drowl_v3']: EmotesTwinoidV3Enum.TWINOIDV3_DROWL,
	['lol_v3']: EmotesTwinoidV3Enum.TWINOIDV3_LOL,
	['oups']: EmotesTwinoidV3Enum.TWINOIDV3_OUPS,
	['sifflote']: EmotesTwinoidV3Enum.TWINDOIDV3_SIFFLOTE,
	['surprise']: EmotesTwinoidV3Enum.TWINDOIDV3_SURPISE,
	['tusors']: EmotesTwinoidV3Enum.TWINDOIDV3_TUSORS
};

export const EmotesTwinoidV3Icons: { [index: string]: string } = {
	[EmotesTwinoidV3Enum.TWINOIDV3_ANGRY]: getImgURL('emotes/twinoidv3', 'angry', false, true),
	[EmotesTwinoidV3Enum.TWINOIDV3_BG]: getImgURL('emotes/twinoidv3', 'bg', false, true),
	[EmotesTwinoidV3Enum.TWINOIDV3_CALMOS]: getImgURL('emotes/twinoidv3', 'calmos', false, true),
	[EmotesTwinoidV3Enum.TWINOIDV3_CGU]: getImgURL('emotes/twinoidv3', 'cgu', false, true),
	[EmotesTwinoidV3Enum.TWINOIDV3_COOL]: getImgURL('emotes/twinoidv3', 'cool', false, true),
	[EmotesTwinoidV3Enum.TWINOIDV3_DROWL]: getImgURL('emotes/twinoidv3', 'drowl', false, true),
	[EmotesTwinoidV3Enum.TWINOIDV3_LOL]: getImgURL('emotes/twinoidv3', 'lol', false, true),
	[EmotesTwinoidV3Enum.TWINOIDV3_OUPS]: getImgURL('emotes/twinoidv3', 'oups', false, true),
	[EmotesTwinoidV3Enum.TWINDOIDV3_SIFFLOTE]: getImgURL('emotes/twinoidv3', 'sifflote', false, true),
	[EmotesTwinoidV3Enum.TWINDOIDV3_SURPISE]: getImgURL('emotes/twinoidv3', 'surprise', false, true),
	[EmotesTwinoidV3Enum.TWINDOIDV3_TUSORS]: getImgURL('emotes/twinoidv3', 'tusors', false, true)
};

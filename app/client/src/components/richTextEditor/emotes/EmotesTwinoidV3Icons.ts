export enum EmotesTwinoidV3Enum {
	TWINOIDV3_ANGRY = 'angry',
	TWINOIDV3_BG = 'bg',
	TWINOIDV3_CALMOS = 'calmos',
	TWINOIDV3_CGU = 'cgu',
	TWINOIDV3_COOL = 'cool_v3',
	TWINOIDV3_DROWL = 'drowl_v3',
	TWINOIDV3_LOL = 'lol_v3',
	TWINOIDV3_OUPS = 'oups',
	TWINOIDV3_SIFFLOTE = 'sifflote',
	TWINOIDV3_SURPRISE = 'surprise',
	TWINOIDV3_TUSORS = 'tusors'
}

export const EmotesTwinoidV3Aliases: Record<string, EmotesTwinoidV3Enum> = {
	angry: EmotesTwinoidV3Enum.TWINOIDV3_ANGRY,
	bg: EmotesTwinoidV3Enum.TWINOIDV3_BG,
	calmos: EmotesTwinoidV3Enum.TWINOIDV3_CALMOS,
	cgu: EmotesTwinoidV3Enum.TWINOIDV3_CGU,
	cool_v3: EmotesTwinoidV3Enum.TWINOIDV3_COOL,
	drowl_v3: EmotesTwinoidV3Enum.TWINOIDV3_DROWL,
	lol_v3: EmotesTwinoidV3Enum.TWINOIDV3_LOL,
	oups: EmotesTwinoidV3Enum.TWINOIDV3_OUPS,
	sifflote: EmotesTwinoidV3Enum.TWINOIDV3_SIFFLOTE,
	surprise: EmotesTwinoidV3Enum.TWINOIDV3_SURPRISE,
	tusors: EmotesTwinoidV3Enum.TWINOIDV3_TUSORS
};

const twinoidV3Images = import.meta.glob('../../../assets/emotes/twinoidv3/*.gif', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

function getTwinoidV3FileName(emoteName: EmotesTwinoidV3Enum) {
	return emoteName.replace(/_v3$/, '');
}

function getTwinoidV3Icon(emoteName: EmotesTwinoidV3Enum) {
	const fileName = getTwinoidV3FileName(emoteName);
	const key = `../../../assets/emotes/twinoidv3/${fileName}.gif`;
	const icon = twinoidV3Images[key];

	if (!icon) {
		console.warn(`[EmotesTwinoidV3Icons] Missing emote: ${key}`);
		return '';
	}

	return icon;
}

export const EmotesTwinoidV3Icons: Record<EmotesTwinoidV3Enum, string> = Object.values(EmotesTwinoidV3Enum).reduce(
	(icons, emoteName) => {
		icons[emoteName] = getTwinoidV3Icon(emoteName);
		return icons;
	},
	{} as Record<EmotesTwinoidV3Enum, string>
);

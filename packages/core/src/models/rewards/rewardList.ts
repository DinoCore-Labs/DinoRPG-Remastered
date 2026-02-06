import { EpicReward } from './epicReward.js';

export enum Reward {
	/* ============================
	 * CLASSIC REWARDS (1–99)
	 * ============================ */
	PERLE = 1,
	PTEROZ = 2,
	HIPPO = 3,
	ROCKY = 4,
	QUETZU = 5,
	LABOWI = 6,
	TOUR = 7,
	VENER = 8,
	TAURUS = 9,
	BELIUS = 10,
	SCORP = 11,
	MSG = 12,
	MAGNET = 13,
	PLUME = 14,
	KAURA = 15,
	DEMON = 16,
	PMI = 17,
	PDA = 18,
	FDJV1 = 19,
	DICO1 = 20,
	DICARB = 21,
	CAUSH = 22,
	FMEDAL = 23,
	MERGUEZ_CARD = 24,
	PAC = 25,
	TIK = 26,

	/* ============================
	 * WAR REWARDS (100–199)
	 * ============================ */
	WAR1A = 100,
	WAR1B = 101,
	WAR2A = 102,
	WAR2B = 103,
	WAR3A = 104,
	WAR3B = 105,
	WAR4A = 106,
	WAR4B = 107,
	WAR5A = 108,
	WAR5B = 109,
	WARFA = 110,
	WARFB = 111,
	WARFC = 112,
	WARGA = 113,
	WARGB = 114,
	WARGC = 115,
	WARHA = 116,
	WARHB = 117,
	WARIA = 118,
	WARIB = 119,
	WARIC = 120,
	WARJA = 121,
	WARJB = 122,
	WARJC = 123,
	WARKA = 124,
	WARKB = 125,
	WARKC = 126,
	WARLA = 127,
	WARLB = 128,
	WARLC = 129,
	WARMA = 130,
	WARMB = 131,
	WARMC = 132,
	WARNA = 133,
	WARNB = 134,
	WARNC = 135,
	WAROA = 136,
	WAROB = 137,
	WAROC = 138,
	WARPA = 139,
	WARPB = 140,
	WARPC = 141,
	WARQA = 142,
	WARQB = 143,
	WARQC = 144,
	WARRA = 145,
	WARRB = 146,
	WARRC = 147,
	WARSA = 148,
	WARSB = 149,
	WARSC = 150,
	WARTA = 151,
	WARTB = 152,
	WARTC = 153,
	WARUA = 154,
	WARUB = 155,
	WARUC = 156,
	WARVA = 157,
	WARVB = 158,
	WARVC = 159,
	WARWA = 160,
	WARWB = 161,
	WARWC = 162,
	WARXA = 163,
	WARXB = 164,
	WARXC = 165,
	WARYA = 166,
	WARYB = 167,
	WARYC = 168,
	WARZA = 169,
	WARZB = 170,
	WARZC = 171,

	/* ============================
	 * CHAMPIONS (200–299)
	 * ============================ */
	CH1X1A = 200,
	CH1X1B = 201,
	CH1X2A = 202,
	CH1X2B = 203,
	CH2X1A = 204,
	CH2X2A = 205,
	CH2X2B = 206,
	CH2X3A = 207,
	CH2X3B = 208,
	CH3X1A = 209,
	CH3X1B = 210,
	CH3X2A = 211,
	CH3X2B = 212,
	CH3X3A = 213,
	CH3X3B = 214,
	CH3X4A = 215,
	CH3X4B = 216,
	CH4X1A = 217,
	CH4X1B = 218,
	CH4X2A = 219,
	CH4X2B = 220,
	CH4X3A = 221,
	CH4X3B = 222,
	CH4X4A = 223,
	CH4X4B = 224,
	CH5X1 = 225,
	CH5X2 = 226,
	CH5X3 = 227,
	CH5X4 = 228,
	CHFX1 = 229,
	CHFX2 = 230,
	CHFX3 = 231,
	CHFX4 = 232,
	CHGX1A = 233,
	CHGX1B = 234,
	CHGX2A = 235,
	CHGX2B = 236,
	CHGX3A = 237,
	CHGX3B = 238,
	CHGX4A = 239,
	CHGX4B = 240,
	CHHX1A = 241,
	CHHX1B = 242,
	CHHX2A = 243,
	CHHX2B = 244,
	CHHX3A = 245,
	CHHX3B = 246,
	CHHX4A = 247,
	CHHX4B = 248,
	CHIX1A = 249,
	CHIX1B = 250,
	CHIX2A = 251,
	CHIX2B = 252,
	CHIX3A = 253,
	CHIX3B = 254,
	CHIX4A = 255,
	CHIX4B = 256,
	CHJX1A = 257,
	CHJX1B = 258,
	CHJX2A = 259,
	CHJX2B = 260,
	CHJX3A = 261,
	CHJX3B = 262,

	/* ============================
	 * EVENTS (300–399)
	 * ============================ */
	CINEC1 = 300,
	CINEC2 = 301,
	CINEC3 = 302,
	CINEC4 = 303,
	HALLOW = 304,
	TID1 = 305,
	TID2 = 306,
	GAZELI = 307,

	/* ============================
	 * HUNTS (400–499)
	 * ============================ */
	HUNT1 = 400,
	HUNINT = 401,
	XHUNT3 = 402,
	XHUNT2 = 403,
	XHUNT1 = 404,

	/* ============================
	 * CINEMA / SPECIAL (500+)
	 * ============================ */
	CINEMA = 500,
	CINEM2 = 501,
	EUGENE = 502,
	LITTER = 503,
	CLOVER = 504,

	/* ============================
	 * SPECIAL
	 * ============================ */
	BETA = 999
}

const displayedOverrides: Partial<Record<Reward, boolean>> = {
	[Reward.TIK]: false
};

export const rewardList: Readonly<Record<Reward, EpicReward>> = Object.freeze(
	Object.fromEntries(
		(Object.values(Reward).filter(v => typeof v === 'number') as number[]).map(id => {
			const rewardId = id as Reward;

			// reverse mapping d'un enum numérique TS:
			// Reward[100] -> "WAR1A", etc.
			const name = Reward[rewardId].toLowerCase() as string;

			const displayed = displayedOverrides[rewardId] ?? true;

			return [
				rewardId,
				{
					id: rewardId,
					name,
					displayed
				} satisfies EpicReward
			];
		})
	) as Record<Reward, EpicReward>
);

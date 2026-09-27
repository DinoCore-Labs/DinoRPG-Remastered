/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/utils/formatText.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2025-12-02 through 2026-05-10.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getImgURL } from './getImgURL';

export const helpers = {
	computeImageHtml(key: string): string {
		switch (key) {
			case 'feu':
			case 'fire':
				return `<img src="${getImgURL('elements', 'elem_fire')}" alt="feu">`;
			case 'bois':
			case 'wood':
				return `<img src="${getImgURL('elements', 'elem_wood')}" alt="bois">`;
			case 'eau':
			case 'water':
				return `<img src="${getImgURL('elements', 'elem_water')}" alt="eau">`;
			case 'foudre':
			case 'lightning':
				return `<img src="${getImgURL('elements', 'elem_lightning')}" alt="foudre">`;
			case 'air':
				return `<img src="${getImgURL('elements', 'elem_air')}" alt="air">`;
			case 'neutre':
			case 'void':
				return `<img src="${getImgURL('elements', 'elem_void')}" alt="pmo">`;
			case 'right':
				return `<img src="${getImgURL('icons', 'small_right')}" alt="pmo">`;
			case 'gold':
				return `<img src="${getImgURL('icons', 'gold')}" alt="gold">`;
			case 'ticket':
				return `<img class="text-icon" src="${getImgURL('icons', 'ticket')}" alt="ticket">`;
			case 'chrono':
				return `<img class="text-icon" src="${getImgURL('icons', 'small_chrono')}" alt="chrono">`;
			case 'attack':
				return `<img class="text-icon" src="${getImgURL('specialStats', 'counter')}" alt="attack">`;
			case 'defense':
				return `<img class="text-icon" src="${getImgURL('specialStats', 'armor')}" alt="defense">`;
			case 'hp':
				return `<img class="text-icon" src="${getImgURL('specialStats', 'hpRegen')}" alt="hp">`;
			case 'pv':
				return `<img class="text-icon" src="${getImgURL('icons', 'small_pv')}" alt="pv">`;
			case 'xp':
				return `<img class="text-icon" src="${getImgURL('icons', 'small_xp')}" alt="xp">`;
			case 'irma':
				return `<img class="text-icon" src="${getImgURL('item', 'item_irma')}" alt="irma">`;
			case 'napo':
				return `<img class="text-icon" src="${getImgURL('item', 'item_golden_napodino')}" alt="napo">`;
			case 'xmas_ticket':
				return `<img class="text-icon" src="${getImgURL('item', 'item_christmas_ticket')}" alt="xmas_ticket">`;
			case 'demon_ticket':
				return `<img class="text-icon" src="${getImgURL('item', 'item_demon_ticket')}" alt="demon_ticket">`;
			case 'xmas_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_christmas_egg')}" alt="xmas_egg">`;
			case 'santaz_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_santaz_egg')}" alt="santaz_egg">`;
			case 'santaz_rare_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_santaz_egg_rare')}" alt="santaz_rare_egg">`;
			case 'feross_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_feross_egg')}" alt="feross_egg">`;
			case 'feross_xmas_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_feross_egg_christmas')}" alt="feross_xmas_egg">`;
			case 'kabuki_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_kabuki_egg')}" alt="kabuki_egg">`;
			case 'mahamuti_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_mahamuti_egg')}" alt="mahamuti_egg">`;
			case 'quetzu_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_quetzu_egg')}" alt="quetzu_egg">`;
			case 'smog_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_smog_egg')}" alt="smog_egg">`;
			case 'easter_egg':
				return `<img class="text-icon" src="${getImgURL('item', 'item_easter_egg')}" alt="easter_egg">`;
			case 'triceragnon_baby':
				return `<img class="text-icon" src="${getImgURL('item', 'item_triceragnon_baby')}" alt="triceragnon_baby">`;
			case 'cup1':
				return `<img class="text-icon" src="${getImgURL('status', 'fx_cup1')}" alt="cup1">`;
			case 'conts1':
				return `<img class="text-icon" src="${getImgURL('status', 'fx_conts1')}" alt="conts1">`;
			default:
				throw Error(`Unexpected key for replaced image: ${key}`);
		}
	}
};

/**
 * Formats text with custom markup into HTML.
 * Note: This function only uses one regex pass per textual format to improve performance.
 */
export function formatText(text: string): string {
	// Combined pattern for all text formatting tokens:
	//                      **bold**         //italic//       _underline_   &&   :icon:
	const pattern = /(?:\*\*([^*]+)\*\*)|(?:\/\/([^/]+)\/\/)|(?:_([^_]+)_)|(&&)|:(\w+):/g;

	return text.replace(pattern, (match, boldContent, italicContent, emContent, lineBreak, iconKey) => {
		if (boldContent) return `<strong>${formatText(boldContent)}</strong>`;
		if (emContent) return `<em>${formatText(emContent)}</em>`;
		if (italicContent) return `<i>${formatText(italicContent)}</i>`;
		if (lineBreak) return '<br>';
		if (iconKey) {
			const validKeys = [
				'feu',
				'fire',
				'bois',
				'wood',
				'eau',
				'water',
				'foudre',
				'lightning',
				'air',
				'neutre',
				'void',
				'right',
				'gold',
				'ticket',
				'chrono',
				'attack',
				'defense',
				'hp',
				'pv',
				'xp',
				'irma',
				'napo',
				'xmas_ticket',
				'demon_ticket',
				'xmas_egg',
				'santaz_egg',
				'santaz_rare_egg',
				'feross_egg',
				'feross_xmas_egg',
				'kabuki_egg',
				'mahamuti_egg',
				'quetzu_egg',
				'smog_egg',
				'easter_egg',
				'triceragnon_baby',
				'cup1',
				'conts1'
			];
			if (validKeys.includes(iconKey)) {
				return helpers.computeImageHtml(iconKey);
			}
		}
		return match; // fallback for unrecognized tokens
	});
}

export function formatNumber(num: number, separator: string): string {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

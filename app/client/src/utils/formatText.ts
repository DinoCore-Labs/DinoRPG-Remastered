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
				return `<img src="${getImgURL('icons', 'ticket', true)}" alt="ticket">`;
			case 'chrono':
				return `<img src="${getImgURL('design', 'small_chrono')}" alt="chrono">`;
			case 'attack':
				return `<img src="${getImgURL('specialStats', 'counter')}" alt="attack">`;
			case 'defense':
				return `<img src="${getImgURL('specialStats', 'armor')}" alt="defense">`;
			case 'hp':
				return `<img src="${getImgURL('specialStats', 'hpRegen')}" alt="hp">`;
			case 'pv':
				return `<img src="${getImgURL('icons', 'small_pv')}" alt="pv">`;
			case 'xp':
				return `<img src="${getImgURL('icons', 'small_xp')}" alt="xp">`;
			case 'irma':
				return `<img class="text-icon" src="${getImgURL('item', 'item_irma')}" alt="irma">`;
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
				'irma'
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

export function beautifulNumber(value: number): string {
	const normal = spaceFormat(value);

	// Si ça dépasse → format compact
	if (isTooWide(normal)) {
		return compactFormat(value);
	}

	return normal;
}

function spaceFormat(value: number): string {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function compactFormat(value: number): string {
	const ranges = [
		{ divider: 1e33, suffix: 'Dc' }, // decillion
		{ divider: 1e30, suffix: 'No' }, // nonillion
		{ divider: 1e27, suffix: 'Oc' }, // octillion
		{ divider: 1e24, suffix: 'Sp' }, // septillion
		{ divider: 1e21, suffix: 'Sx' }, // sextillion
		{ divider: 1e18, suffix: 'Qi' }, // quintillion
		{ divider: 1e15, suffix: 'Qa' }, // quadrillion
		{ divider: 1e12, suffix: 'T' }, // trillion
		{ divider: 1e9, suffix: 'B' }, // billion
		{ divider: 1e6, suffix: 'M' }, // million
		{ divider: 1e3, suffix: 'K' } // thousand
	];

	for (const r of ranges) {
		if (value >= r.divider) {
			return (value / r.divider).toFixed(1).replace(/\.0$/, '') + r.suffix;
		}
	}

	return value.toString();
}

function isTooWide(text: string): boolean {
	const moneyEl = document.querySelector('.money');
	if (!moneyEl) return false;

	// Création d’un clone invisible pour mesurer
	const clone = document.createElement('div');
	clone.className = moneyEl.className;
	clone.style.position = 'absolute';
	clone.style.visibility = 'hidden';
	clone.style.whiteSpace = 'nowrap';
	clone.style.width = 'auto';

	// IMPORTANT : ajouter aussi l’icône car elle prend de la place !
	clone.innerHTML = `${text}<img src="${moneyEl.querySelector('img')?.src}" />`;

	document.body.appendChild(clone);
	const width = clone.offsetWidth;
	clone.remove();

	return width > 100;
}

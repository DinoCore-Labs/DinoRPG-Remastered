const weightedRandom = <T extends { odds: number }>(items: T[]) => {
	const totalOdds = items.reduce((acc, item) => acc + item.odds, 0);
	if (totalOdds === 0) {
		return items[0];
	}
	let i = 0;
	const weights: number[] = [];
	for (i = 0; i < items.length; i++) {
		weights[i] = items[i].odds / totalOdds + (weights[i - 1] || 0);
	}

	const random = Math.random() * weights[weights.length - 1];

	for (i = 0; i < weights.length; i++) {
		if (weights[i] > random) {
			break;
		}
	}

	return items[i];
};

export default weightedRandom;

export function parseDinozDisplay(display: string) {
	return {
		raceCode: display.slice(0, 2),
		seed: display.slice(2, 13),
		palette: display.slice(13, 14),
		rare1: display.slice(14, 15),
		rare2: display.slice(15, 16)
	};
}

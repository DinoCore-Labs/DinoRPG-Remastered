export const dinozPlacement: Placement = {
	noFliped: {
		0: {
			baby: {
				top: 50,
				left: 47
			},
			adult: {
				top: 20,
				left: 22
			}
		},
		1: {
			baby: {
				top: 40,
				left: 60
			},
			adult: {
				top: 30,
				left: 65
			}
		}
	},
	fliped: {
		0: {
			baby: {
				top: 60,
				left: 137
			},
			adult: {
				top: 30,
				left: 162
			}
		},
		1: {
			baby: {
				top: 60,
				left: 130
			},
			adult: {
				top: 30,
				left: 130
			}
		}
	}
};

export interface Placement {
	noFliped: {
		[race: string]: {
			baby: {
				top: number;
				left: number;
			};
			adult: {
				top: number;
				left: number;
			};
		};
	};
	fliped: {
		[race: string]: {
			baby: {
				top: number;
				left: number;
			};
			adult: {
				top: number;
				left: number;
			};
		};
	};
}
